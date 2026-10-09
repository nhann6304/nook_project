/**
 * Kiểu của trò chuyện. Để riêng file này chứ không để trong màn hình: kho
 * trạng thái, lớp realtime và dữ liệu mẫu đều cần nó.
 *
 * Hình dạng bám `IChatMessage` / `IChat` bên `@nook/shared` (09/10/2026), cộng
 * phần CHỈ app có: trạng thái gửi, ảnh khoảnh khắc đang trả lời.
 */
import type { TChatBackground, TChatMessageKind } from '@nook/shared/model/type';
import type { Author, PhotoSource } from '@/features/feed/types';
import type { StickerId } from './utils/stickers.generated';

/** Khoảnh khắc mà một tin nhắn đang trả lời. */
export type About = { photo: PhotoSource; caption?: string };

/**
 * Vòng đời một tin của MÌNH: `sending` (hiện ngay, đồng hồ nhỏ) → `sent` (✓,
 * server đã lưu) → `read` (✓✓, người kia đã đọc). `failed` thì chạm để gửi lại.
 */
export type MessageStatus = 'sending' | 'sent' | 'read' | 'failed';

/** Trích một tin khác (giữ lâu → Trả lời). */
export type Quote = { id: string; text: string; mine: boolean };

export type Message = {
  /** Id của server; tin chưa lên server thì tạm dùng `clientId`. */
  id: string;
  /** Do app sinh — gửi lại cùng mã thì server không tạo tin thứ hai. */
  clientId: string;
  /** Thứ tự trong cuộc. Tin đang gửi chưa có. */
  seq?: number;
  kind: TChatMessageKind;
  text: string;
  sticker?: StickerId;
  image?: PhotoSource;
  /** epoch ms */
  at: number;
  mine: boolean;
  status?: MessageStatus;
  quote?: Quote;
  /**
   * Tin này trả lời tấm ảnh nào. Gắn vào TỪNG TIN chứ không vào cả cuộc: một
   * cuộc đi qua nhiều tấm ảnh, cuộn lên phải thấy mỗi câu nói về tấm nào.
   */
  about?: About;
};

export type Conversation = {
  id: string;
  friend: Author;
  messages: readonly Message[];
  /** Ảnh đang chờ được trả lời — hiện trên ô soạn, gắn vào tin kế tiếp. */
  replyTo?: About;
  /** Tin đang được trích (giữ lâu → Trả lời). */
  quote?: Quote;
  background: TChatBackground;
  /** `seq` cuối người kia đã đọc. */
  peerReadSeq: number;
  /** Số tin của người kia mình chưa xem. */
  unread: number;
  /** Người kia đang gõ — tới mốc này (epoch ms) thì thôi. */
  typingUntil?: number;
  online?: boolean;
};

export function lastMessage(c: Conversation): Message | undefined {
  return c.messages[c.messages.length - 1];
}

/** Tấm ảnh gần nhất cuộc này nói tới — cho ảnh nhỏ ở danh sách tin nhắn. */
export function lastAbout(c: Conversation): About | undefined {
  if (c.replyTo) return c.replyTo;
  for (let i = c.messages.length - 1; i >= 0; i--) {
    const about = c.messages[i]?.about;
    if (about) return about;
  }
  return undefined;
}
