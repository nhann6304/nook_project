/**
 * Cửa thông báo. `LIVE`: `GET /v1/notifications` theo `INotification` của
 * `@nook/shared` — server CHƯA có module `notification`; tới lúc có, cửa này
 * chạy luôn. Không `LIVE` thì trả hàng giả.
 */
import { API } from '@nook/shared/common/constant';
import type { INotification } from '@nook/shared/model/interface';
import { LIVE, absolute, call } from '@/lib/api';
import { SEED_NOTICES } from '@/mocks/notifications';
import type { Notice } from '../types';

const toNotice = (n: INotification): Notice => ({
  id: n.id,
  kind: n.kind,
  actorId: n.actorId,
  actorName: n.actorName,
  actorUri: n.actorAvatarUrl ? absolute(n.actorAvatarUrl) : undefined,
  photo: n.momentThumbUrl ? absolute(n.momentThumbUrl) : undefined,
  preview: n.preview ?? undefined,
  at: Date.parse(n.createdAt),
  read: n.read,
});

/** `null` = chưa lấy được (mất mạng) — giữ danh sách đang có. */
export async function listNotices(): Promise<readonly Notice[] | null> {
  if (!LIVE) return SEED_NOTICES;
  const res = await call<INotification[]>('GET', API.notification.list);
  return res.ok ? res.data.map(toNotice) : null;
}

export async function markAllRead(): Promise<void> {
  if (!LIVE) return;
  await call('POST', API.notification.read);
}
