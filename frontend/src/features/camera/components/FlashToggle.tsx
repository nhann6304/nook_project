/**
 * Công tắc đèn — nằm ở góc trên-trái CỦA KHUNG NGẮM, không nằm ở hàng nút.
 *
 * Locket đặt nó ở đúng chỗ này, và có lý: hàng nút dưới chỉ có ba việc chính
 * (thư viện · chụp · đảo camera), nhét thêm cái thứ tư vào là phá mất nhịp ba.
 * Còn góc khung thì đang trống, và đèn là thứ chỉ có nghĩa khi đang ngắm.
 *
 * Nền mờ chứ không đặc: dưới nó là ảnh sống, một khối đặc sẽ trông như con tem
 * dán lên.
 */
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tap } from '@ui';
import { radius, useColors, useStyles, type Palette } from '@design';

export type FlashMode = 'off' | 'on';

export const FlashToggle = memo(function FlashToggle({
  mode,
  label,
  onToggle,
}: {
  mode: FlashMode;
  label: string;
  onToggle: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const on = mode === 'on';
  return (
    <Tap
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: on }}
      onPress={onToggle}
      feedback="select"
      scaleTo={0.9}
      style={[s.box, on && s.on]}
    >
      <Ionicons
        name={on ? 'flash' : 'flash-off'}
        size={18}
        color={on ? c.onAccent : c.text}
      />
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
  box: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.onPhoto,
  },
  on: { backgroundColor: c.accentBright },
});
