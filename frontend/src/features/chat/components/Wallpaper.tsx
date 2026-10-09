/**
 * Nền khung chat — dải màu + (tuỳ nền) hoạ tiết mờ rải đều như Telegram. Vẽ
 * MỘT lần, không hoạt ảnh. Dùng cho phòng chat và cho ô xem trước ở bảng chọn nền.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, type IconName } from '@ui';
import { useColors, wallpaperOf } from '@design';
import type { TChatBackground } from '@nook/shared/model/type';

const GLYPHS: readonly IconName[] = ['heart', 'sparkle', 'camera', 'moon', 'music', 'sun', 'laugh', 'gift'];
/** Ô lưới hoạ tiết (pt). Lệch hàng chẵn lẻ cho đỡ thẳng hàng như giấy kẻ ô. */
const CELL = 64;

export const Wallpaper = memo(function Wallpaper({
  background,
  width,
  height,
  scale = 1,
}: {
  background: TChatBackground;
  width: number;
  height: number;
  /** Ô xem trước nhỏ thì thu hoạ tiết lại cho cân. */
  scale?: number;
}) {
  const c = useColors();
  const w = wallpaperOf(c, background);
  const cell = CELL * scale;
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[w.colors[0], w.colors[1]]} style={StyleSheet.absoluteFill} />
      {w.pattern
        ? Array.from({ length: rows * cols }, (_, i) => {
            const r = Math.floor(i / cols);
            const col = i % cols;
            const glyph = GLYPHS[(r * 3 + col * 5) % GLYPHS.length]!;
            return (
              <View
                key={i}
                style={[
                  s.glyph,
                  {
                    left: col * cell + (r % 2 ? cell / 2 : 0) - cell / 4,
                    top: r * cell,
                    transform: [{ rotate: `${((r + col) % 5) * 12 - 24}deg` }],
                  },
                ]}
              >
                <Icon name={glyph} size={18 * scale} color={w.pattern!} weight="line" />
              </View>
            );
          })
        : null}
    </View>
  );
});

const s = StyleSheet.create({ glyph: { position: 'absolute', opacity: 0.09 } });
