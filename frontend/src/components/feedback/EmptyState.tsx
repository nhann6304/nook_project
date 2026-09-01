/**
 * EmptyState — màn trống.
 *
 * Luật: màn trống LUÔN là một lời mời làm gì đó, không bao giờ chỉ có chữ.
 * Không có linh vật, nên hình mặc định là khung đứt nét — chỗ lẽ ra có ảnh.
 * Màn nào cần nói rõ hơn thì truyền `art` riêng (ví dụ Góc trống truyền lưới
 * mười chỗ để nói "còn thiếu chín người").
 */
import { StyleSheet, View } from 'react-native';
import { common, layout, space } from '@design';
import { Txt } from '../primitives/Txt';
import { Button } from '../primitives/Button';
import { GhostFrame } from '../brand/GhostFrame';

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  art,
}: {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  art?: React.ReactNode;
}) {
  return (
    <View style={s.box}>
      {art ?? <GhostFrame size={160} />}

      <View style={s.words}>
        {title ? (
          <Txt variant="section" center>
            {title}
          </Txt>
        ) : null}
        <Txt variant="body" tone="muted" center>
          {message}
        </Txt>
      </View>

      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={s.cta} />
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { ...common.center, flex: 1, paddingHorizontal: space.xxl },
  words: {
    marginTop: space.xl,
    gap: space.sm,
    maxWidth: layout.maxTextWidth,
    alignItems: 'center',
  },
  cta: { marginTop: space.xxl, minWidth: 190 },
});
