/**
 * Chat — lớp nói chuyện với server, hai đường:
 *
 *   · SOCKET (nhanh, như Telegram): gửi tin có ack, nhận tin / đã đọc / đang
 *     gõ / online đẩy về. Một ống mở suốt, không mở HTTP mới cho mỗi tin.
 *   · REST: danh sách, lịch sử, và dự phòng khi ống đang đứt.
 *
 * Gửi là LẠC QUAN: tin hiện ngay (`push`), lên server xong mới `ack`. Mỗi tin
 * mang `clientId` — gửi lại vì mạng chập chờn thì server trả lại đúng tin cũ.
 * Nối lại thì hỏi bù bằng REST (`after=seq`), không trông ống phát lại.
 *
 * Không có `EXPO_PUBLIC_API_URL` → chạy HÀNG GIẢ: ack sau ~150ms, bên kia
 * "đã xem", thỉnh thoảng gõ rồi trả lời — đủ để thấy cả vòng realtime.
 */
import { io, type Socket } from 'socket.io-client';
import { API, SOCKET, SOCKET_OUT } from '@nook/shared/common/constant';
import {
  CHAT_LIMITS,
  CHAT_SOCKET_IN,
  CHAT_SOCKET_OUT,
  CHAT_TYPING_TTL_MS,
} from '@nook/shared/model/constant';
import { path as apiPath } from '@nook/shared/common/util';
import type {
  IChat,
  IChatMessage,
  IChatPresenceEvent,
  IChatReadEvent,
  IChatTypingEvent,
  ISendChatMessageEvent,
} from '@nook/shared/model/interface';
import type { TChatBackground } from '@nook/shared/model/type';
import { API_BASE, LIVE, absolute, call, freshAccessToken } from '@/lib/http/api';
import { MOCK_REPLIES } from '@/mocks/chats';
import { useChats } from '../store/chatStore';
import type { Conversation, Message } from '../types';
import type { StickerId } from '../utils/stickers.generated';

const ACK_TIMEOUT_MS = 8000;
const TYPING_EVERY_MS = 3000;

let socket: Socket | null = null;
let myId: string | null = null;

/* ══════════════ Gửi ══════════════ */

export type Outgoing =
  | { kind: 'text'; text: string }
  | { kind: 'sticker'; sticker: StickerId };

let counter = 0;
/** Mã tin phía app: thời điểm + bộ đếm — đủ duy nhất cho một máy. */
const newClientId = () => `${Date.now().toString(36)}-${(++counter).toString(36)}`;

export function sendMessage(chatId: string, out: Outgoing): void {
  const text = out.kind === 'text' ? out.text.slice(0, CHAT_LIMITS.chatTextMax) : '';
  const msg = useChats.getState().push(chatId, {
    id: '',
    clientId: newClientId(),
    kind: out.kind,
    text,
    sticker: out.kind === 'sticker' ? out.sticker : undefined,
    at: Date.now(),
  });
  if (msg) void transmit(chatId, msg);
}

export function retryMessage(chatId: string, clientId: string): void {
  const msg = useChats.getState().retry(chatId, clientId);
  if (msg) void transmit(chatId, msg);
}

async function transmit(chatId: string, m: Message): Promise<void> {
  const store = useChats.getState();
  if (!LIVE) return mockTransmit(chatId, m);

  const event: ISendChatMessageEvent = {
    chatId,
    clientId: m.clientId,
    kind: m.kind,
    body: m.kind === 'sticker' ? m.sticker : m.text,
    replyToId: m.quote?.id,
  };
  // Ống đang sống → gửi qua ống (nhanh nhất). Không thì REST.
  if (socket?.connected) {
    try {
      const res = (await socket.timeout(ACK_TIMEOUT_MS).emitWithAck(CHAT_SOCKET_IN.send, event)) as
        | { ok: true; data: IChatMessage }
        | { ok: false; code: string };
      if (res.ok) return store.ack(chatId, m.clientId, res.data.id, res.data.seq);
    } catch {
      // hết giờ chờ ack — rơi xuống REST, cùng clientId nên không thành hai tin
    }
  }
  const { chatId: _omit, ...body } = event;
  void _omit;
  const res = await call<IChatMessage>('POST', apiPath(API.chat.messages, { id: chatId }), body);
  if (res.ok) store.ack(chatId, m.clientId, res.data.id, res.data.seq);
  else store.fail(chatId, m.clientId);
}

/* ══════════════ Đang gõ · đã đọc · nền ══════════════ */

const lastTyping = new Map<string, number>();
export function sendTyping(chatId: string): void {
  const now = Date.now();
  if (now - (lastTyping.get(chatId) ?? 0) < TYPING_EVERY_MS) return;
  lastTyping.set(chatId, now);
  if (LIVE) socket?.emit(CHAT_SOCKET_IN.typing, { chatId });
}

export function markRead(chatId: string): void {
  const store = useChats.getState();
  const c = store.conversations.find((x) => x.id === chatId);
  store.markSeen(chatId);
  const seq = c?.messages.reduce((mx, m) => (!m.mine && m.seq ? Math.max(mx, m.seq) : mx), 0) ?? 0;
  if (LIVE && seq > 0) socket?.emit(CHAT_SOCKET_IN.read, { chatId, seq });
}

export async function setBackground(chatId: string, background: TChatBackground): Promise<void> {
  useChats.getState().setBackground(chatId, background);
  if (LIVE) await call('PUT', apiPath(API.chat.background, { id: chatId }), { background });
}

