/**
 * Avatar — ảnh một người bạn, có vòng độ thân bao quanh.
 *
 * Vòng màu là thứ DUY NHẤT trong app nói ra độ thân. Không có số, không có
 * thanh tiến trình, không có bảng xếp hạng — và chỉ hai người trong cặp mới
 * nhìn thấy vòng của nhau.
 *
 * `dormant` (ngủ đông) vẽ vòng đứt nét: lâu rồi hai người không gửi gì cho nhau.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { color, ringColor } from '@design';
import { Txt } from '../primitives/Txt';
import { Img } from '../primitives/Img';
import { Tap } from '../primitives/Tap';

export type AvatarProps = {
  name: string;
  uri?: string;
  size?: number;
  /** Cấp thân 1–10. */
  level?: number;
  dormant?: boolean;
  onPress?: () => void;
  /** Khoá dùng cho danh sách tái dùng ô — xem chú thích trong Img. */
  recyclingKey?: string;
};

export const Avatar = memo(function Avatar({
  name,
  uri,
  size = 56,
  level = 1,
  dormant = false,
  onPress,
  recyclingKey,
}: AvatarProps) {
  const stroke = 2.5;
  const r = size / 2 - stroke / 2;
  const inner = size - stroke * 2;

  const body = (
    <View style={[s.box, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={dormant ? color.border : ringColor(level)}
          strokeWidth={stroke}
          strokeDasharray={dormant ? '4 5' : undefined}
          fill="none"
        />
      </Svg>

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
      accessibilityLabel={dormant ? `${name}, đang ngủ đông` : `${name}, cấp thân ${level}`}
      onPress={onPress}
      scaleTo={0.92}
      style={s.tap}
    >
      {body}
    </Tap>
  );
});

const s = StyleSheet.create({
  tap: { alignSelf: 'flex-start' },
  box: { alignItems: 'center', justifyContent: 'center' },
  inner: {
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
});
