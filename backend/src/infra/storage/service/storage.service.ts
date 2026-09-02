import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Env } from '../../../config/env/index.js';

/**
 * Kho ảnh. MinIO ở máy dev, Cloudflare R2 ở bản thật — **cùng một giao thức**,
 * nên đường tải lên ở máy dev là đường thật, không phải bản giả rồi lên thật
 * mới phát hiện lệch.
 *
 * ── Bytes KHÔNG đi qua server ───────────────────────────────────────────────
 *
 * Lớp này chỉ **ký giấy phép**, không cầm dữ liệu. App tải thẳng lên kho bằng
 * đường đã ký. Một tấm ảnh 12MB đi qua Node là tốn hai lần băng thông, chiếm
 * bộ nhớ suốt lúc tải, và mười người tải cùng lúc là 120MB nằm trong một tiến
 * trình chỉ có một luồng.
 *
 * ── Vì sao R2 chứ không phải S3 ─────────────────────────────────────────────
 *
 * **Không phải vì rẻ chỗ chứa** — chỗ chứa ở đâu cũng na ná. Vì R2 **không thu
 * tiền băng thông ra**. Nook là app xem ảnh: mỗi tấm tải lên một lần, xem hàng
 * trăm lần. Ở S3 thì chính cái "hàng trăm lần" đó là hoá đơn.
 */
@Injectable()
export class StorageService implements OnModuleDestroy {
  private readonly log = new Logger('Storage');
  private readonly bucket: string;
  private readonly s3: S3Client;

  constructor(config: ConfigService<Env, true>) {
    this.bucket = config.get('STORAGE_BUCKET', { infer: true });
    this.s3 = new S3Client({
      endpoint: config.get('STORAGE_ENDPOINT', { infer: true }),
      region: config.get('STORAGE_REGION', { infer: true }),
      credentials: {
        accessKeyId: config.get('STORAGE_KEY_ID', { infer: true }),
        secretAccessKey: config.get('STORAGE_SECRET', { infer: true }),
      },
      // MinIO: http://host/bucket/key   ·   R2: https://bucket.host/key
      // Đặt sai thì mọi lần tải lên trả 403 hoặc 404, và câu lỗi không nói vì sao.
      forcePathStyle: config.get('STORAGE_PATH_STYLE', { infer: true }),
    });
  }

  /**
   * Giấy phép TẢI LÊN, sống trong ít phút.
   *
   * `ContentType` và `ContentLength` nằm trong chữ ký, nên app phải gửi đúng
   * hai thứ đã khai — khai 2MB rồi đẩy 200MB là kho từ chối, không cần server
   * can thiệp. Đó là chỗ chặn thật, chứ không phải câu `if` ở tầng mã.
   */
  presignPut(key: string, contentType: string, byteSize: number, ttlSeconds: number) {
    return getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: byteSize,
      }),
      { expiresIn: ttlSeconds },
    );
  }

  /** Giấy phép XEM, sống ngắn. Ký lại thì rẻ; để nó sống lâu thì rò. */
  presignGet(key: string, ttlSeconds: number) {
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: ttlSeconds,
    });
  }

  /**
   * Tệp có thật trong kho chưa, và nặng bao nhiêu.
   *
   * Đây là chỗ server **soi lại lời khai của app**. Không có bước này thì ai
   * cũng gọi được `complete` cho một tấm ảnh chưa từng tồn tại.
   */
  async head(key: string): Promise<{ byteSize: number; contentType: string } | null> {
    try {
      const out = await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return {
        byteSize: Number(out.ContentLength ?? 0),
        contentType: out.ContentType ?? 'application/octet-stream',
      };
    } catch {
      return null;
    }
  }

  /**
   * Xoá một đối tượng.
   *
   * ⚠️ CHỈ dùng cho bản phái sinh và cho dòng tải lên treo giữa chừng.
   * **Không bao giờ gọi cho ảnh gốc.** Ảnh gốc không dựng lại được.
   */
  async remove(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    this.log.debug({ key }, 'object removed');
  }

  onModuleDestroy(): void {
    this.s3.destroy();
  }
}
