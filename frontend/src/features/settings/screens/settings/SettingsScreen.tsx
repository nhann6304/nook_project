/**
 * Trang cá nhân + Cài đặt — mở từ avatar góc phải màn Chụp (08/10/2026, theo
 * Locket: cài đặt nằm trong trang cá nhân, không chiếm một tab). Màn này CHỈ là
 * mục lục: trang của mình ở trên, rồi từng hàng mở một trang con có nút Lưu. Âm thanh là một công tắc nên để
 * ngay tại chỗ — mở trang chỉ để bật/tắt một thứ là thừa.
 */
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Divider, Icon, IconBadge, Row, Screen, Scroll, Tap, Toggle, TopBar, Txt } from '@ui';
import { layout, radius, space, useColors, useStyles, type Palette } from '@design';
import { useT } from '@i18n';
import { NavRow } from '../../components/Pref';

export function SettingsScreen({
  name,
  username,
  photo,
  friendCount,
  posts30,
  appearanceValue,
  privacyValue,
  languageValue,
  soundOn,
  onSoundChange,
  onOpenAppearance,
  onOpenPrivacy,
  onOpenLanguage,
  onOpenPro,
  onOpenQr,
  proTitle,
  proSub,
  onSignOut,
  onBack,
}: {
  name: string;
  username: string | null;
  photo?: string | null;
  friendCount: number;
  /** Số ảnh mình gửi trong 30 ngày — chỉ của chính mình, không so với ai. */
  posts30: number;
  /** Giá trị đang dùng, hiện dưới tên mỗi hàng: "Theo trời · Lam". */
  appearanceValue: string;
  privacyValue: string;
  languageValue: string;
  soundOn: boolean;
  onSoundChange: (on: boolean) => void;
  onOpenAppearance: () => void;
  onOpenPrivacy: () => void;
  onOpenLanguage: () => void;
  onOpenPro: () => void;
  onOpenQr: () => void;
  proTitle: string;
  proSub: string;
  onSignOut: () => void;
  onBack: () => void;
}) {
  const t = useT();
  const s = useStyles(make);

  return (
    <Screen>
      <TopBar title={t('common.settings')} closeLabel={t('settings.back')} onClose={onBack} />

      <Scroll>
        <View style={s.body}>
          <Card style={s.me}>
            <Avatar name={name} uri={photo ?? undefined} size={84} />
            <View style={s.who}>
              <Txt variant="title" center numberOfLines={1}>
                {name}
              </Txt>
              {username ? (
                <Txt variant="body" tone="muted" center>
                  @{username}
                </Txt>
              ) : null}
            </View>
            <Row gap="sm">
              <Stat value={posts30} label={t('me.posts')} />
              <Stat value={friendCount} label={t('me.friends')} />
            </Row>
          </Card>

          <ProCard title={proTitle} sub={proSub} onPress={onOpenPro} />

          <Card style={s.list}>
            <NavRow icon="qr" title={t('qr.open')} onPress={onOpenQr} />
            <Divider inset />
            <NavRow
              icon="palette"
              title={t('settings.appearance')}
              value={appearanceValue}
              onPress={onOpenAppearance}
            />
            <Divider inset />
            <NavRow
              icon="shield"
              title={t('settings.privacy')}
              value={privacyValue}
              onPress={onOpenPrivacy}
            />
            <Divider inset />
            <NavRow
              icon="language"
              title={t('settings.language')}
              value={languageValue}
              onPress={onOpenLanguage}
            />
            <Divider inset />
            <View style={s.toggle}>
              <IconBadge name="music" />
              <View style={s.flex}>
                <Toggle
                  value={soundOn}
                  onChange={onSoundChange}
                  label={t('sound.title')}
                  hint={t('sound.label')}
                />
              </View>
            </View>
          </Card>

          <Card style={s.list}>
            <NavRow icon="logout" title={t('account.signOut')} onPress={onSignOut} danger />
          </Card>
        </View>
      </Scroll>
    </Screen>
  );
}

/** Thẻ Pro: khối nổi màu nhấn có gờ đậm như nút, vương miện vàng không khung. */
function ProCard({ title, sub, onPress }: { title: string; sub: string; onPress: () => void }) {
  const s = useStyles(make);
  const c = useColors();
  return (
    <Tap
      onPress={onPress}
      scaleTo={0.98}
      style={s.pro}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Icon name="crown" size={32} color={c.vivid.yellow} weight="fill" />
      <View style={s.flex}>
        <Txt variant="section" tone="onAccent">
          {title}
        </Txt>
        <Txt variant="faint" tone="onAccent" numberOfLines={1}>
          {sub}
        </Txt>
      </View>
      <Icon name="forward" size={20} color={c.onAccent} />
    </Tap>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const s = useStyles(make);
  return (
    <View style={s.stat}>
      <Txt variant="title" tone="accent">
        {value}
      </Txt>
      <Txt variant="faint" tone="muted" numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    body: {
      paddingTop: space.sm,
      paddingBottom: space.huge,
      gap: space.lg,
      maxWidth: layout.maxTextWidth,
      width: '100%',
      alignSelf: 'center',
    },
    me: { alignItems: 'center', gap: space.lg, paddingVertical: space.xxl },
    who: { alignItems: 'center', gap: 2, alignSelf: 'stretch' },
    stat: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: space.md,
      borderRadius: radius.md,
      backgroundColor: c.bg,
    },
    list: { paddingVertical: space.xs },
    toggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingVertical: space.sm,
    },
    flex: { flex: 1 },
    pro: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      padding: space.lg,
      borderRadius: radius.xl,
      backgroundColor: c.accent,
      borderBottomWidth: 5,
      borderBottomColor: c.accentDeep,
    },
  });
