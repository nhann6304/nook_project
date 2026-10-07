/** Thông báo giả. Xoá khi server có module `notification`. */
import type { Notice } from '@/features/notify/types';
import { SEED_MOMENTS } from './moments';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const now = Date.now();

export const SEED_NOTICES: readonly Notice[] = [
  { id: 'n1', kind: 'reacted', actorId: 'f1', actorName: 'Yến', preview: '❤️', photo: SEED_MOMENTS[0]?.photo, at: now - 3 * MINUTE, read: false },
  { id: 'n2', kind: 'tagged', actorId: 'f2', actorName: 'Hưng', photo: SEED_MOMENTS[1]?.photo, at: now - 25 * MINUTE, read: false },
  { id: 'n3', kind: 'invite', actorId: 'p1', actorName: 'Minh Anh', at: now - 2 * HOUR, read: false },
  { id: 'n4', kind: 'replied', actorId: 'f3', actorName: 'Duy', preview: 'Trời ơi đẹp quá', photo: SEED_MOMENTS[2]?.photo, at: now - 20 * HOUR, read: true },
  { id: 'n5', kind: 'accepted', actorId: 'f5', actorName: 'Bảo', at: now - 30 * HOUR, read: true },
];
