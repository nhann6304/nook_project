/**
 * Kho trò chuyện — nguồn sự thật DUY NHẤT của màn chat.
 *
 * Gửi là LẠC QUAN (như Telegram): tin hiện ngay với trạng thái `sending`, lớp
 * realtime (`api/chatSocket.ts`) đẩy lên server rồi gọi `ack` để đổi thành
 * `sent` + gắn `seq`. Tin từ người kia, "đã đọc", "đang gõ" đều đi vào qua các
 * hàm `receive*` — kho không biết socket tồn tại.
 *
 * Một người ĐÚNG MỘT cuộc trò chuyện. `openAbout` là chỗ nối với Khoảnh khắc:
 * mở (hoặc tạo) cuộc với người đó và ghim tấm ảnh đang trả lời.
 */
import { create } from 'zustand';
import type { TChatBackground } from '@nook/shared/model/type';
import type { Author, PhotoSource } from '@/features/feed/types';
import { SEED_CHATS } from '@/mocks/chats';
import type { Conversation, Message, Quote } from '../types';

type ChatState = {
  conversations: readonly Conversation[];
  /** Thay cả danh sách bằng bản của server (chế độ LIVE). */
  hydrate: (list: readonly Conversation[]) => void;
  /** Đặt lịch sử một cuộc (mở cuộc / hỏi bù sau khi nối lại). */
  setMessages: (chatId: string, messages: readonly Message[]) => void;
  /** Thêm tin của mình (đang gửi). Ảnh đang ghim + tin đang trích đi kèm rồi xoá. */
  push: (chatId: string, m: Omit<Message, 'about' | 'quote' | 'mine' | 'status'>) => Message | null;
  /** Server đã lưu tin `clientId`. */
  ack: (chatId: string, clientId: string, id: string, seq: number) => void;
  fail: (chatId: string, clientId: string) => void;
  retry: (chatId: string, clientId: string) => Message | null;
  /** Tin của người kia (hoặc của mình từ máy khác). Trùng `clientId` thì bỏ qua. */
  receive: (chatId: string, m: Message) => void;
  receiveRead: (chatId: string, seq: number) => void;
  receiveTyping: (chatId: string, until: number) => void;
  receivePresence: (userId: string, online: boolean) => void;
  markSeen: (chatId: string) => void;
  setBackground: (chatId: string, bg: TChatBackground) => void;
  setQuote: (chatId: string, quote: Quote | undefined) => void;
  openAbout: (friend: Author, photo: PhotoSource, caption: string | undefined) => string;
  open: (friend: Author) => string;
  clearReply: (id: string) => void;
};

const patch = (
  list: readonly Conversation[],
  id: string,
  fn: (c: Conversation) => Conversation,
): readonly Conversation[] => list.map((c) => (c.id === id ? fn(c) : c));

const blank = (friend: Author): Conversation => ({
  id: friend.id,
  friend,
  messages: [],
  background: 'default',
  peerReadSeq: 0,
  unread: 0,
});

