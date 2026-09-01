/**
 * TopBar — hàng trên cùng của các màn con: nút đóng · tiêu đề · chỗ cho nút phải.
 *
 * Nook không dùng header của navigator (`headerShown: false` ở mọi Stack) vì
 * header mặc định mang theo phông chữ, màu và chiều cao của hệ điều hành —
 * ba thứ khác nhau giữa iOS và Android, đúng loại khác nhau mà cả dự án đang
 * tránh.
 *
 * Nhưng bỏ header thì mất luôn nút quay lại. Trên iOS còn vuốt được từ mép trái,
 * trên Android còn nút cứng — nhưng cả hai đều là thứ NGƯỜI DÙNG PHẢI BIẾT
 * TRƯỚC. Màn không có nút quay lại nhìn thấy được là màn có người mắc kẹt.
 *
 * Khối `spacer` bên phải rộng đúng bằng một nút: thiếu nó thì tiêu đề không
 * nằm giữa mà lệch sang phải một nửa nút.
 */
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, layout, space } from '@design';
import { Txt } from '../primitives/Txt';
import { IconButton } from '../primitives/IconButton';

export type TopBarProps = {
  title?: string;
  /** Chữ cho trình đọc màn hình của nút đóng. Bắt buộc nếu có `onClose`. */
  closeLabel?: string;
  onClose?: () => void;
  /**
   * Hướng mũi tên. 'back' cho màn trượt ngang vào, 'down' cho màn trồi từ dưới
   * lên — mũi tên phải chỉ đúng hướng màn sẽ đi khi đóng, nếu không nó nói dối.
   */
  closeIcon?: 'back' | 'down';
  /** Nút bên phải, ví dụ bánh răng. */
  right?: React.ReactNode;
};

export function TopBar({
  title,
  closeLabel,
  onClose,
  closeIcon = 'back',
  right,
}: TopBarProps) {
  return (
    <View style={s.bar}>
      {onClose && closeLabel ? (
        <IconButton label={closeLabel} onPress={onClose} style={s.edge}>
          <Ionicons
            name={closeIcon === 'down' ? 'chevron-down' : 'chevron-back'}
            size={24}
            color={color.text}
          />
        </IconButton>
      ) : (
        <View style={s.slot} />
      )}

      {title ? (
        <Txt variant="section" numberOfLines={1} style={s.title}>
          {title}
        </Txt>
      ) : (
        <View style={s.title} />
      )}

      {right ?? <View style={s.slot} />}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouch,
    paddingVertical: space.xs,
  },
  slot: { width: layout.minTouch },
  /** Kéo nút sát mép: vùng chạm 48 rộng hơn icon nên nhìn thì nó thụt vào. */
  edge: { marginLeft: -space.md },
  title: { flex: 1, textAlign: 'center' },
});
