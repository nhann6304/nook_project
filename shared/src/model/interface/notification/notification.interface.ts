import type { TNotificationKind } from '../../type/index.js';

// ── GET /v1/notifications · POST /v1/notifications/read ─────────────────────
//
// CHƯA có bên server (module `notification`, tầng 3). App đã dùng đúng hình
// này qua `frontend/src/features/notify/lib/notifyApi.ts`.

export interface INotification {
  id: string;
  kind: TNotificationKind;
  actorId: string;
  actorName: string;
  actorAvatarUrl: string | null;
  /** Khoảnh khắc liên quan (tag, cảm xúc, trả lời) — để hiện ảnh nhỏ. */
  momentId: string | null;
  momentThumbUrl: string | null;
  /** Cảm xúc đã thả (`reacted`) hoặc vài chữ đầu tin nhắn (`replied`). */
  preview: string | null;
  createdAt: string;
  read: boolean;
}
