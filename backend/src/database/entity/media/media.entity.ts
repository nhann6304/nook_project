import { Column, Entity, Index } from 'typeorm';
import type { TMediaKind, TMediaStatus } from '@nook/shared';
import { AuditEntity } from '../base/index.js';

/**
 * Một tấm ảnh trong kho — dòng này trỏ tới **bản gốc**, đúng từng byte, không
 * có đường nào xoá. Bản nhẹ là dòng khác, dựng lại được nên xoá lúc nào cũng được.
 *
 * `owner_id` là người tải lên, nhưng QUYỀN XEM không nằm ở bảng này — nó nằm ở
 * chỗ tấm ảnh được gắn vào. Chép danh sách quyền vào đây là chép lại một sự
 * thật đã có chỗ khác, rồi hai bản sẽ lệch nhau.
 */
@Entity('media')
export class Media extends AuditEntity {
  @Index('idx_media_owner')
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @Column({ name: 'kind', type: 'varchar', length: 16 })
  kind!: TMediaKind;

  /**
   * `pending` cho tới khi server tự soi thấy tệp. Cần trạng thái này vì bytes
   * KHÔNG đi qua server — app tải thẳng lên kho.
   */
  @Index('idx_media_pending')
  @Column({ name: 'status', type: 'varchar', length: 16, default: 'pending' })
  status!: TMediaStatus;

  /** Đường trong thùng chứa. `original/<owner>/<id>.<đuôi>` */
  @Column({ name: 'storage_key', type: 'varchar', length: 255 })
  storageKey!: string;

  /**
   * Tấm này nằm ở kho NÀO. Ghi lại chứ không suy từ cấu hình hiện tại: ngày đổi
   * kho, ảnh cũ vẫn ở kho cũ. Không có cột này là server tìm ảnh cũ ở kho mới,
   * không thấy, và mất thật — bản gốc không dựng lại được.
   */
  @Column({ name: 'storage_provider', type: 'varchar', length: 16 })
  storageProvider!: string;

  @Column({ name: 'content_type', type: 'varchar', length: 64 })
  contentType!: string;

  /**
   * `integer` chứ không `bigint`: driver trả `bigint` về dạng CHUỖI, nên
   * `byteSize + 1` ra `"12341"` — sai mà không ai báo. Trần 32MB thừa chỗ.
   */
  @Column({ name: 'byte_size', type: 'integer' })
  byteSize!: number;

  @Column({ name: 'width', type: 'integer', nullable: true })
  width!: number | null;

  @Column({ name: 'height', type: 'integer', nullable: true })
  height!: number | null;

  @Column({ name: 'ready_at', type: 'timestamptz', nullable: true })
  readyAt!: Date | null;
}
