/** Dữ liệu giả để xem giao diện. Xoá khi nối server thật. */
import type { Conversation } from '@/features/chat/types';
import { SEED_MOMENTS } from './moments';

const MINUTE = 60_000;
const now = Date.now();

const yen = SEED_MOMENTS[0]!;
const hung = SEED_MOMENTS[1]!;

export const SEED_CHATS: readonly Conversation[] = [
  {
    id: yen.author.id,
    friend: yen.author,
    about: { photo: yen.photo, caption: yen.caption },
    messages: [
      { id: 'y1', text: 'Trời hôm nay đẹp ghê 🥺', at: now - 3 * MINUTE, mine: false },
      { id: 'y2', text: 'Chỗ đó gần nhà bạn hả', at: now - 2 * MINUTE, mine: true },
      { id: 'y3', text: 'Ừ đi bộ ra chừng năm phút', at: now - MINUTE, mine: false },
    ],
  },
  {
    id: hung.author.id,
    friend: hung.author,
    about: { photo: hung.photo, caption: hung.caption },
    messages: [{ id: 'h1', text: '🔥', at: now - 40 * MINUTE, mine: true }],
  },
];

/** Chưa nói chuyện với ai — để xem màn trống. */
export const NO_CHATS: readonly Conversation[] = [];
