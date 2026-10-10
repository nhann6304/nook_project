import { describe, expect, it, vi } from 'vitest';
import { UserSearchService } from './user-search.service.js';

/**
 * Postgres là nguồn thật: ES tắt hay hỏng thì tìm kiếm vẫn trả kết quả, và
 * không có gì ngoài ba trường công khai lọt ra.
 */
const ROW = {
  id: 'u1',
  username: 'ducnguyen',
  displayName: 'Nguyễn Đức',
  avatarMediaId: null,
  deletedAt: null,
  role: 'member',
  locale: 'vi',
};

function build(client: unknown) {
  const users = { searchByPrefix: vi.fn(async () => [ROW]), findById: vi.fn(async () => ROW) };
  const queue = { add: vi.fn(async () => undefined) };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const any = (x: unknown) => x as any;
  const service = new UserSearchService(
    any({ enabled: client !== null, client }),
    any(users),
    any(queue),
  );
  return { service, users, queue };
}

describe('UserSearchService', () => {
  it('ES tắt: tìm bằng Postgres, không bỏ việc vào hàng đợi', async () => {
    const { service, users, queue } = build(null);
    expect(await service.find('duc', 10)).toEqual([
      { id: 'u1', username: 'ducnguyen', displayName: 'Nguyễn Đức', avatarMediaId: null },
    ]);
    expect(users.searchByPrefix).toHaveBeenCalledWith('duc', 10);
    await service.enqueue('u1');
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('ES hỏng: lùi về Postgres thay vì ném lỗi', async () => {
    const es = { search: vi.fn(async () => Promise.reject(new Error('connect ECONNREFUSED'))) };
    const { service, users } = build(es);
    const hits = await service.find('duc', 5);
    expect(hits.map((h) => h.id)).toEqual(['u1']);
    expect(users.searchByPrefix).toHaveBeenCalledOnce();
  });

  it('ES chạy: dùng kết quả của ES', async () => {
    const es = {
      search: vi.fn(async () => ({
        hits: {
          hits: [
            { _id: 'u9', _source: { username: 'an', displayName: 'An', avatarMediaId: null } },
          ],
        },
      })),
    };
    const { service, users } = build(es);
    expect(await service.find('an', 5)).toEqual([
      { id: 'u9', username: 'an', displayName: 'An', avatarMediaId: null },
    ]);
    expect(users.searchByPrefix).not.toHaveBeenCalled();
  });

  it('chỉ mục chỉ chứa ba trường công khai', async () => {
    const index = vi.fn(async () => ({}));
    const es = { index, indices: { exists: vi.fn(async () => true) } };
    const { service } = build(es);
    await service.sync('u1');
    expect(index).toHaveBeenCalledWith({
      index: 'users',
      id: 'u1',
      document: { username: 'ducnguyen', displayName: 'Nguyễn Đức', avatarMediaId: null },
    });
  });
});
