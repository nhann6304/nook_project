/**
 * Mấy mảnh mà bản ghi nào cũng có. Ghép lại, đừng chép lại.
 *
 *   export interface MomentDto extends IIdentified, ITimestamps { caption: string }
 *
 * Vì sao đáng tách ra: `id`, `createdAt` được gõ lại ở mọi DTO, và gõ lại thì
 * sẽ có chỗ gõ `created_at`, chỗ gõ `Date` thay vì chuỗi. Ghép từ đây thì
 * không có chỗ nào lệch được.
 *
 * Thời gian đi qua dây là **chuỗi ISO 8601**, không phải `Date`. JSON không có
 * kiểu ngày; `Date` bên này qua bên kia thành chuỗi, mà type vẫn ghi `Date` là
 * type nói dối.
 */
export interface IIdentified {
  /** UUID. Xem `UuidEntity` bên backend để biết vì sao không dùng số tự tăng. */
  id: string;
}

export interface ITimestamps {
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

/**
 * Ai tạo, ai sửa.
 *
 * Backend tự điền từ người đang gọi — không tầng nào phải chuyền tay id. Rỗng
 * là ĐÚNG với dòng do hệ thống tạo, hoặc dòng tạo ra trước khi biết người gọi
 * là ai (lúc mở tài khoản chẳng hạn).
 *
 * Chỉ đưa ra ngoài khi người xem THẬT SỰ được biết. Với Nook thì gần như không
 * bao giờ — luật sản phẩm khá kín, và "ai đã tạo" hay lộ nhiều hơn ta tưởng.
 */
export interface IAuditTrail extends ITimestamps {
  createdBy: string | null;
  updatedBy: string | null;
}

/** Bản ghi xoá mềm. `deletedAt` khác `null` nghĩa là đã bỏ. */
export interface ISoftDeleted {
  deletedAt: string | null;
}
