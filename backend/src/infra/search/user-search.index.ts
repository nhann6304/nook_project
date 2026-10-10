import type { estypes } from '@elastic/elasticsearch';
import type { User } from '../../database/entity/index.js';

/**
 * Alias chứ không phải tên chỉ mục thật: đổi mapping thì dựng chỉ mục mới
 * (`users_v2`) rồi chuyển alias, không phải xoá rồi chờ dựng lại.
 */
export const USER_INDEX = 'users';
export const USER_INDEX_VERSION = 'users_v1';

/**
 * CHỈ ba thứ ai cũng được thấy: tên riêng, tên hiển thị, ảnh. Không email, không
 * số điện thoại, không cấp thân — chỉ mục là bản sao, lộ ở đây là lộ ở mọi nơi
 * tìm kiếm trả về.
 */
export interface IUserSearchDoc {
  username: string;
  displayName: string | null;
  avatarMediaId: string | null;
}

export function toUserSearchDoc(user: User): IUserSearchDoc | null {
  if (user.deletedAt || !user.username) return null;
  return {
    username: user.username,
    displayName: user.displayName,
    avatarMediaId: user.avatarMediaId,
  };
}

/**
 * Tiếng Việt không cần plugin ICU: `asciifolding` bỏ dấu (cả "đ" -> "d") nên
 * "duc" ra "Đức"; `edge_ngram` lúc ghi để gõ "ng" là ra "Nguyễn" mà không cần
 * truy vấn `prefix` (chậm). Lúc tìm thì KHÔNG ngram — không thì "ng" khớp mọi thứ.
 */
export const USER_INDEX_BODY = {
  settings: {
    number_of_shards: 1,
    // Một nút thì bản sao không có chỗ đặt (cụm vàng mãi). Thêm nút thì tăng.
    number_of_replicas: 0,
    analysis: {
      filter: {
        prefix_grams: { type: 'edge_ngram', min_gram: 1, max_gram: 20 },
      },
      analyzer: {
        name_index: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'prefix_grams'],
        },
        name_search: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
        username_index: {
          type: 'custom',
          tokenizer: 'keyword',
          filter: ['lowercase', 'asciifolding', 'prefix_grams'],
        },
        username_search: {
          type: 'custom',
          tokenizer: 'keyword',
          filter: ['lowercase', 'asciifolding'],
        },
      },
    },
  },
  mappings: {
    dynamic: 'strict',
    properties: {
      username: {
        type: 'text',
        analyzer: 'username_index',
        search_analyzer: 'username_search',
        fields: { raw: { type: 'keyword' } },
      },
      displayName: { type: 'text', analyzer: 'name_index', search_analyzer: 'name_search' },
      avatarMediaId: { type: 'keyword', index: false },
    },
  },
} satisfies Omit<estypes.IndicesCreateRequest, 'index'>;
