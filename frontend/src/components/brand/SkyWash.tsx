/**
 * Vệt trời ở đầu màn chính — màu của cảnh đang dùng ("Theo trời": bình minh
 * hồng đào, trưa lam, chiều hồng tím, tối navy, mưa xám), tan dần vào nền.
 * Một gradient tĩnh, không hoạt ảnh: không tốn khung hình nào.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors, useStyles } from '@design';

const STOPS = [0, 1] as const;

export const SkyWash = memo(function SkyWash() {
  const s = useStyles(make);
  const c = useColors();
  return (
    <View pointerEvents="none" style={s.wash}>
      <LinearGradient
        colors={[c.sky[0], c.sky[1]]}
        locations={STOPS}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
});

const make = () =>
  StyleSheet.create({
    wash: { position: 'absolute', left: 0, right: 0, top: 0, height: '45%' },
  });