/* ══════════════ Ống realtime (LIVE) ══════════════ */

/** Mở ống + nạp danh sách. Gọi một lần sau khi đăng nhập; trả hàm đóng. */
export function startChatRealtime(): () => void {
  if (!LIVE) return () => undefined;
  void loadChats();
  socket = io(API_BASE + SOCKET.namespace, {
    // Chỉ websocket: không có bước long-polling nên nhiều bản server sau
    // load balancer không cần "sticky session".
    transports: ['websocket'],
    auth: (cb) => {
      void freshAccessToken().then((token) => cb({ [SOCKET.authField]: token }));
    },
  });
  const s = socket;
  s.on(SOCKET_OUT.ready, (p: { userId: string }) => {
    myId = p.userId;
    void resync();
  });
  s.on(CHAT_SOCKET_OUT.message, (m: IChatMessage) => useChats.getState().receive(m.chatId, toMessage(m)));
  s.on(CHAT_SOCKET_OUT.read, (e: IChatReadEvent) => {
    if (e.userId !== myId) useChats.getState().receiveRead(e.chatId, e.seq);
  });
  s.on(CHAT_SOCKET_OUT.typing, (e: IChatTypingEvent) =>
    useChats.getState().receiveTyping(e.chatId, Date.now() + CHAT_TYPING_TTL_MS),
  );
  s.on(CHAT_SOCKET_OUT.presence, (e: IChatPresenceEvent) =>
    useChats.getState().receivePresence(e.userId, e.online),
  );
  return () => {
    s.disconnect();
    socket = null;
  };
}

async function loadChats(): Promise<void> {
  const res = await call<IChat[]>('GET', API.chat.list);
  if (res.ok) useChats.getState().hydrate(res.data.map(toConversation));
}

/** Mở một cuộc: nạp trang tin mới nhất. */
export async function loadMessages(chatId: string): Promise<void> {
  if (!LIVE) return;
  const res = await call<IChatMessage[]>('GET', apiPath(API.chat.messages, { id: chatId }));
  if (res.ok) useChats.getState().setMessages(chatId, [...res.data].reverse().map(toMessage));
}

/** Nối lại: hỏi bù mọi tin sau `seq` cuối mình có — ống không phát lại. */
async function resync(): Promise<void> {
  for (const c of useChats.getState().conversations) {
    const last = c.messages.reduce((mx, m) => (m.seq ? Math.max(mx, m.seq) : mx), 0);
    if (last === 0) continue;
    const res = await call<IChatMessage[]>(
      'GET',
      `${apiPath(API.chat.messages, { id: c.id })}?after=${last}`,
    );
    // Server trả mới nhất trước — đảo lại để chèn đúng thứ tự.
    if (res.ok) for (const m of [...res.data].reverse()) useChats.getState().receive(c.id, toMessage(m));
  }
}

function toMessage(m: IChatMessage): Message {
  return {
    id: m.id,
    clientId: m.clientId,
    seq: m.seq,
    kind: m.kind,
    text: m.kind === 'text' ? (m.body ?? '') : '',
    sticker: m.kind === 'sticker' ? (m.body as StickerId) : undefined,
    image: m.mediaId ? absolute(apiPath(API.media.read, { id: m.mediaId })) : undefined,
    at: Date.parse(m.createdAt),
    mine: m.senderId === myId,
    status: m.senderId === myId ? 'sent' : undefined,
  };
}

function toConversation(c: IChat): Conversation {
  return {
    id: c.id,
    friend: {
      id: c.peer.id,
      name: c.peer.name,
      avatar: c.peer.avatarMediaId
        ? absolute(apiPath(API.media.read, { id: c.peer.avatarMediaId }))
        : undefined,
      level: 1,
    },
    messages: c.lastMessage ? [toMessage(c.lastMessage)] : [],
    background: c.background,
    peerReadSeq: c.peerReadSeq,
    unread: c.unread,
  };
}

/* ══════════════ Hàng giả ══════════════ */

const STICKER_REPLIES: readonly StickerId[] = ['face-with-tears-of-joy', 'red-heart', 'thumbs-up', 'party-popper'];
let mockSeq = 1000;
let mockTurn = 0;

function mockTransmit(chatId: string, m: Message): void {
  const store = useChats.getState;
  const seq = ++mockSeq;
  setTimeout(() => store().ack(chatId, m.clientId, `mock-${m.clientId}`, seq), 150);
  setTimeout(() => store().receiveRead(chatId, seq), 1200);
  // Cứ hai tin thì bạn kia đáp một lần: gõ… rồi trả lời.
  if (++mockTurn % 2 === 0) return;
  setTimeout(() => store().receiveTyping(chatId, Date.now() + 2400), 1600);
  setTimeout(() => {
    const sticker = mockTurn % 3 === 0;
    const id = `mock-r-${++mockSeq}`;
    store().receive(chatId, {
      id,
      clientId: id,
      seq: mockSeq,
      kind: sticker ? 'sticker' : 'text',
      text: sticker ? '' : (MOCK_REPLIES[mockTurn % MOCK_REPLIES.length] ?? ''),
      sticker: sticker ? STICKER_REPLIES[mockTurn % STICKER_REPLIES.length] : undefined,
      at: Date.now(),
      mine: false,
    });
  }, 3900);
}
