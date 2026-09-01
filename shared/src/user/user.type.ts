/**
 * Hồ sơ của CHÍNH MÌNH.
 *
 * Chưa có hình dạng "hồ sơ người khác". Tới chặng góc bạn bè mới có, và nó phải
 * là một kiểu KHÁC, hẹp hơn — luật sản phẩm cấm trả cấp thân của người khác cho
 * người thứ ba.
 */
export interface UserProfile {
  id: string;
  /** `null` khi vừa mở tài khoản, chưa qua màn đặt tên */
  displayName: string | null;
  /** Đường dẫn ảnh đầy đủ, đã ký sẵn. `null` khi chưa có ảnh */
  avatarUrl: string | null;
  /** Đã qua màn Tên + ảnh chưa. App dựa vào đây để quyết định đi tiếp hay không */
  onboarded: boolean;
  /** ISO 8601 */
  createdAt: string;
}

export interface UpdateMeBody {
  /** 1–24 ký tự sau khi cắt khoảng trắng hai đầu */
  displayName?: string;
}
