import { PrimaryGeneratedColumn } from 'typeorm';

/**
 * Bảng có khoá chính là UUID. Bậc thấp nhất của cái thang.
 *
 * UUID chứ không phải số tự tăng, ba lý do:
 *
 * 1. Số tự tăng nói ra thứ mà nó không nên nói. `/users/1` và `/users/2` là
 *    hai người đầu tiên; ai cũng đoán được app có bao nhiêu người dùng và họ
 *    vào lúc nào. Với Nook — một app về chuyện riêng tư giữa vài người — đó là
 *    một chỗ rò không cần thiết.
 * 2. Id sinh được ở CHỖ NÀO CŨNG ĐƯỢC, không phải chờ cơ sở dữ liệu trả về.
 *    Cần thiết khi một giao dịch phải biết id trước lúc ghi.
 * 3. Gộp dữ liệu từ hai nơi không bị đụng id.
 *
 * `gen_random_uuid()` có sẵn trong Postgres từ bản 13, không cần cài thêm gì.
 */
export abstract class UuidEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
