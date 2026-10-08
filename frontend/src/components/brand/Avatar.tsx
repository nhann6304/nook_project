/**
 * Avatar — ảnh một người bạn.
 *
 * Có `level` → đeo VÒNG TAY HẠT (`Bracelet`): thứ DUY NHẤT trong app nói ra độ
 * thân. Không số, không thanh tiến trình, không bảng xếp hạng — và chỉ hai
 * người trong cặp mới thấy vòng của nhau. Không có `level` (chính mình, người
 * lạ) → vòng trơn màu nhấn.
 *
 * `dormant` (ngủ đông): hạt xám — lâu rồi hai người không gửi gì cho nhau.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useColors, useStyles, type Palette } from '@design';
import { Bracelet, beadRadius } from './Bracelet';
import { Txt } from '../primitives/Txt';
import { Img } from '../primitives/Img';
import { Tap } from '../primitives/Tap';

export type AvatarProps = {
  name: string;
  uri?: string;
  size?: number;
  /** Cấp thân 1–10. Có thì đeo vòng hạt. */
  level?: number;
  dormant?: boolean;
  /** `false` = người chưa ở trong góc: vòng xám trơn, không có cấp thân để tô. */
  ring?: boolean;
  onPress?: () => void;
  /**
   * Chữ cho trình đọc màn hình. Component KHÔNG tự dịch: src/components không
   * biết i18n tồn tại, để nó còn xem trước được mà không cần dựng cả kho chữ.
   */
  label?: string;
  /** Khoá dùng cho danh sách tái dùng ô — xem chú thích trong Img. */
  recyclingKey?: string;
};

export const Avatar = memo(function Avatar({
  name,
  uri,
  size = 56,
  level,
  dormant = false,
  ring = true,
  onPress,
  label,
  recyclingKey,
}: AvatarProps) {
  const s = useStyles(make);
  const c = useColors();
  const beads = ring && level !== undefined;
  const stroke = 2.5;
  const r = size / 2 - stroke / 2;
  const inner = beads ? size - beadRadius(size) * 4 - 2 : size - stroke * 2;

  const body = (
    <View style={[s.box, { width: size, height: size }]}>
      {beads ? (
        <Bracelet size={size} level={level} dormant={dormant} />
      ) : (
        <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={ring ? c.accent : c.border}
            strokeWidth={stroke}
            fill="none"
          />
        </Svg>
      )}

      <View style={[s.inner, { width: inner, height: inner, borderRadius: inner / 2 }]}>
        {uri ? (
          <Img source={{ uri }} recyclingKey={recyclingKey ?? uri} style={s.photo} />
        ) : (
          <Txt variant="section" tone="muted">
            {name.charAt(0).toUpperCase()}
          </Txt>
        )}
      </View>
    </View>
  );

  if (!onPress) return body;

  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label ?? name}
      onPress={onPress}
      scaleTo={0.92}
      style={s.tap}
    >
      {body}
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    tap: { alignSelf: 'flex-start' },
    box: { alignItems: 'center', justifyContent: 'center' },
    inner: {
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    photo: { width: '100%', height: '100%' },
  });
