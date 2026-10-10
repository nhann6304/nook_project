import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { Env } from '../../config/env/index.js';

/** ES chậm thì lùi về Postgres, đừng bắt người dùng chờ. */
const ES_TIMEOUT_MS = 3_000;

/**
 * Một kết nối Elasticsearch cho cả server. `client` là `null` khi
 * `SEARCH_ENABLED=false` — bên dùng hỏi `enabled` trước.
 */
@Injectable()
export class SearchService implements OnModuleDestroy {
  readonly enabled: boolean;
  readonly client: Client | null;
  private readonly log = new Logger('Search');

  constructor(config: ConfigService<Env, true>) {
    this.enabled = config.get('SEARCH_ENABLED', { infer: true });
    this.client = this.enabled
      ? new Client({
          node: config.get('ELASTIC_URL', { infer: true }),
          auth: {
            username: config.get('ELASTIC_USERNAME', { infer: true }),
            password: config.get('ELASTIC_PASSWORD', { infer: true }) ?? '',
          },
          requestTimeout: ES_TIMEOUT_MS,
          maxRetries: 1,
        })
      : null;
    if (this.enabled) this.log.log('Elasticsearch enabled');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.close();
  }
}
