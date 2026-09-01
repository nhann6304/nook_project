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
   * Khung ngắm camera. To hơn hẳn `frame` vì khối này to hơn hẳn: cùng một độ
   * bo, đặt trên một ô 360pt thì trông vuông vức, đặt trên ô 160pt thì trông
   * tròn. Độ bo phải đi theo kích thước mới giữ được cùng một cảm giác.
   *
   * Con số 56 đo từ ảnh chụp màn hình Locket (máy 414pt): mép trái của khung
   * chạm x=0 ở khoảng 56pt tính từ mép trên. Đó là dáng "squircle" chứ không
   * còn là hình vuông bo góc.
   */
  viewfinder: 56,
  full: 999,
} as const;

/* ══════════════ CHỮ ══════════════ */

export const font = {
  /** Chữ thân. Be Vietnam Pro là bộ vẽ dấu tiếng Việt tử tế nhất trong tầm miễn phí. */
  body: 'BeVietnamPro_400Regular',
  bodyMedium: 'BeVietnamPro_500Medium',
  bodySemi: 'BeVietnamPro_600SemiBold',
} as const;

/*
 * Không có "phông trưng bày" riêng, và đó là chủ đích.
 *
 * Trước đây bậc `display` dùng Fredoka. Nhưng bậc đó chỉ dùng đúng một chỗ:
 * tiêu đề màn Chào mừng — mà tiêu đề đó là tiếng Việt đầy dấu, đúng loại chữ
 * Fredoka vẽ xấu nhất. Cái tên "nook" giờ vẽ bằng SVG (xem Wordmark) nên không
 * còn ai cần Fredoka nữa; gói phông đã gỡ khỏi dự án.
 */

/**
 * Sáu bậc, không hơn. Thêm bậc thứ bảy là bắt đầu có hai thứ trông gần giống nhau.
 *
 * maxScale giới hạn phóng chữ để layout không vỡ khi người dùng bật cỡ chữ lớn,
 * nhưng vẫn cho phóng — không bao giờ khoá allowFontScaling.
 */
export const type = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: font.bodySemi, maxScale: 1.25 },
  title: { fontSize: 22, lineHeight: 30, fontFamily: font.bodySemi, maxScale: 1.4 },
  section: { fontSize: 17, lineHeight: 24, fontFamily: font.bodyMedium, maxScale: 1.4 },
  body: { fontSize: 14, lineHeight: 21, fontFamily: font.body, maxScale: 1.6 },
  label: { fontSize: 12, lineHeight: 17, fontFamily: font.bodyMedium, maxScale: 1.5 },
  faint: { fontSize: 11, lineHeight: 16, fontFamily: font.body, maxScale: 1.5 },
} as const;

/* ══════════════ BỐ CỤC ══════════════ */

export const layout = {
  /**
   * Khung ngắm camera = 100% CHIỀU NGANG máy — TRẦN, không phải số cố định.
   *
   * Khung là hình vuông và nó lấy cạnh bằng số NHỎ HƠN giữa hai thứ: 94% bề
   * ngang máy, và chiều cao thật còn lại sau khi trừ thanh trên / hàng chụp /
   * chân màn. Nhờ vậy máy dài thì khung to hết cỡ ngang, máy ngắn thì khung tự
   * co lại cho vừa chứ không tràn ra ngoài.
   *
   * Đo trên ảnh Locket (máy 414pt): khung của họ rộng 413pt — lề trái 0pt, lề
   * phải 1pt. Tức là TRÀN SÁT MÉP. Và nó VUÔNG (tỉ lệ 0.999), không phải hình
   * đứng — cảm giác "cao" mà người ta thấy đến từ việc nó tràn mép, không phải
   * từ tỉ lệ. Đây là lý do Nook giữ hình vuông: widget và thẻ ảnh trong feed
   * đều vuông, đổi tỉ lệ là phải cắt ảnh ở hai chỗ đó.
   */
  cameraFrameRatio: 1,
  /** Vùng chạm tối thiểu. Apple khuyến nghị 44pt, Android 48dp — lấy số lớn hơn. */
  minTouch: 48,
  screenPadding: 16,
  /**
   * Trần bề ngang của khối chữ. Máy gập mở ra rộng 674pt; không chặn thì
   * một dòng dài 90 ký tự, đọc mỏi mắt.
   */
  maxTextWidth: 480,
  /** Chiều cao ô nhập và nút chính. Ngón cái phải bấm trúng ngay lần đầu. */
  controlHeight: 52,
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
