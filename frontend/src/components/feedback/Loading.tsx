/**
 * Loading — vòng xoay chờ.
 *
 * Có `delay` 220ms: dưới ngưỡng đó thì KHÔNG hiện gì cả. Một vòng xoay loé lên
 * rồi tắt trong 100ms làm màn hình trông giật, trong khi nếu không hiện gì thì
 * người dùng thậm chí không nhận ra là đã có một lượt chờ.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { common, duration, space, useColors, useStyles } from '@design';
import { Txt } from '../primitives/Txt';

export function Loading({ label, delay = duration.base }: { label?: string; delay?: number }) {
  const s = useStyles(make);
  const c = useColors();
  const [show, setShow] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const id = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  if (!show) return <View style={common.fill} />;

  return (
    <View style={s.box}>
      <ActivityIndicator color={c.accent} />
      {label ? (
        <Txt variant="label" tone="muted" center>
          {label}
        </Txt>
      ) : null}
    </View>
  );
}

const make = () =>
  StyleSheet.create({
  box: { ...common.center, flex: 1, gap: space.md },
});
