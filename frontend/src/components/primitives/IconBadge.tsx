/**
 * Icon trong viên tròn ĐẶC màu tươi — hàng cài đặt, danh sách đặc quyền.
 * Mỗi hàng một sắc (`hue`) để mắt tìm theo màu trước khi đọc chữ (08/10/2026:
 * bản nền nhạt + nét màu nhấn bị chê "không tươi"). Tròn, không ô vuông.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { radius, useColors, useStyles, type Vivid } from '@design';

const SIZE = 40;

export const IconBadge = memo(function IconBadge({
  name,
  hue = 'blue',
}: {
  name: IconName;
  hue?: Vivid;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <View style={[s.badge, { backgroundColor: c.vivid[hue] }]}>
      <Icon name={name} size={19} color={c.onVivid} weight="fill" />
    </View>
  );
});

const make = () =>
  StyleSheet.create({
    badge: {
      width: SIZE,
      height: SIZE,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
