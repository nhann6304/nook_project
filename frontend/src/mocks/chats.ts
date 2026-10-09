/** Dữ liệu giả để xem giao diện. Xoá khi nối server thật. */
import type { Conversation, Message } from '@/features/chat/types';
import { SEED_MOMENTS } from './moments';

const MINUTE = 60_000;
const now = Date.now();

const yen = SEED_MOMENTS[0]!;
const hung = SEED_MOMENTS[1]!;

let n = 0;
const msg = (m: Omit<Message, 'id' | 'clientId' | 'seq' | 'kind'> & Partial<Message>): Message => {
  n++;
  return { id: `seed-${n}`, clientId: `seed-${n}`, seq: n, kind: 'text', ...m };
};

export const SEED_CHATS: readonly Conversation[] = [
  {
    id: yen.author.id,
    friend: yen.author,
    background: 'default',
    peerReadSeq: 3,
    unread: 1,
    online: true,
    messages: [
      msg({ text: 'Trời hôm nay đẹp ghê 🥺', at: now - 30 * MINUTE, mine: false }),
      msg({
        text: 'Chỗ đó gần nhà bạn hả',
        at: now - 29 * MINUTE,
        mine: true,
        status: 'read',
        about: { photo: yen.photo, caption: yen.caption },
      }),
      msg({ text: '', kind: 'sticker', sticker: 'smiling-face-with-hearts', at: now - 28 * MINUTE, mine: true, status: 'read' }),
      msg({ text: 'Ừ đi bộ ra chừng năm phút', at: now - 3 * MINUTE, mine: false }),
      msg({ text: 'Chiều nay đi cà phê không? ☕', at: now - 2 * MINUTE, mine: false }),
    ],
  },
  {
    id: hung.author.id,
    friend: hung.author,
    background: 'sunset',
    peerReadSeq: 0,
    unread: 0,
    messages: [
      msg({
        text: '🔥',
        at: now - 40 * MINUTE,
        mine: true,
        status: 'sent',
        about: { photo: hung.photo, caption: hung.caption },
      }),
    ],
  },
];

/** Chưa nói chuyện với ai — để xem màn trống. */
export const NO_CHATS: readonly Conversation[] = [];

/** Câu bạn kia "trả lời" ở chế độ hàng giả (`chatApi.ts`). */
export const MOCK_REPLIES = ['Okee 😆', 'Thật hả 😳', 'Haha', 'Để mình xem đã', 'Đi luôn!', 'Nhớ quá à 🥺'];
