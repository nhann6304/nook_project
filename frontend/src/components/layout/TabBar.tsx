/**
 * TabBar — thanh ba tab ở đáy màn.
 *
 * ── Vì sao Nook có thanh tab, sau khi từng chốt là không ─────────────────
 * Luật cũ: "không thanh tab, điều hướng bằng cử chỉ". Vấn đề là **cử chỉ chưa
 * bao giờ tồn tại** — vuốt lên để mở Khoảnh khắc chưa hề có trong code, chỉ có
 * một cái nút ở chân màn. Nên trên thực tế người dùng không có cử chỉ NÀO để
 * học, chỉ có vài cái nút nằm rải ở ba góc khác nhau.
 *
 * Một thanh ba tab nói ra ngay app này có mấy chỗ. Cử chỉ giấu thì đẹp, nhưng
 * chỉ đẹp với người ĐÃ biết nó tồn tại.
 *
 * ── Vì sao tự vẽ chứ không dùng thanh mặc định ──────────────────────────
 * Thanh của navigator mang theo chiều cao, nền và nhãn của hệ điều hành — ba
 * thứ khác nhau giữa iOS và Android, đúng loại khác nhau mà cả dự án đang
 * tránh. Ở đây là một viên thuốc nổi, giống nhau trên cả hai máy.
 *
 * ── Nó CHIẾM CHỖ THẬT, không nổi đè lên nội dung ────────────────────────
 * Nổi đè thì mọi màn phải tự chừa đệm đáy đúng bằng chiều cao thanh, và chỉ
 * cần một màn quên là dòng cuối bị che. Chiếm chỗ thật thì bố cục tự tính.
 * Đổi lại: viên thuốc không đè lên ảnh — chấp nhận được, vì khung ngắm đã có
 * đủ chỗ.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, useStyles, type Palette } from '@design';
import { Tap } from '../primitives/Tap';

export type TabItem = {
  key: string;
  label: string;
  /** Icon đã dựng sẵn, nhận `active` để tự đổi màu. */
  icon: (active: boolean) => React.ReactNode;
};

export const TabBar = memo(function TabBar({
  items,
  current,
  onPress,
}: {
  items: readonly TabItem[];
  current: string;
  onPress: (key: string) => void;
}) {
  const s = useStyles(make);
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.dock, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      <View style={s.pill}>
        {items.map((it) => {
          const active = it.key === current;
          return (
            <Tap
              key={it.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={it.label}
              onPress={() => onPress(it.key)}
              feedback={active ? null : 'select'}
              scaleTo={0.92}
              style={[s.tab, active && s.tabOn]}
            >
              {it.icon(active)}
            </Tap>
          );
        })}
      </View>
    </View>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    dock: {
      alignItems: 'center',
      paddingTop: space.sm,
      backgroundColor: c.bg,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      padding: space.xs,
      borderRadius: radius.full,
      backgroundColor: c.surface,
    },
    tab: {
      width: 64,
      height: 44,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Tab đang mở được nhấc lên một nấc bề mặt chứ không tô màu nhấn: màu nhấn
    // ở đáy màn kéo mắt xuống khỏi ảnh, mà ảnh mới là thứ đáng nhìn.
    tabOn: { backgroundColor: c.surfaceRaised },
  });
