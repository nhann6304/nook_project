import type { TChatBackground } from '@nook/shared';

/** Một dòng của danh sách chat, nhìn từ phía MỘT người. */
export interface IChatSummaryRow {
  id: string;
  lastSeq: number;
  /** `last_message_at`, chưa có tin thì lúc mở cuộc — để sắp và làm con trỏ. */
  activeAt: Date;
  peerId: string;
  peerReadSeq: number;
  background: TChatBackground;
  unread: number;
}
