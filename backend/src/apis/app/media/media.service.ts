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
import {
  ChatMessageRepository,
  ChatRepository,
  MediaRepository,
  MediaVariantRepository,
} from '../../../repository/index.js';
import { QUEUE, type IBuildVariantsJob } from '../../../queue/constant/queue.constant.js';
import { Media } from '../../../database/entity/media/media.entity.js';
import { extFor, isVideo } from './media.constant.js';
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
 * Tệp này không có `sharp`, `resize` hay `quality`. Bytes vào kho đúng bằng
 * bytes máy ảnh chụp ra (PUT thẳng, chữ ký khoá `content-length`). Bản nhẹ là
 * **bản sao thêm** ở `media_variants`, dựng ở `MediaProcessor` vào khoá khác.
 */
@Injectable()
export class MediaService {
  private readonly log = new Logger('Media');

  constructor(
    private readonly media: MediaRepository,
    private readonly variants: MediaVariantRepository,
    private readonly chats: ChatRepository,
    private readonly chatMessages: ChatMessageRepository,
    private readonly storage: StorageService,
    private readonly mapper: MediaMapper,
    @InjectQueue(QUEUE.media) private readonly queue: Queue<IBuildVariantsJob>,
  ) {}

  /** Bước 1 — ghi dòng chờ và ký giấy phép tải lên. */
  @Transactional()
  async createUpload(ownerId: string, dto: CreateUploadDto): Promise<ICreateUploadResult> {
    // Video chỉ cho khoảnh khắc: ảnh đại diện và ảnh chat là ẢNH.
    if (dto.kind !== 'moment' && isVideo(dto.contentType)) {
      throw new AppException(ERR.MEDIA_TYPE_UNSUPPORTED, HttpStatus.BAD_REQUEST);
    }
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

    if (isVideo(saved.contentType)) {
      this.log.debug(`media ready (video, no variants): ${mediaId}`);
      return this.mapper.toDto(saved, []);
    }

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
   * Luật theo CHỖ tấm ảnh được gắn vào, không theo bảng `media` — xem `canView`.
   * Không truyền `variant` là **bản GỐC**, đúng từng byte đã tải lên.
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
    if (!(await this.canView(viewerId, row))) {
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

  /**
   * Ai được xem tấm này. Chặng này (chưa có góc bạn bè):
   *   chủ ảnh                                luôn
   *   ảnh đại diện                           người đang có cuộc chat với chủ
   *   ảnh gắn vào một tin chat               hai người của cuộc đó
   * TODO(circle): avatar → người trong góc; moment → người được gửi tới.
   *
   * Câu hỏi về chat nằm ở `repository/` — `media` (tầng 0) không nhập `chat`.
   */
  private async canView(viewerId: string, row: Media): Promise<boolean> {
    if (row.ownerId === viewerId) return true;
    if (row.kind === 'avatar' && (await this.chats.sharesChat(viewerId, row.ownerId))) return true;
    return this.chatMessages.isMediaVisibleTo(row.id, viewerId);
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
