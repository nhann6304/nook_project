/**
 * Nook — token thiết kế. NGUỒN SỰ THẬT DUY NHẤT.
 *
 * Luật: không một mã màu, không một con số khoảng cách nào được viết thẳng
 * trong component. ESLint chặn cứng (xem eslint.config.js). Cần màu mới thì
 * thêm token ở đây, kèm lý do — đừng thêm hex vào chỗ đang code.
 *
 * Mọi tỉ lệ tương phản ghi trong file này đều là số ĐO THẬT theo công thức
 * WCAG 2.1 trên nền `bg` (#0E0D0C), không phải ước lượng.
 */

/* ══════════════ MÀU ══════════════ */

/**
 * Song sắc cam → hồng. Bản trước chỉ có một sắc cam: đúng nhưng nguội, và trên
 * màn hình chủ đầy icon bão hoà cao thì lẫn vào đám đông. Thêm sắc hồng ở đầu
 * kia của dải làm nút chính có chiều sâu mà vẫn không thành cam quảng cáo.
 */
export const color = {
  /* — Nền, xếp từ sâu nhất lên trên — */
  bg: '#0E0D0C',
  /** Chìm hơn nền: đáy ô nhập, rãnh của thanh chuyển. */
  surfaceSunken: '#141312',
  /** Mặt phẳng thứ nhất: thẻ, pill, ô nhập. */
  surface: '#1A1817',
  /** Nổi lên trên surface: sheet, ô đang focus, thẻ được chọn. */
  surfaceRaised: '#221F1D',

  /* — Đường kẻ — */
  /** Viền ô nhập, viền thẻ. 1.45:1 — là đường kẻ, không phải chữ. */
  border: '#332E2A',
  /** Kẻ mảnh giữa các hàng trong danh sách. */
  borderSoft: '#241F1D',

  /* — Sắc chính — */
  /** Cam lửa. 7.49:1. Dùng cho viền focus, icon đang bật, nét nhấn. */
  accent: '#FF7A3D',
  /** Hồng. 6.20:1. Đầu kia của dải; điểm nhấn phụ, huy hiệu, tim. */
  accent2: '#FF4E8A',
  /** Đỉnh sáng. 9.75:1. Hào quang, vòng ngoài của dấu hiệu. */
  accentBright: '#FFA166',
  /** Nấc tối khi nhấn giữ. 5.23:1. */
  accentDeep: '#E05A22',

  /* — Chữ —
   * text 16.12:1 · textMuted 7.23:1 · textFaint 5.03:1 · textDisabled 2.55:1
   * textDisabled KHÔNG đạt chuẩn đọc. Nó chỉ dùng cho chữ đã tắt và nét trang
   * trí. Chữ nhỏ nhất mà người ta phải đọc được là textFaint. */
  text: '#EFE9E3',
  textMuted: '#A79C93',
  textFaint: '#8A8078',
  textDisabled: '#5C5249',

  /**
   * Chữ NẰM TRÊN nút gradient. Không phải màu trắng.
   * Đo trên ba chặng của dải: #1A0E08 cho 8.37 / 6.85 / 6.47:1 — đạt ở cả ba.
   * Chữ trắng chỉ được 2.26 / 2.76 / 2.92:1 — trượt chuẩn ở mọi chặng.
   * Đây là lý do nút chính của Nook có chữ tối.
   */
  onAccent: '#1A0E08',

  /* — Màu mang nghĩa. Tách hẳn khỏi sắc chính để không ai nhầm
       "màu thương hiệu" với "trạng thái xấu". — */
  honey: '#FFC94D', // 12.68:1 — chuỗi ngày, thành tựu
  mint: '#4FD1A5', //  10.17:1 — xong, đã gửi
  violet: '#A77BFF', //  6.40:1 — mới, chưa xem
  danger: '#FF6B6B', //  7.00:1 — lỗi, huỷ, xoá
} as const;

/**
 * Lớp phủ trong suốt. Viết sẵn thành token vì rgba() bị ESLint chặn trong
 * component — và vì ba vòng hào quang phải luôn cùng một bộ số, không thì
 * mỗi màn một kiểu sáng.
 */
