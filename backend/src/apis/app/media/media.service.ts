import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import {
  ERR,
  MEDIA_LIMITS,
  MEDIA_STATUS,
  MEDIA_VARIANTS,
  type ICreateUploadResult,
  type TMediaVariant,
} from '@nook/shared';
import { AppException } from '../../../core/error/app.exception.js';
import { Transactional } from '../../../core/transaction/transactional.decorator.js';
import { StorageService } from '../../../infra/storage/service/storage.service.js';
import { MediaRepository, MediaVariantRepository } from '../../../repository/index.js';
import { QUEUE, type IBuildVariantsJob } from '../../../queue/constant/queue.constant.js';
import { Media } from '../../../database/entity/media/media.entity.js';
import { extFor } from './media.constant.js';
import { MediaMapper } from './media.mapper.js';
import { MediaDto, type CreateUploadDto } from './media.dto.js';

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
    private readonly variants: MediaVariantRepository,
    private readonly storage: StorageService,
    private readonly mapper: MediaMapper,
    @InjectQueue(QUEUE.media) private readonly queue: Queue<IBuildVariantsJob>,
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
      // Ghi lại kho NGAY lúc tạo. Đổi kho sau này thì ảnh cũ vẫn tìm được.
      storageProvider: this.storage.current,
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

  /** Bước 3 — soi lại trong kho rồi mới nhận, và xếp việc dựng bản nhẹ. */
  @Transactional()
  async complete(ownerId: string, mediaId: string): Promise<MediaDto> {
    const row = await this.mine(ownerId, mediaId);
    if (row.status === MEDIA_STATUS.READY) {
      return this.mapper.toDto(row, await this.variants.readyOf(row.id));
    }

    const object = await this.storage.head(row.storageProvider, row.storageKey);
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

    // Dựng bản nhẹ ở VIỆC NỀN, không dựng ngay tại đây. Kéo 12MB về bộ nhớ rồi
    // nén lại mất vài trăm mili giây và chiếm một luồng — người dùng không có
    // lý do gì phải chờ chuyện đó. Ảnh dùng được ngay bằng bản gốc.
    await this.queue.add(QUEUE.job.buildVariants, { mediaId: saved.id }, {
      // Cùng một mã việc: hàng đợi giao lại lần hai cũng không dựng lại lần hai.
      // Dấu gạch chứ không phải dấu hai chấm — BullMQ từ chối `:` trong mã việc
      // (nó dùng `:` làm dấu ngăn cho khoá Redis của chính nó).
      jobId: `variants-${saved.id}`,
    });

    this.log.debug(`media ready, variants queued: ${mediaId}`);
    return this.mapper.toDto(saved, []);
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
  async readUrl(
    viewerId: string,
    mediaId: string,
    variant?: TMediaVariant,
  ): Promise<string> {
    const row = await this.media.findById(mediaId);
    if (!row) throw new AppException(ERR.MEDIA_NOT_FOUND, HttpStatus.NOT_FOUND);
    if (row.status !== 'ready') {
      throw new AppException(ERR.MEDIA_NOT_UPLOADED, HttpStatus.CONFLICT);
    }
    if (row.ownerId !== viewerId) {
      throw new AppException(ERR.MEDIA_FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    // Xin bản nhẹ mà chưa dựng xong thì trả BẢN GỐC, không trả lỗi. Chậm một
    // lần còn hơn một ô ảnh trống — và bản nhẹ sẽ có ở lần xem sau.
    if (variant) {
      const built = await this.variants.findOneOf(mediaId, variant);
      if (built?.status === MEDIA_STATUS.READY) {
        return this.storage.presignGet(
          built.storageProvider,
          built.storageKey,
          MEDIA_LIMITS.readUrlTtlSeconds,
        );
      }
    }

    return this.storage.presignGet(
      row.storageProvider,
      row.storageKey,
      MEDIA_LIMITS.readUrlTtlSeconds,
    );
  }

  /** Mấy bản nhẹ đã dựng xong của một tấm. Cho bên gọi nắn ra DTO. */
  readyVariants(mediaId: string) {
    return this.variants.readyOf(mediaId);
  }

  /** Danh sách bản nhẹ mà hệ thống dựng. */
  static get wanted(): readonly TMediaVariant[] {
    return MEDIA_VARIANTS;
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
    return `original/${ownerId}/${mediaId}.${extFor(contentType)}`;
  }
}
