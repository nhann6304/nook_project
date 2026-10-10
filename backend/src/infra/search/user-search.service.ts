import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { UserRepository } from '../../repository/index.js';
import { QUEUE, type IIndexUserJob } from '../../queue/constant/index.js';
import { SearchService } from './search.service.js';
import {
  USER_INDEX,
  USER_INDEX_BODY,
  USER_INDEX_VERSION,
  toUserSearchDoc,
  type IUserSearchDoc,
} from './user-search.index.js';

export interface IUserSearchHit extends IUserSearchDoc {
  id: string;
}

/** Một mẻ của lệnh dựng lại. */
const REINDEX_BATCH = 500;

/**
 * Tìm người theo tên. Postgres là NGUỒN THẬT; Elasticsearch chỉ là bản sao.
 *
 * Ghi: hồ sơ đổi -> bỏ việc vào hàng đợi `search` -> `UserSearchProcessor` đọc
 * lại từ Postgres rồi ghi. Không ghi thẳng trong đường request: ES chập thì
 * BullMQ thử lại, người dùng không phải chờ.
 *
 * Đọc: ES trước; tắt hoặc hỏng thì lùi về Postgres (`searchByPrefix`).
 */
@Injectable()
export class UserSearchService implements OnApplicationBootstrap {
  private readonly log = new Logger('UserSearch');
  /** Chỉ mục đã chắc có chưa. Ghi khi chưa có là ES tự đẻ chỉ mục với mapping đoán mò. */
  private indexReady = false;

  constructor(
    private readonly search: SearchService,
    private readonly users: UserRepository,
    @InjectQueue(QUEUE.search) private readonly queue: Queue<IIndexUserJob>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.search.enabled) return;
    // ES chưa lên kịp không được làm server chết — tìm kiếm có đường lùi.
    await this.ensureIndex().catch((e: Error) =>
      this.log.warn(`index setup skipped: ${e.message}`),
    );
  }

  /** Báo "hồ sơ người này vừa đổi". Hỏng thì chỉ ghi log: hồ sơ đã lưu xong rồi. */
  async enqueue(userId: string): Promise<void> {
    if (!this.search.enabled) return;
    await this.queue
      .add(QUEUE.job.indexUser, { userId })
      .catch((e: Error) => this.log.warn(`enqueue failed for ${userId}: ${e.message}`));
  }

  /** Chép một người từ Postgres sang ES. Đã xoá hoặc chưa có tên riêng thì gỡ khỏi chỉ mục. */
  async sync(userId: string): Promise<void> {
    const es = this.search.client;
    if (!es) return;

    await this.ensureIndex();
    const user = await this.users.findById(userId, { withDeleted: true });
    const doc = user ? toUserSearchDoc(user) : null;
    if (doc) {
      await es.index({ index: USER_INDEX, id: userId, document: doc });
    } else {
      await es.delete({ index: USER_INDEX, id: userId }, { ignore: [404] });
    }
  }

  async find(query: string, limit: number): Promise<IUserSearchHit[]> {
    const q = query.trim();
    if (!q) return [];

    const es = this.search.client;
    if (es) {
      try {
        const res = await es.search<IUserSearchDoc>({
          index: USER_INDEX,
          size: limit,
          query: {
            bool: {
              should: [
                { term: { 'username.raw': { value: q.toLowerCase(), boost: 10 } } },
                { match: { username: { query: q, boost: 3 } } },
                { match: { displayName: { query: q, operator: 'and' } } },
              ],
              minimum_should_match: 1,
            },
          },
        });
        return res.hits.hits.flatMap((h) =>
          h._source && h._id ? [{ id: h._id, ...h._source }] : [],
        );
      } catch (e) {
        this.log.warn(`search fell back to Postgres: ${(e as Error).message}`);
      }
    }

    const rows = await this.users.searchByPrefix(q, limit);
    return rows.flatMap((u) => {
      const doc = toUserSearchDoc(u);
      return doc ? [{ id: u.id, ...doc }] : [];
    });
  }

  /** Tạo chỉ mục + alias nếu chưa có. Nhiều bản api cùng bật thì một bản thắng, bản kia bỏ qua. */
  async ensureIndex(): Promise<void> {
    const es = this.search.client;
    if (!es || this.indexReady) return;
    if (!(await es.indices.exists({ index: USER_INDEX }))) {
      await es.indices.create(
        { index: USER_INDEX_VERSION, ...USER_INDEX_BODY, aliases: { [USER_INDEX]: {} } },
        { ignore: [400] },
      );
    }
    this.indexReady = true;
  }

  /** Dựng lại toàn bộ từ Postgres. `recreate` xoá chỉ mục cũ trước (đổi mapping). */
  async reindex(recreate: boolean): Promise<number> {
    const es = this.search.client;
    if (!es) throw new Error('SEARCH_ENABLED=false');

    if (recreate) {
      await es.indices.delete({ index: USER_INDEX_VERSION }, { ignore: [404] });
      this.indexReady = false;
    }
    await this.ensureIndex();

    let after: string | null = null;
    let total = 0;
    for (;;) {
      const batch = await this.users.searchablePage(after, REINDEX_BATCH);
      if (batch.length === 0) break;

      const operations = batch.flatMap((u) => {
        const doc = toUserSearchDoc(u);
        return doc ? [{ index: { _index: USER_INDEX, _id: u.id } }, doc] : [];
      });
      const res = await es.bulk({ operations, refresh: false });
      if (res.errors) throw new Error('bulk indexing reported errors');

      total += batch.length;
      after = batch[batch.length - 1]!.id;
    }
    await es.indices.refresh({ index: USER_INDEX });
    return total;
  }
}
