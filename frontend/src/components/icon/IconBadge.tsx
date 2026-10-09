/**
 * Icon đứng đầu hàng cài đặt / danh sách đặc quyền — KHÔNG khung, MỘT màu
 * (08/10/2026, theo Locket: icon khối đặc màu chữ phụ, không sắc màu mè).
 * Giữ ô vuông vô hình cùng cỡ để chữ các hàng thẳng cột.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { useColors, useStyles } from '@design';

const SIZE = 40;

export const IconBadge = memo(function IconBadge({
  name,
  danger,
}: {
  name: IconName;
  danger?: boolean;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <View style={s.slot}>
      <Icon name={name} size={24} color={danger ? c.danger : c.textMuted} />
    </View>
  );
});

const make = () =>
  StyleSheet.create({
    slot: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  });
