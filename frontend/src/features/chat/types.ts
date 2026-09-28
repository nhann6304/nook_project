/**
 * Kiểu của trò chuyện. Để riêng file này chứ không để trong màn hình: kho
 * trạng thái, dữ liệu mẫu và cả backend sau này đều cần nó, mà không cái nào
 * trong ba cái đó nên phải import một màn hình.
 */
import type { Author, PhotoSource } from '@/features/feed/types';

/** Khoảnh khắc mà một tin nhắn đang trả lời. */
export type About = { photo: PhotoSource; caption?: string };

export type Message = {
  id: string;
  text: string;
  /** epoch ms */
  at: number;
  mine: boolean;
  /**
   * Tin này trả lời tấm ảnh nào. Gắn vào TỪNG TIN chứ không vào cả cuộc: một
   * cuộc trò chuyện đi qua nhiều tấm ảnh, và cuộn lên phải thấy mỗi câu đang
   * nói về tấm nào.
   */
  about?: About;
};

export type Conversation = {
  id: string;
  friend: Author;
  messages: readonly Message[];
  /** Ảnh đang chờ được trả lời — hiện trên ô soạn, gắn vào tin kế tiếp. */
  replyTo?: About;
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
