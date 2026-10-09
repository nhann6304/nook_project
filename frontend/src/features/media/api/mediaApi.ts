/**
 * Tải một tệp lên theo hợp đồng `media` của server (backend/README.md mục 4):
 *
 *   1. POST /v1/media/upload-url  → mediaId + đường đã ký
 *   2. PUT bytes THẲNG lên kho    → không đi qua server
 *   3. POST /v1/media/:id/complete → server soi dung lượng rồi mới nhận
 *
 * Không bóp ảnh gốc: tệp lên đúng như máy sinh ra (luật số một của `media`).
 * Chỉ chạy khi `LIVE`; hàng giả thì các `*Api.ts` khác không gọi tới đây.
 */
import { API, COMMON_ERR } from '@nook/shared/common/constant';
import { path } from '@nook/shared/common/util';
import { ERR, MEDIA_LIMITS } from '@nook/shared/model/constant';
import type { ICreateUploadResult, IMedia } from '@nook/shared/model/interface';
import type { TMediaKind } from '@nook/shared/model/type';
import { APP_ERR, call } from '@/lib/http/api';

export type UploadResult = { ok: true; media: IMedia } | { ok: false; code: string };

const EXT_TYPE: Readonly<Record<string, string>> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
  webp: 'image/webp',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
};

/** Kiểu tệp đoán từ đuôi — camera chụp ra `.jpg`, thư viện iOS có thể là `.heic`, quay ra `.mp4`/`.mov`. */
export function contentTypeOf(uri: string): string {
  const ext = uri.split('?')[0]?.split('.').pop()?.toLowerCase() ?? '';
  return EXT_TYPE[ext] ?? 'image/jpeg';
}

export async function uploadMedia(uri: string, kind: TMediaKind): Promise<UploadResult> {
  const blob = await (await fetch(uri)).blob();
  if (blob.size > MEDIA_LIMITS.maxBytes) return { ok: false, code: ERR.MEDIA_TOO_LARGE };

  const contentType = contentTypeOf(uri);
  const ticket = await call<ICreateUploadResult>('POST', API.media.uploadUrl, {
    kind,
    contentType,
    byteSize: blob.size,
  });
  if (!ticket.ok) return { ok: false, code: ticket.code };

  try {
    const put = await fetch(ticket.data.uploadUrl, {
      method: 'PUT',
      headers: ticket.data.headers,
      body: blob,
    });
    if (!put.ok) return { ok: false, code: COMMON_ERR.SERVER_ERROR };
  } catch {
    return { ok: false, code: APP_ERR.OFFLINE };
  }

  const done = await call<IMedia>('POST', path(API.media.complete, { id: ticket.data.mediaId }));
  return done.ok ? { ok: true, media: done.data } : { ok: false, code: done.code };
}
