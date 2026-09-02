import { Column, Entity, Index, Unique } from 'typeorm';
import type { TMediaStatus, TMediaVariant } from '@nook/shared';
import { AuditEntity } from '../base/index.js';

/**
 * Bản nhẹ dựng ra từ bản gốc.
 *
 * ── Vì sao là bảng RIÊNG, không phải cột thêm vào `media` ───────────────────
 *
 * Vì hai thứ có **vòng đời khác hẳn nhau**. Bản gốc: tải lên một lần, giữ mãi
 * mãi, không xoá được. Bản nhẹ: dựng ở việc nền, có thể hỏng, dựng lại được,
 * xoá lúc nào cũng được, và mai mốt đổi kích thước là dựng lại toàn bộ.
 *
 * Nhét chúng thành cột `feed_key`, `thumb_key` trên bảng `media` thì thêm một
 * cỡ mới là thêm một cột, và không có chỗ nào ghi được "bản này đang dựng dở"
 * hay "bản này dựng hỏng". Một dòng cho một bản thì có đủ.
 *
 * `UNIQUE(media_id, variant)` là chốt thật cho chuyện việc nền chạy hai lần —
 * hàng đợi có thể giao cùng một việc hai lần, đó là chuyện bình thường.
 */
@Entity('media_variants')
@Unique('uq_variant_media_kind', ['mediaId', 'variant'])
export class MediaVariant extends AuditEntity {
  @Index('idx_variant_media')
  @Column({ name: 'media_id', type: 'uuid' })
  mediaId!: string;

  @Column({ name: 'variant', type: 'varchar', length: 16 })
  variant!: TMediaVariant;

  @Column({ name: 'status', type: 'varchar', length: 16, default: 'pending' })
  status!: TMediaStatus;

  @Column({ name: 'storage_key', type: 'varchar', length: 255 })
  storageKey!: string;

  @Column({ name: 'storage_provider', type: 'varchar', length: 16 })
  storageProvider!: string;

  @Column({ name: 'content_type', type: 'varchar', length: 64 })
  contentType!: string;

  @Column({ name: 'byte_size', type: 'integer' })
  byteSize!: number;

  @Column({ name: 'width', type: 'integer' })
  width!: number;

  @Column({ name: 'height', type: 'integer' })
  height!: number;
}
