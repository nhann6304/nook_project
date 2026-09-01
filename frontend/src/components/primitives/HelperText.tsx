/**
 * HelperText — dòng phụ dưới ô nhập.
 *
 * LUÔN chiếm chỗ dù chưa có chữ. Nếu để nó cao 0 rồi mới bung ra khi có lỗi thì
 * nút bấm bị đẩy xuống đúng lúc ngón tay đang hạ xuống — người dùng bấm trượt,
 * và họ không hiểu vì sao.
 */
import { StyleSheet, View } from 'react-native';
import { space } from '@design';
import { Txt } from './Txt';

export function HelperText({
  children,
  tone = 'muted',
}: {
  children?: React.ReactNode;
  tone?: 'muted' | 'danger' | 'mint';
}) {
  return (
    <View style={s.slot}>
      {children ? (
        <Txt variant="label" tone={tone}>
          {children}
        </Txt>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  slot: { minHeight: 22, justifyContent: 'center', paddingHorizontal: space.xs },
});
