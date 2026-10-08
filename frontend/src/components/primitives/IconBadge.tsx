/**
 * Icon đứng đầu hàng cài đặt / danh sách đặc quyền — KHÔNG khung (08/10/2026:
 * viên tròn bọc icon bị chê). Khối đặc hai tông của Solar, mỗi hàng một sắc
 * tươi (`hue`) để mắt tìm theo màu trước khi đọc chữ. Giữ ô vuông vô hình
 * cùng cỡ để chữ các hàng thẳng cột.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { useColors, useStyles, type Vivid } from '@design';

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
    <View style={s.slot}>
      <Icon name={name} size={26} color={c.vivid[hue]} weight="fill" />
    </View>
  );
});

const make = () =>
  StyleSheet.create({
    slot: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  });
