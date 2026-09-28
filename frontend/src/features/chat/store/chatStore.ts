/**
 * Kho trò chuyện.
 *
 * Đang giữ trong bộ nhớ: đóng app là mất. Có chủ đích — nguồn thật sẽ là
 * server, viết một lớp lưu xuống đĩa bây giờ là viết một thứ sắp bị xoá.
 *
 * `openAbout` là chỗ nối giữa Khoảnh khắc và Trò chuyện: chạm ô nhắn dưới một
 * tấm ảnh thì hoặc mở lại cuộc trò chuyện cũ với người đó (và đổi tấm ảnh đang
 * ghim), hoặc tạo mới nếu chưa từng nói chuyện. Một người ĐÚNG MỘT cuộc trò
 * chuyện, không bao giờ đẻ ra hai luồng song song cho cùng một người.
 */
import { create } from 'zustand';
import type { Author, PhotoSource } from '@/features/feed/types';
import { SEED_CHATS } from '@/mocks/chats';
import type { Conversation } from '../types';

let seq = 0;
/** Không dùng Math.random: id chỉ cần duy nhất trong một lượt mở app. */
const nextId = () => `m-${++seq}`;

type ChatState = {
  conversations: readonly Conversation[];
  /** Gửi một tin. Cuộc đang có ảnh chờ trả lời thì ảnh đó đi kèm tin này. */
  send: (id: string, text: string, at: number) => void;
  /** Mở (hoặc tạo) cuộc trò chuyện, đặt tấm ảnh chờ trả lời. Trả về id. */
  openAbout: (friend: Author, photo: PhotoSource, caption: string | undefined) => string;
  /** Mở (hoặc tạo rỗng) cuộc trò chuyện với một người, không kèm ảnh. */
  open: (friend: Author) => string;
  /** Bỏ tấm ảnh đang chờ — người dùng bấm X trên ô soạn. */
  clearReply: (id: string) => void;
};

export const useChats = create<ChatState>((set) => ({
  conversations: SEED_CHATS,

  send: (id, text, at) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id
          ? {
              ...c,
              replyTo: undefined,
              messages: [...c.messages, { id: nextId(), text, at, mine: true, about: c.replyTo }],
            }
          : c,
      ),
    })),

  openAbout: (friend, photo, caption) => {
    set((s) => {
      const found = s.conversations.find((c) => c.id === friend.id);
      const replyTo = { photo, caption };
      if (found) {
        return {
          conversations: s.conversations.map((c) => (c.id === friend.id ? { ...c, replyTo } : c)),
        };
      }
      // Cuộc mới lên ĐẦU danh sách: nó là cái vừa xảy ra.
      return { conversations: [{ id: friend.id, friend, messages: [], replyTo }, ...s.conversations] };
    });
    return friend.id;
  },

  open: (friend) => {
    set((s) =>
      s.conversations.some((c) => c.id === friend.id)
        ? s
        : { conversations: [{ id: friend.id, friend, messages: [] }, ...s.conversations] },
    );
    return friend.id;
  },

  clearReply: (id) =>
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === id ? { ...c, replyTo: undefined } : c)),
    })),
}));
