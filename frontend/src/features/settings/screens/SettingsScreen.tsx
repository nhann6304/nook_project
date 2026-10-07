/**
 * Cài đặt — tab thứ tư. Màn này CHỈ là mục lục (07/10/2026 — bản trải hết mọi
 * lựa chọn ra một màn bị chê "khó nhìn, khó chỉnh"): trang của mình ở trên,
 * rồi từng hàng mở một trang con có nút Lưu. Âm thanh là một công tắc nên để
 * ngay tại chỗ — mở trang chỉ để bật/tắt một thứ là thừa.
 */
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Divider, IconBadge, Row, Screen, Scroll, Toggle, Txt } from '@ui';
import { layout, radius, space, useStyles, type Palette } from '@design';
import { useT } from '@i18n';
import { NavRow } from '../components/Pref';

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
  onSignOut,
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
  onSignOut: () => void;
}) {
  const t = useT();
  const s = useStyles(make);

  return (
    <Screen edges={TOP}>
      <View style={s.header}>
        <Txt variant="title">{t('common.settings')}</Txt>
      </View>

      <Scroll>
        <View style={s.body}>
          <Card style={s.me}>
            <Avatar name={name} uri={photo ?? undefined} level={10} size={84} />
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

          <Card style={s.list}>
            <NavRow
              icon="palette"
              title={t('settings.appearance')}
              value={appearanceValue}
              onPress={onOpenAppearance}
            />
            <Divider inset />
            <NavRow
              icon="lock"
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

/** Tab gốc: thanh tab đã lo phần đáy máy. */
const TOP = ['top'] as const;

const make = (c: Palette) =>
  StyleSheet.create({
    header: { height: 52, justifyContent: 'center' },
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
  });
