/**
 * Mã QR của mình (08/10/2026) — bạn bè quét là mở trang thêm bạn. Thẻ KÍNH
 * nổi trên nền trời: avatar, tên, @tên, mã QR có logo LOVO ở giữa. Một nút
 * Chia sẻ link (bảng chia sẻ của máy). Link là hàng giả (`inviteLink.ts`).
 */
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar, Button, Glass, Icon, IconButton, QrCode, Screen, SkyWash, Txt } from '@ui';
import { duration, radius, space, useColors, useStyles, type Palette } from '@design';
import { useT } from '@i18n';

export function QrScreen({
  name,
  username,
  photo,
  link,
  onShare,
  onClose,
}: {
  name: string;
  username: string | null;
  photo?: string;
  link: string;
  onShare: () => void;
  onClose: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const { width } = useWindowDimensions();
  const qr = Math.min(260, width - space.xxl * 4);

  return (
    <View style={s.page}>
      <SkyWash />
      <Screen clear>
        <View style={s.bar}>
          <IconButton label={t('common.closeScreen')} onPress={onClose}>
            <Icon name="close" size={24} color={c.text} />
          </IconButton>
        </View>

        <View style={s.center}>
          <Animated.View entering={FadeInDown.duration(duration.base)}>
            {/* Avatar nằm NGOÀI kính: kính cắt mọi thứ tràn ra ngoài viền. */}
            <View style={s.avatar}>
              <Avatar name={name} uri={photo} size={76} />
            </View>
            <Glass style={s.card}>
              <Txt variant="title" center numberOfLines={1}>
                {name}
              </Txt>
              {username ? (
                <Txt variant="body" tone="muted" center>
                  @{username}
                </Txt>
              ) : null}
              <View style={s.qr}>
                <QrCode value={link} size={qr} color={c.text} background={c.bg} />
              </View>
              <Txt variant="faint" tone="muted" center style={s.hint}>
                {t('qr.hint')}
              </Txt>
            </Glass>
          </Animated.View>
        </View>

        <View style={s.footer}>
          <Button
            flat
            label={t('qr.share')}
            icon={<Icon name="share" size={20} color={c.onAccent} />}
            onPress={onShare}
            block
          />
        </View>
      </Screen>
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    bar: { height: 52, justifyContent: 'center' },
    center: { flex: 1, justifyContent: 'center' },
    card: {
      alignItems: 'center',
      gap: space.xs,
      paddingTop: space.huge,
      paddingBottom: space.xl,
      paddingHorizontal: space.xl,
      marginTop: -38,
    },
    avatar: { alignSelf: 'center', zIndex: 1 },
    qr: {
      marginTop: space.lg,
      padding: space.md,
      borderRadius: radius.xl,
      backgroundColor: c.bg,
    },
    hint: { marginTop: space.md, maxWidth: 260 },
    footer: { paddingBottom: space.md },
  });
