import { Injectable } from '@nestjs/common';
import { API, path, query, type TMediaVariant } from '@nook/shared';
import { BaseMapper } from '../../../core/mapper/base.mapper.js';
import { Media, MediaVariant } from '../../../database/entity/index.js';
import { MediaDto } from './media.dto.js';

@Injectable()
export class MediaMapper extends BaseMapper<Media, MediaDto> {
  /**
   * `variants` để rỗng khi gọi bản một tham số.
   *
   * Không tự đi hỏi bảng ở trong bộ nắn, cố ý: bộ nắn phải là hàm thuần, gọi
   * bao nhiêu lần cũng không tốn thêm gì. Bảng tin nắn 50 tấm mà mỗi lần nắn là
   * một câu truy vấn thì đó là 50 câu — chỗ gọi phải hỏi MỘT lần cho cả 50 rồi
   * đưa vào đây.
   */
  toDto(media: Media, variants: MediaVariant[] = []): MediaDto {
    return {
      id: media.id,
      ownerId: media.ownerId,
      kind: media.kind,
      status: media.status,
      contentType: media.contentType,
      byteSize: media.byteSize,
      width: media.width,
      height: media.height,
      // Đường của SERVER, cố ý. Đường đã ký của kho hết hạn sau vài phút, nên
      // để nó vào một câu trả lời mà app lưu lại là để một thứ hỏng sẵn.
      url: path(API.media.read, { id: media.id }),
      variants: Object.fromEntries(
        variants.map((v) => [
          v.variant,
          path(API.media.read, { id: media.id }) + query({ variant: v.variant }),
        ]),
      ) as Partial<Record<TMediaVariant, string>>,
      createdAt: media.createdAt.toISOString(),
    };
  }
}
