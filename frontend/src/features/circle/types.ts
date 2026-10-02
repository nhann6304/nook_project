/** Một người trong góc. Cấp thân CHỈ hai người trong cặp thấy — đây là góc nhìn của mình. */
export type Friend = {
  id: string;
  name: string;
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
