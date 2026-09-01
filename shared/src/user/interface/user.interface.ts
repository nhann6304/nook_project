import type { IIdentified } from '../../record/interface/index.js';
import type { TUserRole } from '../type/index.js';

/**
 * Hồ sơ của CHÍNH MÌNH.
 *
 * Chưa có hình dạng "hồ sơ người khác". Tới chặng góc bạn bè mới có, và nó phải
 * là một kiểu KHÁC, hẹp hơn — luật sản phẩm cấm trả cấp thân của người khác cho
 * người thứ ba.
 */
export interface IUserProfile extends IIdentified {
  /** `null` khi vừa mở tài khoản, chưa qua màn đặt tên */
  displayName: string | null;
  /** Đường dẫn ảnh đầy đủ, đã ký sẵn. `null` khi chưa có ảnh */
  avatarUrl: string | null;
  /** Đã qua màn Tên + ảnh chưa. App dựa vào đây để quyết định đi tiếp hay không */
  onboarded: boolean;
  /**
   * Vai trong hệ thống. App không dùng tới; trang quản trị trên web thì cần —
   * và cả hai cùng gọi `GET /v1/me`, nên để ở đây thay vì đẻ thêm một cửa nữa.
   */
  role: TUserRole;

  /** ISO 8601 */
  createdAt: string;
}

export interface IUpdateMeBody {
  /** 1–24 ký tự sau khi cắt khoảng trắng hai đầu */
  displayName?: string;
}
