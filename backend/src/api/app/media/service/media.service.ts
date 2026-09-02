import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { extname } from 'node:path';
import {
  ERR,
  MEDIA_LIMITS,
  type ICreateUploadResult,
} from '@nook/shared';
import { AppException } from '../../../../core/error/index.js';
import { Transactional } from '../../../../core/transaction/index.js';
import { StorageService } from '../../../../infra/storage/index.js';
import { MediaRepository } from '../../../../repository/index.js';
import { Media } from '../../../../database/entity/index.js';
import { MediaMapper } from '../mapper/index.js';
import { MediaDto, type CreateUploadDto } from '../dto/index.js';

/** Kiểu tệp → đuôi. Chỉ để đường trong kho đọc được bằng mắt, không dùng để kiểm. */
const EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/webp': 'webp',
};

/** Kho báo dung lượng lệch quá ngần này thì không nhận. */
const SIZE_TOLERANCE_BYTES = 1024;

/**
 * Ảnh: xin đường tải lên, nhận, và ký đường xem.
 *
 * ── Ba bước, và vì sao phải ba ──────────────────────────────────────────────
 *
 *   1. app xin đường  →  server ghi một dòng `pending`, ký một giấy phép PUT
 *   2. app PUT thẳng bytes vào kho  →  **không đi qua server**
 *   3. app báo xong  →  server tự soi lại trong kho rồi mới chuyển `ready`
 *
 * Bước 3 không thừa. Không có nó thì ai cũng gọi `complete` cho một tấm ảnh
 * chưa từng tồn tại, và bảng đầy dòng `ready` trỏ vào hư không.
 *
 * ── Không bóp ảnh ───────────────────────────────────────────────────────────
 *
 * Không có `sharp`, không có `resize`, không có `quality`. Bytes vào kho đúng
 * bằng bytes máy ảnh chụp ra. Bản nhẹ cho bảng tin là chuyện của chặng sau và
 * là **bản sao thêm**, không phải thay bản gốc.
 */
@Injectable()
export class MediaService {
  private readonly log = new Logger('Media');

  constructor(
    private readonly media: MediaRepository,
    private readonly storage: StorageService,
    private readonly mapper: MediaMapper,
  ) {}

  /** Bước 1 — ghi dòng chờ và ký giấy phép tải lên. */
  @Transactional()
  async createUpload(ownerId: string, dto: CreateUploadDto): Promise<ICreateUploadResult> {
    const row = await this.media.create({
      ownerId,
      kind: dto.kind,
      status: 'pending',
      contentType: dto.contentType,
      byteSize: dto.byteSize,
      width: dto.width ?? null,
      height: dto.height ?? null,
      // Chỗ giữ chỗ; đường thật cần `id` nên phải ghi rồi mới đặt được.
      storageKey: 'pending',
    });

    const key = this.keyFor(ownerId, row.id, dto.contentType);
    await this.media.update({ id: row.id }, { storageKey: key });

    const uploadUrl = await this.storage.presignPut(
      key,
      dto.contentType,
      dto.byteSize,
      MEDIA_LIMITS.uploadUrlTtlSeconds,
    );

    return {
      mediaId: row.id,
      uploadUrl,
      // Kho ký cả hai thứ này vào chữ ký. App gửi khác đi là kho từ chối —
      // đó mới là chỗ chặn thật, không phải câu `if` ở tầng mã.
      headers: {
        'content-type': dto.contentType,
        'content-length': String(dto.byteSize),
      },
      expiresInSeconds: MEDIA_LIMITS.uploadUrlTtlSeconds,
    };
  }

  /** Bước 3 — soi lại trong kho rồi mới nhận. */
  @Transactional()
  async complete(ownerId: string, mediaId: string): Promise<MediaDto> {
    const row = await this.mine(ownerId, mediaId);
    if (row.status === 'ready') return this.mapper.toDto(row);

    const object = await this.storage.head(row.storageKey);
    if (!object) {
      throw new AppException(ERR.MEDIA_NOT_UPLOADED, HttpStatus.CONFLICT);
    }

    // Kho là bên nói thật về dung lượng, không phải app. Lệch quá ngưỡng nghĩa
    // là tệp trong kho không phải tệp đã khai — không nhận.
    if (Math.abs(object.byteSize - row.byteSize) > SIZE_TOLERANCE_BYTES) {
      throw new AppException(ERR.MEDIA_NOT_UPLOADED, HttpStatus.CONFLICT, {
        declared: row.byteSize,
        actual: object.byteSize,
      });
    }

    row.status = 'ready';
    row.readyAt = new Date();
    row.byteSize = object.byteSize;
    const saved = await this.media.save(row);

    this.log.debug({ mediaId, ownerId }, 'media ready');
    return this.mapper.toDto(saved);
  }

  /**
   * Đường xem đã ký, sống ngắn.
   *
   * ── Ai được xem ─────────────────────────────────────────────────────────
   *
   * Chặng này: **chỉ chủ ảnh.** Chưa có góc bạn bè nên chưa có ai khác để mở.
   *
   * Chặng sau, luật theo `kind` chứ không theo bảng `media`:
   *   avatar  người trong góc của chủ ảnh
   *   moment  chỉ những người khoảnh khắc đó gửi tới
   *
   * Đặt luật ở đây — MỘT chỗ — chứ không rải ở từng cửa gọi tới ảnh. Rải ra thì
   * sẽ có một cửa quên kiểm, và cửa đó là chỗ ảnh riêng tư rò ra ngoài.
   */
  async readUrl(viewerId: string, mediaId: string): Promise<string> {
    const row = await this.media.findById(mediaId);
    if (!row) throw new AppException(ERR.MEDIA_NOT_FOUND, HttpStatus.NOT_FOUND);
    if (row.status !== 'ready') {
      throw new AppException(ERR.MEDIA_NOT_UPLOADED, HttpStatus.CONFLICT);
    }
    if (row.ownerId !== viewerId) {
      throw new AppException(ERR.MEDIA_FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    return this.storage.presignGet(row.storageKey, MEDIA_LIMITS.readUrlTtlSeconds);
  }

  /** Ảnh này có phải của người đang gọi không. */
  async mine(ownerId: string, mediaId: string): Promise<Media> {
    const row = await this.media.findById(mediaId);
    if (!row) throw new AppException(ERR.MEDIA_NOT_FOUND, HttpStatus.NOT_FOUND);
    if (row.ownerId !== ownerId) {
      // Cùng một mã với "không tìm thấy" thì đỡ lộ, nhưng ở đây người gọi đã
      // đăng nhập và đang thao tác trên thứ mình vừa tạo — nói thẳng thì họ
      // sửa được, còn kẻ dò thì cũng chẳng biết thêm gì.
      throw new AppException(ERR.MEDIA_FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    return row;
  }

  /** `original/<chủ>/<id>.<đuôi>` — nhìn đường là biết của ai và là bản gì. */
  private keyFor(ownerId: string, mediaId: string, contentType: string): string {
    const ext = EXTENSION[contentType] ?? extname(contentType).replace('.', '') ?? 'bin';
    return `original/${ownerId}/${mediaId}.${ext}`;
  }
}
