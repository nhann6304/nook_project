/**
 * Scroll — cuộn cho nội dung NGẮN và biết trước (một màn cài đặt, một form).
 *
 * Danh sách dữ liệu thì dùng <List>, không dùng cái này. Ranh giới: nếu số ô
 * phụ thuộc vào dữ liệu từ server thì đó là List.
 */
import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { space } from '@design';

export function Scroll({ contentContainerStyle, ...rest }: ScrollViewProps) {
  return (
    <ScrollView
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[s.content, contentContainerStyle]}
      {...rest}
    />
  );
}

const s = StyleSheet.create({
  content: { paddingBottom: space.xxxl, flexGrow: 1 },
});
