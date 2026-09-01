/**
 * Style dùng chung — những khối lặp lại ở hầu hết mọi màn.
 *
 * Đây KHÔNG phải chỗ đổ style linh tinh. Một style chỉ được vào đây khi nó
 * đã xuất hiện ở ít nhất ba màn. Dưới ba thì để tại chỗ; quá tay thì file này
 * thành cái sọt rác và không ai dám sửa gì trong đó nữa.
 */
import { StyleSheet } from 'react-native';
import { color, layout, radius, space } from './tokens';

export const common = StyleSheet.create({
  /* — Nền — */
  fill: { flex: 1 },
  fillBg: { flex: 1, backgroundColor: color.bg },

  /* — Căn — */
  center: { alignItems: 'center', justifyContent: 'center' },
  centerX: { alignItems: 'center' },
  centerY: { justifyContent: 'center' },

  /* — Hàng — */
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

  /* — Lề màn — */
  padded: { paddingHorizontal: layout.screenPadding },
  /** Khối chữ dài. Chặn trần bề ngang để máy gập không kéo dòng ra 90 ký tự. */
  textBlock: { maxWidth: layout.maxTextWidth, alignSelf: 'center', width: '100%' },

  /* — Bề mặt — */
  card: { backgroundColor: color.surface, borderRadius: radius.lg, padding: space.lg },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: color.borderSoft },

  /* — Chữ — */
  textCenter: { textAlign: 'center' },

  /* — Vùng chạm — */
  touchTarget: {
    minWidth: layout.minTouch,
    minHeight: layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* — Phủ toàn phần — */
  absoluteFill: StyleSheet.absoluteFill,
});

/** hitSlop mặc định cho những nút icon nhỏ hơn vùng chạm chuẩn. */
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;
