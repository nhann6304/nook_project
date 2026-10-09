/**
 * Gửi một khoảnh khắc. Màn chính thêm vào feed NGAY trên máy (không bắt người
 * dùng chờ mạng), cửa này chạy sau.
 *
 * `LIVE`: tải ảnh (và video) lên qua `uploadMedia`, rồi `POST /v1/moments` theo
 * `ICreateMomentBody` của `@nook/shared`. Server CHƯA có module `moment` — tới
 * lúc có, cửa này chạy luôn, không màn nào phải sửa. Không `LIVE` thì giả.
 */
import { API } from '@nook/shared/common/constant';
import type { ICreateMomentBody, ICreateMomentResult } from '@nook/shared/model/interface';
import { translateError } from '@i18n';
import { LIVE, call } from '@/lib/http/api';
import { uploadMedia } from '@/features/media/api/mediaApi';

export type NewMoment = {
  photo: string;
  video?: string;
  caption: string;
  tagIds: string[];
  /** Người KHÔNG được xem. */
  hiddenFrom: string[];
};
export type SendMomentResult = { ok: true; id: string } | { ok: false; message: string };

export async function sendMoment(m: NewMoment): Promise<SendMomentResult> {
  if (!LIVE) return { ok: true, id: `local-${Date.now()}` };

  const photo = await uploadMedia(m.photo, 'moment');
  if (!photo.ok) return { ok: false, message: translateError(photo.code) };

  const body: ICreateMomentBody = { photoMediaId: photo.media.id };
  if (m.video) {
    const video = await uploadMedia(m.video, 'moment');
    if (!video.ok) return { ok: false, message: translateError(video.code) };
    body.videoMediaId = video.media.id;
  }
  if (m.caption) body.caption = m.caption;
  if (m.tagIds.length > 0) body.tagUserIds = m.tagIds;
  if (m.hiddenFrom.length > 0) body.hiddenFromUserIds = m.hiddenFrom;

  const res = await call<ICreateMomentResult>('POST', API.moment.create, body);
  return res.ok ? { ok: true, id: res.data.id } : { ok: false, message: translateError(res.code) };
}
