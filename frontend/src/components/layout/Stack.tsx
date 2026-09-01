/**
 * Row / Col / Spacer — bố cục.
 *
 * Vì sao cần: không có chúng thì mỗi lần xếp hai thứ cạnh nhau, người ta viết
 * style={{flexDirection:'row', gap:12}} — đúng cái kiểu "tự tiện ghi ra" mà
 * ESLint đang chặn, và là chỗ những con số 12 / 13 / 14 lẻ tẻ chui vào code.
 *
 * `gap` chỉ nhận tên trong thang khoảng cách, không nhận số. Muốn 13px thì
 * không có cửa — và đó là chủ đích.
 */
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { space } from '@design';

type Gap = keyof typeof space;
type Align = 'start' | 'center' | 'end' | 'stretch';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around';

const ALIGN = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
} as const;

const JUSTIFY = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
} as const;

type StackProps = {
  children?: React.ReactNode;
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  /** Chiếm hết chỗ còn lại của cha. */
  grow?: boolean;
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
};

function make(direction: 'row' | 'column') {
  return function Stack({ children, gap, align, justify, grow, wrap, style }: StackProps) {
    return (
      <View
        style={[
          direction === 'row' ? s.row : s.col,
          gap ? { gap: space[gap] } : null,
          align ? { alignItems: ALIGN[align] } : null,
          justify ? { justifyContent: JUSTIFY[justify] } : null,
          grow ? s.grow : null,
          wrap ? s.wrap : null,
          style,
        ]}
      >
        {children}
      </View>
    );
  };
}

/** Xếp ngang. Mặc định căn giữa theo chiều dọc — đó là điều người ta muốn 9/10 lần. */
export const Row = make('row');
/** Xếp dọc. */
export const Col = make('column');

/** Khoảng trống cố định. Không `gap` được thì mới dùng cái này. */
export function Spacer({ size = 'lg' }: { size?: Gap }) {
  return <View style={gaps[size]} />;
}

/** Đẩy mọi thứ sau nó xuống đáy (hoặc sang phải trong Row). */
export function Flex() {
  return <View style={s.grow} />;
}

// Tám bậc khoảng cách, dựng sẵn một lần lúc nạp module.
const gaps = StyleSheet.create(
  Object.fromEntries(
    Object.entries(space).map(([k, v]) => [k, { width: v, height: v }]),
  ) as Record<Gap, { width: number; height: number }>,
);

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  col: { flexDirection: 'column' },
  grow: { flex: 1 },
  wrap: { flexWrap: 'wrap' },
});
