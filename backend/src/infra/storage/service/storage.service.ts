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

/** Kho nào. Ghi vào từng dòng ảnh để sau này đổi kho không mất ảnh cũ. */
export type TStorageProvider = 'minio' | 'r2' | 's3';

/**
 * Nhận ra kho từ chính đường dẫn, thay vì bắt người ta khai đúng.
 *
 * `forcePathStyle` là cái bẫy đắt nhất của S3: MinIO cần `true`
 * (`http://host/bucket/key`), R2 và AWS cần `false` (`https://bucket.host/key`).
 * Đặt sai thì **mọi** lần tải lên trả 403 hoặc 404, và câu lỗi của S3 không hé
 * một chữ nào về nguyên nhân. Suy ra từ tên miền thì không ai đặt sai được nữa.
 */
export function detectProvider(endpoint: string): TStorageProvider {
  let host = '';
  try {
    host = new URL(endpoint).hostname;
  } catch {
    return 'minio';
  }
  if (host.endsWith('r2.cloudflarestorage.com')) return 'r2';
  if (host.endsWith('amazonaws.com')) return 's3';
  return 'minio';
}

interface IBucket {
  client: S3Client;
  bucket: string;
}

/**
 * Kho ảnh. MinIO ở máy dev, Cloudflare R2 ở bản thật — **cùng giao thức S3**,
 * nên đường tải lên ở máy dev là đường thật, không phải bản giả rồi lên thật
 * mới phát hiện lệch.
 *
 * ── Ghi vào MỘT kho, đọc được NHIỀU kho ─────────────────────────────────────
 *
 * Ảnh mới luôn ghi vào kho đang khai (`current`). Nhưng mỗi dòng ảnh **nhớ nó
 * nằm ở kho nào**, và lúc đọc thì đọc đúng kho đó. Nhờ vậy ngày đổi MinIO sang
 * R2 không phải dừng dịch vụ và không mất tấm nào: ghi mới vào R2, đọc cũ ở
 * MinIO, chép dần sang lúc rảnh.
 *
 * Khai `STORAGE_LEGACY_*` để mở đường đọc kho cũ. Không khai mà gặp ảnh của kho
 * cũ thì ném ra một câu nói thẳng phải làm gì — chứ không phải một lỗi S3 mù mờ.
 *
 * ── Bytes không đi qua server, trừ một chỗ ──────────────────────────────────
 *
 * Đường của người dùng chỉ **ký giấy phép**; app tải thẳng lên kho. Chỗ duy
 * nhất bytes đi qua Node là việc nền dựng bản nhẹ (`getBuffer`/`put`) — và ở đó
 * thì đúng, vì nó chạy ngoài đường request, không ai đang chờ.
 */
@Injectable()
export class StorageService implements OnModuleDestroy {
  private readonly log = new Logger('Storage');
  private readonly buckets = new Map<TStorageProvider, IBucket>();

  /** Kho mà ảnh MỚI đi vào. */
  readonly current: TStorageProvider;

  constructor(config: ConfigService<Env, true>) {
    const endpoint = config.get('STORAGE_ENDPOINT', { infer: true });
    this.current = detectProvider(endpoint);

    this.buckets.set(this.current, {
      bucket: config.get('STORAGE_BUCKET', { infer: true }),
      client: this.build(
        endpoint,
        config.get('STORAGE_REGION', { infer: true }),
        config.get('STORAGE_KEY_ID', { infer: true }),
        config.get('STORAGE_SECRET', { infer: true }),
      ),
    });

    const legacyEndpoint = config.get('STORAGE_LEGACY_ENDPOINT', { infer: true });
    if (legacyEndpoint) {
      const legacy = detectProvider(legacyEndpoint);
      this.buckets.set(legacy, {
        bucket: config.get('STORAGE_LEGACY_BUCKET', { infer: true }) ?? '',
        client: this.build(
          legacyEndpoint,
          config.get('STORAGE_REGION', { infer: true }),
          config.get('STORAGE_LEGACY_KEY_ID', { infer: true }) ?? '',
          config.get('STORAGE_LEGACY_SECRET', { infer: true }) ?? '',
        ),
      });
      this.log.log(`storage: writing to ${this.current}, also reading ${legacy}`);
    } else {
      this.log.log(`storage: ${this.current}`);
    }
  }

