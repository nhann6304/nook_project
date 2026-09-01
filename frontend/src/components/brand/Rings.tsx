/**
 * Rings — dấu hiệu "Ôm". Hai vòng, một vòng vòng tay ôm lấy vòng kia.
 *
 * Dựng bằng SVG chứ không bằng viền của View như bản nháp. Ba cái được:
 *   · nét không bị méo khi phóng to (viền View bo tròn bị bẹt ở góc)
 *   · nét đứt vẽ ĐÚNG là nét đứt trên Android — viền View kiểu 'dashed' cộng
 *     borderRadius bị Android vẽ thành nét liền, tức là biến thể `ghost` câm
 *   · hai vòng chồng nhau đúng thứ tự, không cần đoán z-index.
 *
 * Hình học lấy nguyên từ docs/01-brand.md, đừng sửa số ở đây mà không sửa doc:
 *   vòng kín  tâm (56,50) bán kính 20, nét 9
 *   vòng ôm   cung hở M50.9 34.7 A20 20 0 1 0 50.9 65.3
 *
 * Luật thương hiệu: hai vòng PHẢI lệch nhau một nấc sáng. Cùng một màu là
 * mất hẳn ý "hai người", chỉ còn thấy một cục.
 */
import { memo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { color } from '@design';

export type RingsProps = {
  size?: number;
  /** Một màu chữ — dùng khi đặt trên nền màu. */
  mono?: boolean;
  /** Vòng ngoài đứt nét: "góc còn một chỗ trống". */
  ghost?: boolean;
  /**
   * Chữ cho trình đọc màn hình. Component không tự dịch — src/components không
   * biết kho chữ tồn tại, để nó còn xem trước được mà không cần dựng cả app.
   */
  label?: string;
};

export const Rings = memo(function Rings({
  size = 40,
  mono = false,
  ghost = false,
  label = 'Nook',
}: RingsProps) {
  const hug = mono ? color.text : color.accent;
  const closed = mono ? color.text : ghost ? color.border : color.accentBright;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      collapsable={false}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* vòng ôm — cung hở, quay lưng ra ngoài */}
        <Path
          d="M50.9 34.7 A20 20 0 1 0 50.9 65.3"
          stroke={hug}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
        />
        {/* vòng được ôm — kín */}
        <Circle
          cx={56}
          cy={50}
          r={20}
          stroke={closed}
          strokeWidth={9}
          strokeDasharray={ghost ? '6 7' : undefined}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
});
