/**
 * Thanh trên phòng chat — kính mờ nổi trên nền chat như Telegram: quay lại ·
 * avatar (chấm xanh khi online) · tên + dòng trạng thái ("đang gõ…" màu nhấn,
 * "đang hoạt động", hoặc trống) · nút đổi nền.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Glass, Icon, IconButton, Tap, Txt } from '@ui';
import { radius, space, useColors, useStyles, type Palette } from '@design';

export const ChatHeader = memo(function ChatHeader({
  name,
  avatar,
  status,
  typing,
  online,
  backLabel,
  menuLabel,
  onBack,
  onOpenFriend,
  onMenu,
}: {
  name: string;
  avatar?: string;
  status: string;
  typing: boolean;
  online: boolean;
  backLabel: string;
  menuLabel: string;
  onBack: () => void;
  onOpenFriend: () => void;
  onMenu: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <Glass radius={0} style={s.bar}>
      <IconButton label={backLabel} onPress={onBack}>
        <Icon name="back" size={24} color={c.text} />
      </IconButton>
      <Tap onPress={onOpenFriend} scaleTo={0.98} style={s.who} accessibilityLabel={name}>
        <View>
          <Avatar name={name} uri={avatar} size={40} ring={false} />
          {online ? <View style={s.online} /> : null}
        </View>
        <View style={s.text}>
          <Txt variant="label" numberOfLines={1} style={s.name}>
            {name}
          </Txt>
          {status ? (
            <Txt variant="faint" tone={typing ? 'accent' : 'muted'} numberOfLines={1}>
              {status}
            </Txt>
          ) : null}
        </View>
      </Tap>
      <IconButton label={menuLabel} onPress={onMenu}>
        <Icon name="palette" size={22} color={c.text} />
      </IconButton>
    </Glass>
  );
});

const make = (c: Palette) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      paddingHorizontal: space.xs,
      paddingVertical: space.xs,
      borderWidth: 0,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
    text: { flex: 1 },
    name: { fontSize: 17 },
    online: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 12,
      height: 12,
      borderRadius: radius.full,
      backgroundColor: c.mint,
      borderWidth: 2,
      borderColor: c.bg,
    },
  });