  private build(endpoint: string, region: string, keyId: string, secret: string): S3Client {
    return new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId: keyId, secretAccessKey: secret },
      // Suy ra, không hỏi. Xem `detectProvider`.
      forcePathStyle: detectProvider(endpoint) === 'minio',
    });
  }

  private at(provider: string): IBucket {
    const found = this.buckets.get(provider as TStorageProvider);
    if (!found) {
      throw new Error(
        `No credentials for storage provider "${provider}". ` +
          `Currently writing to "${this.current}". ` +
          `Set STORAGE_LEGACY_ENDPOINT / _BUCKET / _KEY_ID / _SECRET to read the old one.`,
      );
    }
    return found;
  }

  // ── Đường của người dùng: chỉ ký, không cầm dữ liệu ────────────────────────

  /**
   * Giấy phép TẢI LÊN, sống trong ít phút.
   *
   * `ContentType` và `ContentLength` nằm trong chữ ký, nên app phải gửi đúng
   * hai thứ đã khai — khai 2MB rồi đẩy 200MB là **kho** từ chối. Đó là chỗ chặn
   * thật, không phải câu `if` ở tầng mã.
   */
  presignPut(key: string, contentType: string, byteSize: number, ttlSeconds: number) {
    const { client, bucket } = this.at(this.current);
    return getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: byteSize,
      }),
      { expiresIn: ttlSeconds },
    );
  }

  /** Giấy phép XEM, sống ngắn. Ký lại thì rẻ; để nó sống lâu thì rò. */
  presignGet(provider: string, key: string, ttlSeconds: number) {
    const { client, bucket } = this.at(provider);
    return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
      expiresIn: ttlSeconds,
    });
  }

  /**
   * Tệp có thật trong kho chưa, và nặng bao nhiêu.
   *
   * Đây là chỗ server **soi lại lời khai của app**. Không có bước này thì ai
   * cũng gọi được `complete` cho một tấm ảnh chưa từng tồn tại.
   */
  async head(
    provider: string,
    key: string,
  ): Promise<{ byteSize: number; contentType: string } | null> {
    const { client, bucket } = this.at(provider);
    try {
      const out = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return {
        byteSize: Number(out.ContentLength ?? 0),
        contentType: out.ContentType ?? 'application/octet-stream',
      };
    } catch {
      return null;
    }
  }

  // ── Đường của việc nền: bytes ĐI QUA Node, và ở đây thì đúng ───────────────

  /** Kéo cả tệp về bộ nhớ. CHỈ dùng ở việc nền — đừng gọi trong đường request. */
  async getBuffer(provider: string, key: string): Promise<Buffer> {
    const { client, bucket } = this.at(provider);
    const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return Buffer.from(await out.Body!.transformToByteArray());
  }

  /** Đẩy một tệp đã dựng sẵn lên kho đang dùng. */
  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    const { client, bucket } = this.at(this.current);
    await client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
    );
  }

  /**
   * Xoá một đối tượng.
   *
   * ⚠️ CHỈ dùng cho bản nhẹ và cho dòng tải lên treo giữa chừng.
   * **Không bao giờ gọi cho ảnh gốc.** Ảnh gốc không dựng lại được.
   */
  async remove(provider: string, key: string): Promise<void> {
    const { client, bucket } = this.at(provider);
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    this.log.debug(`object removed: ${key}`);
  }

  onModuleDestroy(): void {
    for (const { client } of this.buckets.values()) client.destroy();
  }
}
