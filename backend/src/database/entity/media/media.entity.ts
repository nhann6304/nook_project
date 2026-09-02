import { Column, Entity, Index } from 'typeorm';
import type { TMediaKind, TMediaStatus } from '@nook/shared';
import { AuditEntity } from '../base/index.js';

/**
 * Một tấm ảnh trong kho.
 *
 * ── Bản gốc giữ nguyên, mãi mãi ─────────────────────────────────────────────
 *
 * Dòng này trỏ tới **bản gốc**: đúng từng byte máy ảnh chụp ra, không thu nhỏ,
 * không nén lại, không đổi định dạng, và không có đường nào xoá nó. Đó là sản
 * phẩm — bóp ảnh của Nook thì Nook không còn là Nook.
 *
 * Bản nhẹ cho bảng tin và cho widget (chặng sau) là **dòng khác**, trỏ tới bản
 * sao dựng ra từ bản gốc. Bản sao xoá lúc nào cũng được vì dựng lại được.
 *
 * ── Ảnh này của ai ──────────────────────────────────────────────────────────
 *
 * `owner_id` là người tải lên. Nhưng **quyền xem không nằm ở bảng này** — nó
 * nằm ở chỗ tấm ảnh được gắn vào: ảnh đại diện thì người trong góc xem được,
 * ảnh khoảnh khắc thì chỉ những người khoảnh khắc đó gửi tới. Cùng một tấm
 * gắn vào hai chỗ là hai tập người xem khác nhau.
 *
 * Chép danh sách quyền vào đây là chép lại một sự thật đã nằm ở chỗ khác, và
 * hai bản chép thì sẽ có ngày lệch nhau.
 */
@Entity('media')
export class Media extends AuditEntity {
  @Index('idx_media_owner')
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @Column({ name: 'kind', type: 'varchar', length: 16 })
  kind!: TMediaKind;

  /**
   * `pending` cho tới khi server tự soi thấy tệp trong kho.
   *
   * Có trạng thái này vì bytes KHÔNG đi qua server: app tải thẳng lên kho, nên
   * giữa lúc xin đường và lúc tệp có thật là một khoảng server không biết gì.
   */
  @Index('idx_media_pending')
  @Column({ name: 'status', type: 'varchar', length: 16, default: 'pending' })
  status!: TMediaStatus;

  /** Đường trong thùng chứa. `original/<owner>/<id>.<đuôi>` */
  @Column({ name: 'storage_key', type: 'varchar', length: 255 })
  storageKey!: string;

  /**
   * Tấm này nằm ở kho NÀO: `minio` khi dev, `r2` khi thật.
   *
   * Ghi lại chứ không suy ra từ cấu hình hiện tại, và đây là chỗ đáng nói nhất
   * của cả bảng: ngày nào đổi kho, mọi ảnh cũ vẫn nằm ở kho cũ. Không có cột
   * này thì sau lần đổi đó server đi tìm ảnh cũ ở kho mới và không thấy —
   * **mất toàn bộ ảnh cũ**, mà mất ở đây là mất thật vì bản gốc không dựng lại
   * được.
   *
   * Có cột này thì đổi kho là: ghi mới vào kho mới, đọc cũ ở kho cũ, chép dần
   * sang lúc rảnh. Không phải dừng dịch vụ, không mất gì.
   */
  @Column({ name: 'storage_provider', type: 'varchar', length: 16 })
  storageProvider!: string;

  @Column({ name: 'content_type', type: 'varchar', length: 64 })
  contentType!: string;

  /**
   * `integer` chứ không phải `bigint`, cố ý: driver Postgres trả `bigint` về
   * dạng CHUỖI, nên `row.byteSize + 1` ra `"12341"` — sai mà không ai báo.
   * Trần một tệp là 32MB, thừa chỗ trong `integer`.
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
