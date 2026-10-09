/** Thứ chat giữ trên từng socket — chỉ sống trong bộ nhớ, mất cũng không sao. */
export interface IChatSocketState {
  /** chatId → người kia. Để "đang gõ" không phải hỏi bảng mỗi lần. */
  peers: Map<string, string>;
  /** chatId → lần cuối báo đang gõ. */
  typedAt: Map<string, number>;
}
