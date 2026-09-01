/**
 * Kiểu của trò chuyện. Để riêng file này chứ không để trong màn hình: kho
 * trạng thái, dữ liệu mẫu và cả backend sau này đều cần nó, mà không cái nào
 * trong ba cái đó nên phải import một màn hình.
 */
import type { Author, PhotoSource } from '@/features/feed/types';

export type Message = {
  id: string;
  text: string;
  /** epoch ms */
  at: number;
  /** Tin của chính mình — căn phải, nền màu nhấn. */
  mine: boolean;
};

/**
 * Một cuộc trò chuyện = một người bạn. KHÔNG có nhóm.
 *
 * Đây là luật sản phẩm, không phải giới hạn kỹ thuật: Nook đo độ thân theo
 * từng CẶP, mà trong một nhóm thì không ai biết ai đang nói với ai. Thêm nhóm
 * là bỏ cả hệ "ký ức".
 */
export type Conversation = {
  /** Trùng id người bạn — một người đúng một cuộc trò chuyện. */
  id: string;
  friend: Author;
  messages: readonly Message[];
  /**
   * Khoảnh khắc đã mở ra cuộc trò chuyện này, ghim ở đầu màn làm ngữ cảnh.
   * Mở lại từ một khoảnh khắc khác thì cái ghim đổi theo — cuộc trò chuyện thì
   * vẫn là một.
   */
  about?: { photo: PhotoSource; caption?: string };
};

/** Tin cuối, cho danh sách. `undefined` khi chưa ai nói gì. */
export function lastMessage(c: Conversation): Message | undefined {
  return c.messages[c.messages.length - 1];
}
