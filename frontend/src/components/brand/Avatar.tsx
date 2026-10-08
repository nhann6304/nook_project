/**
 * Avatar — ảnh một người bạn.
 *
 * Có `level` → VÒNG BẠN BÈ: vòng dải màu của chất liệu (gỗ → vỏ sò → màu riêng
 * → ngọc → vàng, `beadTier`) + một hạt charm góc dưới phải. Thứ DUY NHẤT nói
 * ra độ thân — không số, không bảng xếp hạng, chỉ hai người trong cặp thấy.
 * Không có `level` (chính mình, người lạ) → vòng trơn màu nhấn.
 *
 * `dormant` (ngủ đông): vòng xám đứt nét, hạt xám — không mất gì cả.
 */
import { memo, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { beadTier, beadTone, sleepingTone, useColors, useStyles, type Palette } from '@design';
import { Txt } from '../primitives/Txt';
import { Img } from '../primitives/Img';
import { Tap } from '../primitives/Tap';

export type AvatarProps = {
  name: string;
  uri?: string;
  size?: number;
  /** Cấp thân 1–10. Có thì đeo vòng chất liệu + charm. */
  level?: number;
  dormant?: boolean;
  /** `false` = người chưa ở trong góc: vòng xám trơn. */
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
  // Mã gradient phải riêng từng avatar: trùng mã là Android tô nhầm vòng khác.
  const gid = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const tiered = ring && level !== undefined;
  const stroke = tiered ? Math.max(3, size * 0.06) : 2.5;
  const r = size / 2 - stroke / 2;
  const inner = size - stroke * 2 - (tiered ? 4 : 0);
  const tone = tiered ? (dormant ? sleepingTone(c) : beadTone(c, beadTier(level))) : null;

  // Charm: hạt nằm trên vòng ở góc 45° dưới phải, có viền nền để tách khỏi vòng.
  const charm = Math.max(5, size * 0.13);
  const at = size / 2 + r * Math.SQRT1_2;

  const body = (
    <View style={[s.box, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
        {tone ? (
          <>
            <Defs>
              <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={tone[0]} />
                <Stop offset="1" stopColor={tone[1]} />
              </LinearGradient>
            </Defs>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={`url(#${gid})`}
              strokeWidth={stroke}
              strokeDasharray={dormant ? '4 5' : undefined}
              fill="none"
            />
          </>
        ) : (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={ring ? c.accent : c.border}
            strokeWidth={stroke}
            fill="none"
          />
        )}
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

      {tone ? (
        <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Circle cx={at} cy={at} r={charm + 2} fill={c.bg} />
          <Circle cx={at} cy={at + charm * 0.12} r={charm} fill={tone[1]} />
          <Circle cx={at} cy={at} r={charm * 0.86} fill={tone[0]} />
          {dormant ? null : (
            <Circle
              cx={at - charm * 0.3}
              cy={at - charm * 0.32}
              r={charm * 0.32}
              fill={tone[2]}
              opacity={0.9}
            />
          )}
        </Svg>
      ) : null}
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
