/** Một người trong góc. Cấp thân CHỈ hai người trong cặp thấy — đây là góc nhìn của mình. */
export type Friend = {
  id: string;
  name: string;
  /** @tên riêng, không kèm "@". Để tag vào chú thích ảnh. */
  username: string;
  uri?: string;
  level: number;
  dormant?: boolean;
  /** Lần gần nhất có gì đó giữa hai người, epoch ms. */
  lastAt?: number;
  lastKind?: 'photo' | 'message';
  memories?: number;
  /** Số ngày đã ở cùng góc. */
  days?: number;
  /** Còn bao nhiêu ký ức nữa tới cấp sau. */
  toNext?: number;
};

export const CIRCLE_SIZE = 10;

/** Một người dùng Nook chưa ở trong góc — kết quả của ô tìm bạn. */
export type Person = {
  id: string;
  name: string;
  /** Không kèm "@". */
  username: string;
  uri?: string;
};

/** Lời mời người khác gửi cho mình, đang chờ mình nhận. */
export type Invite = Person & {
  /** Lúc họ mời, epoch ms. */
  at: number;
};

/** Quan hệ giữa mình và một người, nhìn từ phía mình. Trùng tên với hợp đồng server. */
export type Relation = 'none' | 'requested' | 'incoming' | 'friend';

export type PersonResult = Person & { relation: Relation };
