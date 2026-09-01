/**
 * Chân màn Camera — cửa sổ nhòm sang Khoảnh khắc.
 *
 * Trước đây chỗ này chỉ có một mũi tên và chữ "Khoảnh khắc". Nó đúng nhưng
 * chết: không nói được có gì ở dưới, nên không có lý do gì để vuốt lên. Và nó
 * để lại một mảng trống lớn ở đáy màn.
 *
 * Giờ nó cho xem trước BA TẤM mới nhất, thu nhỏ. Đây là cùng một dữ liệu với
 * feed, không phải hình trang trí — góc chưa có ai gửi gì thì nó tự về dáng
 * gọn chỉ còn chữ và mũi tên.
 *
 * Ảnh thu nhỏ chứ không phải avatar: cái người ta muốn biết là "có gì mới để
 * xem", và một mẩu ảnh trả lời câu đó nhanh hơn một khuôn mặt.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Img, Tap, Txt } from '@ui';
import { radius, space, useColors, useStyles, type Palette } from '@design';
import type { PhotoSource } from '@/features/feed/types';

const MAX = 3;
const THUMB = 48;

export const MomentsPeek = memo(function MomentsPeek({
  photos,
  label,
  accessibilityLabel,
  onPress,
}: {
  photos: readonly PhotoSource[];
  /** "Khoảnh khắc · 4" hoặc "Chưa có khoảnh khắc nào". */
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const shown = photos.slice(0, MAX);

  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      scaleTo={0.97}
      style={[s.bar, shown.length === 0 && s.barEmpty]}
    >
      {shown.length > 0 ? (
        <View style={s.thumbs}>
          {shown.map((photo, i) => (
            <Img
              key={i}
              source={photo}
              recyclingKey={`peek-${i}`}
              style={s.thumb}
              contentFit="cover"
            />
          ))}
        </View>
      ) : null}

      <Txt variant="label" tone="muted">
        {label}
      </Txt>

      <Ionicons name="chevron-up" size={16} color={c.textFaint} />
    </Tap>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: c.surface,
    borderRadius: radius.full,
    paddingLeft: space.sm,
    paddingRight: space.lg,
    paddingVertical: space.sm,
  },
  /** Không có ảnh nào thì thu về đúng dáng một viên thuốc chữ. */
  barEmpty: { paddingLeft: space.lg },

  thumbs: { flexDirection: 'row', gap: space.xs },
  thumb: { width: THUMB, height: THUMB, borderRadius: radius.sm },
});
