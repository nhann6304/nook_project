/**
 * Scroll — cuộn cho nội dung NGẮN và biết trước (một màn cài đặt, một form).
 *
 * Danh sách dữ liệu thì dùng <List>, không dùng cái này. Ranh giới: nếu số ô
 * phụ thuộc vào dữ liệu từ server thì đó là List.
 *
 * Cuộn NGANG dùng khuôn đệm khác hẳn. Đệm mặc định của bản dọc có
 * `paddingBottom` 32 để nội dung không dính đáy màn — mang nguyên nó sang bản
 * ngang thì một hàng avatar 40pt bỗng cao 72pt, và cái 32pt thừa đó là khoảng
 * trống trong suốt nằm dưới hàng, không ai nhìn ra là nó từ đâu tới.
 */
import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { space } from '@design';

export function Scroll({ contentContainerStyle, horizontal, ...rest }: ScrollViewProps) {
  return (
    <ScrollView
      horizontal={horizontal}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[horizontal ? s.contentRow : s.content, contentContainerStyle]}
      {...rest}
    />
  );
}

const s = StyleSheet.create({
  content: { paddingBottom: space.xxxl, flexGrow: 1 },
  contentRow: { alignItems: 'center', flexGrow: 1 },
});
