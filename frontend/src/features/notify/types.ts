import type { TNotificationKind } from '@nook/shared/model/type';
import type { PhotoSource } from '@/features/feed/types';

/** Một thông báo như app hiển thị — đổi từ `INotification` của server ở `notifyApi`. */
export type Notice = {
  id: string;
  kind: TNotificationKind;
  actorId: string;
  actorName: string;
  actorUri?: string;
  photo?: PhotoSource;
  preview?: string;
  at: number;
  read: boolean;
};
