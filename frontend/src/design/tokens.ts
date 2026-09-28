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
  frame: 24,
  /**
   * Khung ảnh chính (camera + khoảnh khắc). Theo bảng thiết kế: 36 trên khung
   * 374pt. Khung đứng 3:4 nên bo vừa phải, bo 56 như trước trông thành viên thuốc.
   */
  viewfinder: 36,
  full: 999,
} as const;

/* ══════════════ CHỮ ══════════════ */

export const font = {
  /**
   * Plus Jakarta Sans — theo bảng thiết kế. Hình chữ gọn, hiện đại, đủ dấu
   * tiếng Việt. Tiêu đề dùng nét 800 và khít chữ: đó là giọng Gen Z của app,
   * đừng hạ về 600 cho "an toàn" — nhìn lại thành app văn phòng.
   */
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemi: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  heavy: 'PlusJakartaSans_800ExtraBold',
} as const;

/**
 * Sáu bậc, không hơn. Thêm bậc thứ bảy là bắt đầu có hai thứ trông gần giống nhau.
 *
 * maxScale giới hạn phóng chữ để layout không vỡ khi người dùng bật cỡ chữ lớn,
 * nhưng vẫn cho phóng — không bao giờ khoá allowFontScaling.
 */
export const type = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: font.heavy, letterSpacing: -1, maxScale: 1.25 },
  title: { fontSize: 24, lineHeight: 30, fontFamily: font.heavy, letterSpacing: -0.6, maxScale: 1.4 },
  section: { fontSize: 17, lineHeight: 22, fontFamily: font.bodyBold, letterSpacing: -0.2, maxScale: 1.4 },
  body: { fontSize: 15, lineHeight: 22, fontFamily: font.body, letterSpacing: 0, maxScale: 1.6 },
  label: { fontSize: 14, lineHeight: 19, fontFamily: font.bodyBold, letterSpacing: 0, maxScale: 1.5 },
  faint: { fontSize: 12, lineHeight: 17, fontFamily: font.bodyMedium, letterSpacing: 0, maxScale: 1.5 },
} as const;

/* ══════════════ BỐ CỤC ══════════════ */

export const layout = {
  /**
   * Khung ảnh = ĐỨNG 3:4 (rộng / cao), theo bảng thiết kế bản 7. Bề ngang là
   * máy trừ 2×`frameInset`; máy ngắn thì chiều cao chặn trước rồi suy ra ngang.
   * Camera và khoảnh khắc dùng CHUNG khung này, nên lướt từ camera sang ảnh bạn
   * bè thì khung đứng yên, chỉ có ảnh trong nó đổi.
   */
  cameraFrameRatio: 3 / 4,
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

/** Độ nảy cho Reanimated. Damping cao = dừng dứt khoát, không rung lắc. */
export const spring = {
  /** Phản hồi khi nhấn. Phải dừng trước khi ngón tay kịp rời. */
  press: { damping: 22, stiffness: 380, mass: 0.6 },
  /** Thứ xuất hiện trên màn. */
  enter: { damping: 18, stiffness: 180, mass: 0.9 },
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
