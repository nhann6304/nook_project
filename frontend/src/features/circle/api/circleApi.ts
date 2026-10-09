/**
 * Cửa giữa màn Bạn bè và server. HIỆN TẠI LÀ HÀNG GIẢ (dữ liệu ở `mocks/people`).
 *
 * Khi backend có đường góc bạn bè: chỉ thay ruột các hàm này, màn hình không
 * đổi. Tìm trên Nook CHỈ theo @tên riêng — tìm theo tên hiện là cho người lạ rà
 * cả kho người dùng bằng vài chữ cái. Lọc theo tên chỉ làm với người đã trong góc.
 */
import { translate } from '@i18n';
import { PEOPLE } from '@/mocks/people';
import type { Person } from '../types';
import { fold, matches } from '@/lib/text/fold';

export type SearchResult = { ok: true; people: Person[] } | { ok: false; message: string };
export type ActionResult = { ok: true } | { ok: false; message: string };

/** Gõ ít hơn thế thì chưa hỏi server — "a" khớp nửa kho tên. */
export const MIN_QUERY = 2;
const FAKE_DELAY = 450;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const known = (id: string) => PEOPLE.some((p) => p.id === id);
const failed = (): ActionResult => ({ ok: false, message: translate('friends.search.failed') });

export async function searchPeople(query: string): Promise<SearchResult> {
  await wait(FAKE_DELAY);
  if (fold(query).length < MIN_QUERY) return { ok: true, people: [] };
  return { ok: true, people: PEOPLE.filter((p) => matches(query, p.username)) };
}

export async function sendFriendRequest(personId: string): Promise<ActionResult> {
  await wait(FAKE_DELAY);
  return known(personId) ? { ok: true } : failed();
}

export async function acceptRequest(personId: string): Promise<ActionResult> {
  await wait(FAKE_DELAY);
  return known(personId) ? { ok: true } : failed();
}

export async function declineRequest(personId: string): Promise<ActionResult> {
  await wait(FAKE_DELAY);
  return known(personId) ? { ok: true } : failed();
}
