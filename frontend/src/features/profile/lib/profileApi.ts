/**
 * Cửa hồ sơ: lưu hồ sơ lúc mới vào, xem trang người khác, khoá trang mình.
 * HIỆN TẠI LÀ HÀNG GIẢ.
 *
 * Khi nối server: ảnh tải lên qua đường đã ký trước (`/v1/media/upload-url`),
 * rồi `PATCH /v1/me` với `displayName`, `username`, `avatarMediaId`. Tên đã có
 * người lấy thì server trả `username.taken` — ở đây giả bằng danh sách dưới.
 */
import { translate } from '@i18n';
import { FRIENDS } from '@/mocks/friends';
import { LOCKED_PROFILES, MUTUAL_FRIENDS, PEOPLE } from '@/mocks/people';

export type ProfileInput = { name: string; username: string; avatarUri: string | null };
export type SaveResult = { ok: true } | { ok: false; field: 'username' | 'form'; message: string };

const FAKE_DELAY = 600;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function saveProfile(input: ProfileInput): Promise<SaveResult> {
  await wait(FAKE_DELAY);
  if (PEOPLE.some((p) => p.username === input.username)) {
    return { ok: false, field: 'username', message: translate('profile.taken') };
  }
  return { ok: true };
}

/**
 * Trang cá nhân người khác nhìn thấy. KHÔNG có cấp thân, không con đếm —
 * cấp thân chỉ hai người trong cặp thấy, và nó nằm ở trang riêng của cặp.
 *
 * Khoá trang: người ngoài góc của họ chỉ thấy tên, ảnh, @tên. SERVER là bên
 * cắt bớt — app không được nhận đủ rồi tự giấu.
 */
export type PersonProfile = {
  id: string;
  name: string;
  username: string;
  uri?: string;
  locked: boolean;
  /** Có khi trang không khoá, hoặc người xem là bạn của họ. */
  joinedAt?: number;
  /** Tên bạn chung. Cùng luật như `joinedAt`. */
  mutual?: readonly string[];
};

export type PersonResult = { ok: true; person: PersonProfile } | { ok: false; message: string };
export type ActionResult = { ok: true } | { ok: false; message: string };

const DAY = 86_400_000;
/** `viewerIsFriend`: người xem đã chung góc với người này — thấy đủ dù trang khoá. */
export async function getPerson(id: string, viewerIsFriend: boolean): Promise<PersonResult> {
  await wait(FAKE_DELAY / 2);
  const found = [...FRIENDS, ...PEOPLE].find((p) => p.id === id);
  if (!found) return { ok: false, message: translate('person.notFound') };
  const locked = LOCKED_PROFILES.has(id);
  const base = { id, name: found.name, username: found.username, uri: found.uri, locked };
  if (locked && !viewerIsFriend) return { ok: true, person: base };
  return {
    ok: true,
    person: {
      ...base,
      joinedAt: Date.now() - (40 + id.length * 30) * DAY,
      mutual: MUTUAL_FRIENDS[id] ?? [],
    },
  };
}

export async function setProfileLocked(_locked: boolean): Promise<ActionResult> {
  await wait(FAKE_DELAY / 2);
  return { ok: true };
}
