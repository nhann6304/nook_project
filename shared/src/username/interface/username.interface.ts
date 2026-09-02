import type { TUsernameProblem } from '../type/index.js';

/** Kết quả hỏi "tên này còn trống không". */
export interface IUsernameCheck {
  /** Dạng chuẩn mà server dùng để so sánh. App hiện lại cho người ta thấy. */
  key: string;
  available: boolean;
  /** `null` khi còn trống. Có giá trị thì app tra ra câu chữ. */
  problem: TUsernameProblem;
}
