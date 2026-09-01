/**
 * List — danh sách. Bọc FlashList, KHÔNG bọc FlatList.
 *
 * Đây là một trong hai chỗ quyết định app mượt hay lag (chỗ kia là ảnh).
 * FlatList giữ mọi ô đã vẽ trong bộ nhớ và dựng ô mới từ đầu mỗi lần cuộn tới;
 * cuộn nhanh trên máy Android tầm trung là thấy khoảng trắng chạy theo ngón tay.
 * FlashList tái dùng ô đã cuộn qua — số component thật giữ nguyên dù danh sách
 * có 10 hay 10.000 dòng.
 *
 * Ba luật khi dùng, vi phạm là mất sạch cái lợi ở trên:
 *   1. Ô trong danh sách phải là component đặt tên riêng, không phải hàm vô danh
 *      viết thẳng trong renderItem.
 *   2. Ảnh trong ô PHẢI có `recyclingKey` (xem Img) — thiếu thì cuộn nhanh sẽ
 *      thấy ảnh người này nhấp nháy ở ô người kia.
 *   3. Danh sách trộn nhiều kiểu ô thì phải khai `getItemType`, nếu không
 *      FlashList tái dùng nhầm ô khác kiểu và phải vẽ lại từ đầu.
 */
import { forwardRef } from 'react';
import { FlashList, type FlashListProps, type FlashListRef } from '@shopify/flash-list';
import { StyleSheet } from 'react-native';
import { space } from '@design';

export type ListProps<T> = FlashListProps<T>;

/**
 * Có chuyển tiếp `ref` để chỗ gọi cuộn được (`scrollToEnd`, `scrollToIndex`).
 * Màn Trò chuyện cần: gửi xong mà không kéo xuống thì tin của mình nằm ngoài
 * màn, người ta tưởng chưa gửi được.
 */
function ListInner<T>(
  { contentContainerStyle, ...rest }: ListProps<T>,
  ref: React.ForwardedRef<FlashListRef<T>>,
) {
  return (
    <FlashList
      ref={ref}
      // Bàn phím đóng khi bắt đầu kéo — không ai vừa gõ vừa cuộn.
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      // Mảng chứ không spread: contentContainerStyle kế thừa từ ScrollView nên
      // bản thân nó có thể đã là một mảng — spread ra là hỏng.
      contentContainerStyle={[s.content, contentContainerStyle]}
      {...rest}
    />
  );
}

/**
 * `forwardRef` xoá mất kiểu tổng quát, nên phải khai lại. Không có bước này thì
 * mọi danh sách trong app rơi về `unknown` và mất sạch kiểm kiểu của `renderItem`.
 */
export const List = forwardRef(ListInner) as <T>(
  props: ListProps<T> & { ref?: React.ForwardedRef<FlashListRef<T>> },
) => React.ReactElement;

const s = StyleSheet.create({
  content: { paddingBottom: space.huge },
});
