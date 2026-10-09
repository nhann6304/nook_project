import type { TChatBackground, TChatMessageKind } from '../../type/index.js';

// ── Chat 1-1 ────────────────────────────────────────────────────────────────
//
// GET  /v1/chats                       danh sách cuộc, mới nhất trước
// POST /v1/chats                       mở (hoặc lấy lại) cuộc với một người
// GET  /v1/chats/:id/messages          lịch sử, lật về trước bằng `before=seq`
//                                      hoặc lấy phần lỡ khi nối lại bằng `after=seq`
// POST /v1/chats/:id/messages          gửi tin (đường dự phòng của socket `chat.send`)
// POST /v1/chats/:id/read              đã đọc tới `seq`
// PUT  /v1/chats/:id/background        đổi nền (chỉ phía mình)

/** Một tin nhắn. `seq` tăng dần TRONG một cuộc — dùng để sắp, đọc tới đâu, hỏi bù. */
export interface IChatMessage {
  id: string;
  chatId: string;
  seq: number;
  senderId: string;
  kind: TChatMessageKind;
  /** Chữ (kind `text`) hoặc mã sticker (kind `sticker`). */
  body: string | null;
  /** Ảnh đã tải lên (kind `image`) — ảnh GỐC, không nén lại. */
  mediaId: string | null;
  replyToId: string | null;
  /** Do app sinh — gửi lại cùng `clientId` thì nhận lại đúng tin cũ. */
  clientId: string;
  createdAt: string;
}

export interface IChatPeer {
  id: string;
  name: string;
  username: string | null;
  avatarMediaId: string | null;
}

export interface IChat {
  id: string;
  peer: IChatPeer;
  lastMessage: IChatMessage | null;
  /** Số tin của người kia mình chưa đọc. */
  unread: number;
  /** `seq` cuối người kia đã đọc — để vẽ hai dấu ✓✓. */
  peerReadSeq: number;
  /** Nền mình chọn cho cuộc này. */
  background: TChatBackground;
}

export interface IOpenChatBody {
  userId: string;
}

export interface ISendChatMessageBody {
  clientId: string;
  kind: TChatMessageKind;
  body?: string;
  mediaId?: string;
  replyToId?: string;
}

/** Thân socket `chat.send` — như REST, thêm `chatId`. */
export interface ISendChatMessageEvent extends ISendChatMessageBody {
  chatId: string;
}

export interface IChatReadBody {
  seq: number;
}

export interface IChatReadEvent {
  chatId: string;
  userId: string;
  seq: number;
}

export interface IChatTypingEvent {
  chatId: string;
  userId: string;
}

export interface IChatPresenceEvent {
  userId: string;
  online: boolean;
}

export interface IChatBackgroundBody {
  background: TChatBackground;
}

/** Truy vấn lịch sử: `before` lật về trước, `after` hỏi bù sau khi nối lại. */
export interface IChatMessagesQuery {
  before?: number;
  after?: number;
  limit?: number;
}
