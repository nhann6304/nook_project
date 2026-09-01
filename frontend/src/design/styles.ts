/**
 * Style dùng chung — những khối lặp lại ở hầu hết mọi màn.
 *
 * Đây KHÔNG phải chỗ đổ style linh tinh. Một style chỉ được vào đây khi nó
 * đã xuất hiện ở ít nhất ba màn. Dưới ba thì để tại chỗ; quá tay thì file này
 * thành cái sọt rác và không ai dám sửa gì trong đó nữa.
 */
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { color, layout, radius, space } from './tokens';

/**
 * Khai kiểu từng mục thay vì để TypeScript tự suy.
 * Không khai thì mỗi mục ra kiểu hợp `ViewStyle | TextStyle | ImageStyle`,
 * và lúc đó không truyền thẳng vào `style` của <View> được nữa.
 */
type Common = {
  fill: ViewStyle;
  fillBg: ViewStyle;
  center: ViewStyle;
  centerX: ViewStyle;
  centerY: ViewStyle;
  row: ViewStyle;
  rowBetween: ViewStyle;
  rowCenter: ViewStyle;
  padded: ViewStyle;
  textBlock: ViewStyle;
  card: ViewStyle;
  hairline: ViewStyle;
  textCenter: TextStyle;
  touchTarget: ViewStyle;
  absoluteFill: ViewStyle;
};

export const common = StyleSheet.create<Common>({
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
  absoluteFill: StyleSheet.absoluteFillObject,
});

/** hitSlop mặc định cho những nút icon nhỏ hơn vùng chạm chuẩn. */
/**
 * Style cho ẢNH. Tách khỏi `common` vì `ImageStyle` không nhận `overflow:'scroll'`
 * mà `ViewStyle` thì có — truyền một style của View vào <Img> là tsc báo đỏ.
 */
type Media = { fill: ImageStyle; cover: ImageStyle };

export const media = StyleSheet.create<Media>({
  /** Lấp kín cha. Dùng cho ảnh đè lên khung camera. */
  fill: StyleSheet.absoluteFillObject,
  /** Ô vuông tràn bề ngang — thẻ ảnh trong feed. */
  cover: { width: '100%', aspectRatio: 1, borderRadius: radius.frame },
});

export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;