export const useChats = create<ChatState>((set, get) => ({
  conversations: SEED_CHATS,

  hydrate: (list) => set({ conversations: list }),

  setMessages: (chatId, messages) =>
    set((s) => ({ conversations: patch(s.conversations, chatId, (c) => ({ ...c, messages })) })),

  push: (chatId, m) => {
    const c = get().conversations.find((x) => x.id === chatId);
    if (!c) return null;
    const msg: Message = { ...m, mine: true, status: 'sending', about: c.replyTo, quote: c.quote };
    set((s) => ({
      conversations: moveTop(
        patch(s.conversations, chatId, (x) => ({
          ...x,
          replyTo: undefined,
          quote: undefined,
          messages: [...x.messages, msg],
        })),
        chatId,
      ),
    }));
    return msg;
  },

  ack: (chatId, clientId, id, seq) =>
    set((s) => ({
      conversations: patch(s.conversations, chatId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.clientId === clientId
            ? { ...m, id, seq, status: m.status === 'read' ? 'read' : 'sent' }
            : m,
        ),
      })),
    })),

  fail: (chatId, clientId) =>
    set((s) => ({
      conversations: patch(s.conversations, chatId, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.clientId === clientId ? { ...m, status: 'failed' } : m)),
      })),
    })),

  retry: (chatId, clientId) => {
    let again: Message | null = null;
    set((s) => ({
      conversations: patch(s.conversations, chatId, (c) => ({
        ...c,
        messages: c.messages.map((m) => {
          if (m.clientId !== clientId) return m;
          again = { ...m, status: 'sending' };
          return again;
        }),
      })),
    }));
    return again;
  },

  receive: (chatId, m) =>
    set((s) => {
      const c = s.conversations.find((x) => x.id === chatId);
      if (!c) return s;
      // Tin của mình vọng lại (từ máy khác hoặc ack tới sau) — gộp, không nhân đôi.
      if (c.messages.some((x) => x.clientId === m.clientId)) {
        return {
          conversations: patch(s.conversations, chatId, (x) => ({
            ...x,
            messages: x.messages.map((y) =>
              y.clientId === m.clientId ? { ...y, id: m.id, seq: m.seq, status: y.status ?? 'sent' } : y,
            ),
          })),
        };
      }
      return {
        conversations: moveTop(
          patch(s.conversations, chatId, (x) => ({
            ...x,
            typingUntil: undefined,
            unread: m.mine ? x.unread : x.unread + 1,
            messages: [...x.messages, m],
          })),
          chatId,
        ),
      };
    }),

  receiveRead: (chatId, seq) =>
    set((s) => ({
      conversations: patch(s.conversations, chatId, (c) => ({
        ...c,
        peerReadSeq: Math.max(c.peerReadSeq, seq),
        messages: c.messages.map((m) =>
          m.mine && m.seq !== undefined && m.seq <= seq ? { ...m, status: 'read' } : m,
        ),
      })),
    })),

  receiveTyping: (chatId, until) =>
    set((s) => ({ conversations: patch(s.conversations, chatId, (c) => ({ ...c, typingUntil: until })) })),

  receivePresence: (userId, online) =>
    set((s) => ({
      conversations: s.conversations.map((c) => (c.friend.id === userId ? { ...c, online } : c)),
    })),

  markSeen: (chatId) =>
    set((s) => ({ conversations: patch(s.conversations, chatId, (c) => ({ ...c, unread: 0 })) })),

  setBackground: (chatId, background) =>
    set((s) => ({ conversations: patch(s.conversations, chatId, (c) => ({ ...c, background })) })),

  setQuote: (chatId, quote) =>
    set((s) => ({ conversations: patch(s.conversations, chatId, (c) => ({ ...c, quote })) })),

  openAbout: (friend, photo, caption) => {
    set((s) => {
      const replyTo = { photo, caption };
      if (s.conversations.some((c) => c.id === friend.id)) {
        return { conversations: patch(s.conversations, friend.id, (c) => ({ ...c, replyTo })) };
      }
      // Cuộc mới lên ĐẦU danh sách: nó là cái vừa xảy ra.
      return { conversations: [{ ...blank(friend), replyTo }, ...s.conversations] };
    });
    return friend.id;
  },

  open: (friend) => {
    set((s) =>
      s.conversations.some((c) => c.id === friend.id)
        ? s
        : { conversations: [blank(friend), ...s.conversations] },
    );
    return friend.id;
  },

  clearReply: (id) =>
    set((s) => ({ conversations: patch(s.conversations, id, (c) => ({ ...c, replyTo: undefined })) })),
}));

/** Cuộc vừa có tin lên đầu danh sách — như mọi app nhắn tin. */
function moveTop(list: readonly Conversation[], id: string): readonly Conversation[] {
  const i = list.findIndex((c) => c.id === id);
  if (i <= 0) return list;
  const c = list[i]!;
  return [c, ...list.slice(0, i), ...list.slice(i + 1)];
}
