/**
 * Icon trong nền tròn lam nhạt — hàng cài đặt, ô thông tin. Đúng kiểu ô
 * "Một vài mẹo nhỏ" của bảng thiết kế: nền `accentSoft`, nét `accent`.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { radius, useColors, useStyles, type Palette } from '@design';

const SIZE = 40;

export const IconBadge = memo(function IconBadge({ name }: { name: IconName }) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <View style={s.badge}>
      <Icon name={name} size={20} color={c.accent} />
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
