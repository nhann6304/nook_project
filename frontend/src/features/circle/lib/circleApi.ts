/**
 * Cửa giữa màn Bạn bè và server. HIỆN TẠI LÀ HÀNG GIẢ (dữ liệu ở `mocks/people`).
 *
 * Khi backend có đường tìm người + gửi lời mời: chỉ thay ruột hai hàm này,
 * màn hình không đổi. Server phải tự lọc người đã chặn mình và người đã ở
 * trong góc — app không được là chỗ duy nhất giữ luật đó.
 */
import { translate } from '@i18n';
import { PEOPLE } from '@/mocks/people';
import type { Person } from '../types';
import { fold, matches } from './fold';

export type SearchResult = { ok: true; people: Person[] } | { ok: false; message: string };
export type RequestResult = { ok: true } | { ok: false; message: string };

/** Gõ ít hơn thế thì chưa hỏi server — "a" khớp nửa thế giới. */
export const MIN_QUERY = 2;
const FAKE_DELAY = 450;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function searchPeople(query: string): Promise<SearchResult> {
  await wait(FAKE_DELAY);
  if (fold(query).length < MIN_QUERY) return { ok: true, people: [] };
  return { ok: true, people: PEOPLE.filter((p) => matches(query, p.name, p.username)) };
}

export async function sendFriendRequest(personId: string): Promise<RequestResult> {
  await wait(FAKE_DELAY);
  if (!PEOPLE.some((p) => p.id === personId)) {
    return { ok: false, message: translate('friends.search.failed') };
  }
  return { ok: true };
}
