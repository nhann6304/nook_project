export const CIRCLE_LIMITS = {
  /** Số chỗ trong góc khi mới mở tài khoản */
  circleBase: 10,
  /** Trần tuyệt đối, dù mở khoá được bao nhiêu thành tích đi nữa */
  circleMax: 35,
} as const;

/**
 * Mốc cấp thân — số ký ức cần để CHẠM tới từng cấp.
 *
 *   chỉ số = cấp − 1.  LEVEL_MEMORIES[0] = 0 là cấp 1, ai cũng bắt đầu ở đó.
 *
 * Ở đây chỉ có MỐC. Cách tính một tương tác thành ký ức nằm ở server và không
 * bao giờ được mang sang app — app mà tính được thì app cũng gian được.
 *
 * Luật sản phẩm: cấp thân CHỈ hai người trong cặp nhìn thấy.
 */
export const LEVEL_MEMORIES = [0, 7, 20, 35, 60, 90, 130, 200, 280, 365] as const;

export const MAX_LEVEL = LEVEL_MEMORIES.length;