export const alpha = {
  glowStrong: 'rgba(255,122,61,0.12)',
  glowSoft: 'rgba(255,122,61,0.08)',
  glowFaint: 'rgba(255,122,61,0.05)',
  glowPink: 'rgba(255,78,138,0.10)',
  /** Lớp mờ đè lên ảnh để chữ nổi lên được. */
  scrim: 'rgba(14,13,12,0.60)',
  scrimSoft: 'rgba(14,13,12,0.35)',
  /** Nền pill nổi trên ảnh chụp. */
  onPhoto: 'rgba(14,13,12,0.55)',
} as const;

/**
 * Dải màu. Cần `expo-linear-gradient`.
 * Nút một màu phẳng trên nền gần đen trông như miếng dán; dải màu làm nó
 * trông có ánh sáng chiếu vào.
 *
 * Ba chặng chứ không phải hai: chặng giữa #FF6E52 giữ cho quãng cam→hồng
 * không đi vòng qua vùng đỏ xỉn ở giữa.
 */
export const gradient = {
  warm: ['#FF8F4D', '#FF6E52', '#FF5C90'] as const,
  warmPressed: ['#E05A22', '#D14E3E', '#D6437A'] as const,
  /** Góc chiếu 118°: từ trên-trái xuống dưới-phải, hơi nghiêng. */
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

/** Vòng độ thân, cấp 1 → 10. Đi từ nâu tro tới cam rồi chớm hồng ở cấp cuối. */
export const friendshipRing = [
  '#3D3330',
  '#4A3B33',
  '#5F4738',
  '#74533D',
  '#8B6043',
  '#A26B46',
  '#C07547',
  '#DC7F43',
  '#FF7A3D',
  '#FF5C90',
] as const;

export function ringColor(level: number): string {
  const i = Math.min(Math.max(Math.round(level), 1), friendshipRing.length) - 1;
  return friendshipRing[i] ?? friendshipRing[0];
}

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
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  /** Khung ngắm camera và thẻ ảnh. Một con số, dùng ở cả hai chỗ. */
  frame: 32,
  full: 999,
} as const;

/* ══════════════ CHỮ ══════════════ */

export const font = {
  /** Chữ thân. Be Vietnam Pro là bộ vẽ dấu tiếng Việt tử tế nhất trong tầm miễn phí. */
  body: 'BeVietnamPro_400Regular',
  bodyMedium: 'BeVietnamPro_500Medium',
  bodySemi: 'BeVietnamPro_600SemiBold',
  /**
   * Chữ trưng bày. CHỈ dùng cho wordmark "nook" ở màn Chào mừng.
   * Không dùng cho chữ tiếng Việt có dấu — Fredoka vẽ dấu không đủ đẹp.
   */
  display: 'Fredoka_600SemiBold',
} as const;

/**
 * Sáu bậc, không hơn. Thêm bậc thứ bảy là bắt đầu có hai thứ trông gần giống nhau.
 *
 * maxScale giới hạn phóng chữ để layout không vỡ khi người dùng bật cỡ chữ lớn,
 * nhưng vẫn cho phóng — không bao giờ khoá allowFontScaling.
 */
export const type = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: font.display, maxScale: 1.25 },
  title: { fontSize: 22, lineHeight: 30, fontFamily: font.bodySemi, maxScale: 1.4 },
  section: { fontSize: 17, lineHeight: 24, fontFamily: font.bodyMedium, maxScale: 1.4 },
  body: { fontSize: 14, lineHeight: 21, fontFamily: font.body, maxScale: 1.6 },
  label: { fontSize: 12, lineHeight: 17, fontFamily: font.bodyMedium, maxScale: 1.5 },
  faint: { fontSize: 11, lineHeight: 16, fontFamily: font.body, maxScale: 1.5 },
} as const;

/* ══════════════ BỐ CỤC ══════════════ */

export const layout = {
  /**
   * Khung ngắm camera = 88% CHIỀU NGANG máy. Không tính theo chiều dọc.
   * Máy dài hơn thì phần thừa thành khoảng thở, khung KHÔNG giãn ra.
   */
  cameraFrameRatio: 0.88,
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

/**
 * Bóng cùng màu nút, không phải bóng đen: nút trông như đang PHÁT SÁNG
 * chứ không phải đang nổi lên khỏi mặt phẳng. Trên nền gần đen, bóng đen
 * là vô hình.
 */
export const elevation = {
  glowAccent: {
    shadowColor: color.accent,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  glowAccentPressed: {
    shadowColor: color.accent,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  none: {
    shadowOpacity: 0,
    elevation: 0,
  },
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
