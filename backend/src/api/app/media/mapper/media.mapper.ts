import { Injectable } from '@nestjs/common';
import { API, path } from '@nook/shared';
import { BaseMapper } from '../../../../core/mapper/index.js';
import { Media } from '../../../../database/entity/index.js';
import { MediaDto } from '../dto/index.js';

@Injectable()
export class MediaMapper extends BaseMapper<Media, MediaDto> {
  toDto(media: Media): MediaDto {
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
      // để nó vào một câu trả lời mà app có thể lưu lại là để một thứ hỏng sẵn.
      // Server ký lại mỗi lần có người xem — ký thì rẻ.
      url: path(API.media.read, { id: media.id }),
      createdAt: media.createdAt.toISOString(),
    };
  }
}
