/**
 * Cửa "Tìm quanh đây". HIỆN TẠI LÀ HÀNG GIẢ (dữ liệu ở `mocks/people`).
 *
 * Luật cho server khi làm thật — đây là chỗ dễ biến thành công cụ theo dõi:
 *   · chỉ người CŨNG đang bật mới thấy nhau; tắt màn là biến mất (`leave`);
 *   · vị trí giữ trong Redis tối đa `ACTIVE_SECONDS`, không ghi xuống bảng nào;
 *   · KHÔNG BAO GIỜ trả toạ độ hay số mét — chỉ trả nấc (`dưới 200 m`);
 *   · trần số lần gọi theo người, kẻo ai đó đổi vị trí giả để dò người khác.
 */
import { PEOPLE, NEARBY } from '@/mocks/people';
import type { Person } from '@/features/circle/types';

/** Bán kính người dùng chọn, mét. */
export const RADII = [100, 200, 300, 1000, 3000] as const;
export type Radius = (typeof RADII)[number];

/** Bật một lần hiện bạn trong chừng này giây, rồi tự tắt. */
export const ACTIVE_SECONDS = 300;

export type NearbyPerson = Person & { within: Radius };
export type NearbyResult = { ok: true; people: NearbyPerson[] } | { ok: false };

const FAKE_DELAY = 700;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Nấc nhỏ nhất chứa khoảng cách — thứ duy nhất người kia được biết. */
const bucket = (meters: number): Radius => RADII.find((r) => meters <= r) ?? 3000;

/** Gửi vị trí (đã làm tròn) và lấy người quanh đây trong bán kính. */
export async function announce(
  _at: { latitude: number; longitude: number },
  radius: Radius,
): Promise<NearbyResult> {
  await wait(FAKE_DELAY);
  const people = NEARBY.filter((n) => n.meters <= radius).flatMap((n) => {
    const p = PEOPLE.find((x) => x.id === n.id);
    return p ? [{ ...p, within: bucket(n.meters) }] : [];
  });
  return { ok: true, people };
}

/** Thôi hiện mình với người quanh đây. */
export async function leave(): Promise<void> {
  await wait(0);
}

/** Làm tròn ~11 m trước khi rời máy — đủ cho bán kính 100 m, không đủ để chỉ ra cửa nhà. */
export function coarse(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}
