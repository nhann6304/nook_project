/**
 * Token KHÔNG đổi theo bảng màu: khoảng cách, bo góc, cỡ chữ, nhịp, bố cục.
 *
 * MÀU không nằm ở đây nữa — nó ở `palettes.ts`, vì người dùng đổi được. Muốn
 * dùng màu thì gọi `useColors()` hoặc `useStyles()`, xem `useStyles.ts`.
 */

/**
 * Góc chiếu của dải màu: từ trên-trái xuống dưới-phải.
 * Là hình học, không phải màu — nên nó ở đây chứ không ở bảng màu.
 */
export const GRADIENT_START = { x: 0, y: 0 } as const;
export const GRADIENT_END = { x: 1, y: 1 } as const;

/* ══════════════ KHÔNG GIAN ══════════════ */

/** Bội số của 4. Đừng dùng số lẻ ngoài thang này. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  /** Góc "chân" của bong bóng tin nhắn — nó nói ra hướng của tin. */
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  /** Thẻ ảnh trong feed. */
  frame: 28,
  /**
   * Khung ảnh chính (camera + khoảnh khắc). 08/10/2026 theo Locket: khung VUÔNG
   * bo lớn, đường cong liền (`borderCurve: 'continuous'` trên iOS) — nhìn dịu
   * hơn bo 40 trên khung đứng.
   */
  viewfinder: 60,
  full: 999,
} as const;

/* ══════════════ CHỮ ══════════════ */

export const font = {
  /**
   * Poppins — theo bảng thiết kế 06/10/2026 (thay Plus Jakarta Sans). Chỉ
   * `display` dùng 800; tiêu đề thường 700 — 800 tràn lan thì nặng như quảng cáo.
   * Chỉ nạp các nét dưới đây — mỗi nét thêm là thêm thời gian giữ màn chờ.
   */
  // 07/10/2026: cả thang lên một nấc ("chữ nhạt quá") — chữ thường là 500,
  // không còn 400; tiêu đề lớn 800.
  body: 'Poppins_500Medium',
  bodyMedium: 'Poppins_600SemiBold',
  bodySemi: 'Poppins_600SemiBold',
  bodyBold: 'Poppins_700Bold',
  heavy: 'Poppins_800ExtraBold',
  /** Chữ viết tay — chỉ cho lời nhấn ngắn ("Một vài mẹo nhỏ"), không cho đoạn văn. */
  hand: 'Caveat_700Bold',
} as const;

/**
 * Bảy bậc. `hand` là bậc trang trí, mỗi màn tối đa một chỗ.
 *
 * maxScale giới hạn phóng chữ để layout không vỡ khi người dùng bật cỡ chữ lớn,
 * nhưng vẫn cho phóng — không bao giờ khoá allowFontScaling.
 * Poppins có phần đầu/đuôi chữ cao hơn Jakarta nên lineHeight ≈ 1.45× cỡ chữ;
 * thấp hơn là dấu tiếng Việt (ỗ, ẫ) bị cắt trên Android.
 */
export const type = {
  display: { fontSize: 34, lineHeight: 46, fontFamily: font.heavy, letterSpacing: -0.6, maxScale: 1.25 },
  title: { fontSize: 24, lineHeight: 34, fontFamily: font.bodyBold, letterSpacing: -0.3, maxScale: 1.4 },
  section: { fontSize: 18, lineHeight: 26, fontFamily: font.bodyBold, letterSpacing: -0.1, maxScale: 1.4 },
  body: { fontSize: 16, lineHeight: 24, fontFamily: font.body, letterSpacing: 0, maxScale: 1.5 },
  label: { fontSize: 15, lineHeight: 22, fontFamily: font.bodySemi, letterSpacing: 0, maxScale: 1.5 },
  faint: { fontSize: 13, lineHeight: 19, fontFamily: font.body, letterSpacing: 0, maxScale: 1.5 },
  hand: { fontSize: 26, lineHeight: 32, fontFamily: font.hand, letterSpacing: 0, maxScale: 1.3 },
} as const;

/* ══════════════ BỐ CỤC ══════════════ */

export const layout = {
  /**
   * Rộng / cao = 1 — VUÔNG như Locket (08/10/2026: khung 0.9 "cảm giác to quá").
   * Trước đó 0.9 (07/10) và 1:1 (02/10). Ảnh chụp
   * được cắt đúng khung này (`squarePhoto`), nên thấy gì gửi nấy. Bề ngang là
   * máy trừ 2×`frameInset`; máy ngắn thì chiều cao chặn trước. Camera và
   * khoảnh khắc dùng CHUNG khung, lướt từ camera sang ảnh bạn bè khung đứng yên.
   */
  cameraFrameRatio: 1,
  frameInset: 8,
  /** Vùng chạm tối thiểu. Apple khuyến nghị 44pt, Android 48dp — lấy số lớn hơn. */
  minTouch: 48,
  screenPadding: 16,
  /**
   * Trần bề ngang của khối chữ. Máy gập mở ra rộng 674pt; không chặn thì
   * một dòng dài 90 ký tự, đọc mỏi mắt.
   */
  maxTextWidth: 480,
  /** Chiều cao ô nhập và nút chính. Ngón cái phải bấm trúng ngay lần đầu. */
  controlHeight: 54,
} as const;

/* ══════════════ CHUYỂN ĐỘNG ══════════════ */

/**
 * Bốn con số. Mọi animation phải lấy thời lượng từ đây.
 *
 * Trần 320ms là cố ý: quá 350ms thì thao tác bắt đầu có cảm giác phải CHỜ.
 * Cái gì cần lâu hơn thì đó là hiệu ứng nền chạy vòng lặp, không phải phản hồi
 * cho thao tác của người dùng.
 */
export const duration = {
  instant: 90,
  fast: 150,
  base: 220,
  slow: 320,
  /** Chuyển cảnh lớn ("mở cửa sổ", ảnh bay về góc). Không phải phản hồi nhấn. */
  scene: 480,
} as const;

/**
 * Đường cong cho chuyển cảnh: vào nhanh, dừng mềm. Là bộ số, không phải hàm —
 * `Easing.bezier(...ease.out)` dựng ở chỗ dùng.
 */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.4, 0, 0.2, 1],
} as const;

/**
 * Lò xo cho Reanimated — TẮT DẦN TỚI HẠN, không vọt quá rồi dội lại.
 * `damping ≥ 2·√(stiffness·mass)` thì lò xo chạy tới nơi rồi đứng yên. Bản cũ
 * (damping 18 / 22) thấp hơn ngưỡng đó, mọi thứ nảy "tưng tưng" (02/10/2026).
 * Đổi `stiffness` hay `mass` thì tính lại `damping` theo công thức trên.
 */
export const spring = {
  /** Phản hồi khi nhấn. Phải dừng trước khi ngón tay kịp rời. */
  press: { damping: 31, stiffness: 380, mass: 0.6 },
  /** Thứ xuất hiện trên màn. */
  enter: { damping: 26, stiffness: 180, mass: 0.9 },
  /** Hiệu ứng nền, thở chậm. */
  gentle: { damping: 26, stiffness: 90, mass: 1 },
} as const;


/** Cường độ rung. Gom một chỗ để không màn nào tự chọn kiểu rung riêng. */
export const haptic = {
  tap: 'light',
  confirm: 'medium',
  capture: 'heavy',
  select: 'selection',
  error: 'error',
} as const;

export type HapticKind = (typeof haptic)[keyof typeof haptic];
