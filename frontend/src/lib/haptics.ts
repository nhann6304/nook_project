/**
 * Rung — một cửa duy nhất.
 *
 * Vì sao không gọi thẳng expo-haptics ở mỗi màn: rung là thứ dễ lạm dụng nhất.
 * Mỗi người thêm một nhịp, app thành cái máy massage và người dùng tắt rung
 * trong Cài đặt — mất luôn cả những nhịp thật sự cần.
 *
 * Ở đây rung được đặt tên theo VIỆC, không theo cường độ: gọi `tap()` chứ không
 * gọi `impactAsync(Light)`. Đổi cảm giác toàn app = sửa một chỗ.
 *
 * Mọi hàm đều nuốt lỗi: máy Android rẻ không có motor rung thì `Haptics` ném,
 * và không có lý do gì để một cú rung làm hỏng thao tác của người dùng.
 */
import * as Haptics from 'expo-haptics';

const quiet = (p: Promise<unknown>) => {
  void p.catch(() => {});
};

/** Chạm một nút thường. */
export const tap = () => quiet(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

/** Xác nhận một việc đã xảy ra: gửi xong, lưu xong. */
export const confirm = () => quiet(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));

/** Bấm nút chụp. Nhịp nặng nhất trong app, và là nhịp duy nhất được nặng. */
export const capture = () => quiet(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));

/** Đổi lựa chọn trong thanh chuyển. */
export const select = () => quiet(Haptics.selectionAsync());

/** Nhập sai. Đi kèm chữ báo lỗi, không bao giờ rung trống. */
export const reject = () => quiet(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));

/** Thành công lớn: lên cấp thân, người đầu tiên vào góc. */
export const success = () =>
  quiet(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
