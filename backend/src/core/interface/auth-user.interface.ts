/**
 * Người đang gọi, sau khi cổng thẻ đã mở thẻ ra và kiểm xong.
 *
 * Ở `core/` chứ không ở `api/auth/`, và bộ soi cây thư mục đã chỉ ra đúng chỗ
 * này: `@CurrentUser()` là decorator của khung, mà nó lại đi nhập một kiểu từ
 * tính năng — chiều phụ thuộc ngược.
 *
 * Nghĩ kỹ thì "ai đang gọi" đúng là chuyện của khung: bộ chặn cần biết, kho dữ
 * liệu cần biết để đóng dấu sổ ghi việc, bộ ghi log cần biết. Chuyện của
 * `api/auth/` là LÀM SAO biết được, chứ không phải cái biết đó là gì.
 *
 * Cố tình gầy. Cần tên hay ảnh thì đi hỏi bảng — nhét vào thẻ là nhét một bản
 * sao sẽ cũ đi, và mỗi lần đổi tên lại có một khoảng thời gian thẻ nói sai.
 */
export interface IAuthUser {
  /** id người dùng */
  id: string;
  /** id phiên — thu hồi được từng máy một */
  sessionId: string;
}
