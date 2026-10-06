/**
 * Icon trong nền tròn lam nhạt — hàng cài đặt, ô thông tin. Đúng kiểu ô
 * "Một vài mẹo nhỏ" của bảng thiết kế: nền `accentSoft`, nét `accent`.
 */
import { memo, type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, useColors, useStyles, type Palette } from '@design';

export type IconName = ComponentProps<typeof Ionicons>['name'];

const SIZE = 40;

export const IconBadge = memo(function IconBadge({ name }: { name: IconName }) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <View style={s.badge}>
      <Ionicons name={name} size={20} color={c.accent} />
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    badge: {
      width: SIZE,
      height: SIZE,
      borderRadius: radius.full,
      backgroundColor: c.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
