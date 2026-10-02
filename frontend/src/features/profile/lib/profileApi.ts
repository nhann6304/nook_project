/**
 * Cửa lưu hồ sơ lúc mới vào. HIỆN TẠI LÀ HÀNG GIẢ.
 *
 * Khi nối server: ảnh tải lên qua đường đã ký trước (`/v1/media/upload-url`),
 * rồi `PATCH /v1/me` với `displayName`, `username`, `avatarMediaId`. Tên đã có
 * người lấy thì server trả `username.taken` — ở đây giả bằng danh sách dưới.
 */
import { translate } from '@i18n';
import { PEOPLE } from '@/mocks/people';

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
