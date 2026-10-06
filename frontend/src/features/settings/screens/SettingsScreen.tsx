/**
 * Cài đặt — tab thứ ba của thanh dưới đáy. Bố cục 06/10/2026: trên cùng là
 * trang của mình (tên, ảnh, số ảnh 30 ngày), dưới là từng nhóm một thẻ, mỗi
 * hàng một icon tròn lam nhạt bên trái (kiểu ô "Một vài mẹo nhỏ"). CHỈ hiện hàng đã chạy được thật:
 * vẽ sẵn "Thông báo" rồi bấm không có gì thì người dùng tưởng app hỏng.
 *
 * Thứ tự theo đặc tả: Riêng tư trước, rồi Giao diện, Âm thanh, Ngôn ngữ.
 */
import { StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  IconBadge,
  Row,
  Screen,
  Scroll,
  Segmented,
  Toggle,
  TopBar,
  Txt,
  type IconName,
} from '@ui';
import { layout, radius, space, useStyles, type AccentKey, type Palette, type ThemeMode } from '@design';
import {
  LOCALES,
  LOCALE_NAMES,
  useFollowSystem,
  useFollowingSystem,
  useLocale,
  useSetLocale,
  useT,
  type Locale,
} from '@i18n';
import { AccentPicker } from '../components/AccentPicker';

const LOCALE_OPTIONS = LOCALES.map((l) => ({ value: l, label: LOCALE_NAMES[l] }));

export function SettingsScreen({
  name,
  username,
  photo,
  friendCount,
  posts30,
  mode,
  onPickMode,
  accent,
  accentNames,
  onPickAccent,
  locked,
  onLockChange,
  soundOn,
  onSoundChange,
}: {
  name: string;
  username: string | null;
  photo?: string | null;
  friendCount: number;
  /** Số ảnh mình gửi trong 30 ngày — chỉ của chính mình, không so với ai. */
  posts30: number;
  mode: ThemeMode;
  onPickMode: (mode: ThemeMode) => void;
  accent: AccentKey;
  accentNames: Readonly<Record<AccentKey, string>>;
  onPickAccent: (key: AccentKey) => void;
  /** Trang cá nhân đang khoá. */
  locked: boolean;
  onLockChange: (locked: boolean) => void;
  soundOn: boolean;
  onSoundChange: (on: boolean) => void;
}) {
  const t = useT();
  const s = useStyles(make);
  const locale = useLocale();
  const following = useFollowingSystem();
  const setLocale = useSetLocale();
  const followSystem = useFollowSystem();

  return (
    <Screen edges={TOP}>
      <TopBar title={t('common.settings')} />

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

          <Group title={t('privacy.title')}>
            <Line icon="lock-closed">
              <Toggle
                value={locked}
                onChange={onLockChange}
                label={t('privacy.lock')}
                hint={t('privacy.lockHint')}
              />
            </Line>
          </Group>

          <Group title={t('theme.title')}>
            <Line icon="contrast" title={t('theme.mode')}>
              <Segmented<ThemeMode>
                options={[
                  { value: 'light', label: t('theme.light') },
                  { value: 'dark', label: t('theme.dark') },
                  { value: 'system', label: t('theme.system') },
                ]}
                value={mode}
                onChange={onPickMode}
                label={t('theme.mode')}
              />
              {mode === 'system' ? (
                <Txt variant="faint" tone="muted">
                  {t('theme.systemNote')}
                </Txt>
              ) : null}
            </Line>
            <Divider inset />
            <Line icon="color-palette" title={t('theme.locket')} hint={t('theme.locketHint')}>
              <AccentPicker
                current={accent}
                names={accentNames}
                label={t('theme.locket')}
                onPick={onPickAccent}
              />
            </Line>
          </Group>

          <Group title={t('sound.title')}>
            <Line icon="musical-notes">
              <Toggle
                value={soundOn}
                onChange={onSoundChange}
                label={t('sound.label')}
                hint={t('sound.hint')}
              />
            </Line>
          </Group>

          <Group title={t('language.title')}>
            <Line icon="language" title={t('language.label')}>
              <Segmented<Locale>
                options={LOCALE_OPTIONS}
                value={locale}
                onChange={setLocale}
                label={t('language.label')}
              />
              {following ? (
                <Txt variant="faint" tone="muted">
                  {t('language.systemNote', { name: LOCALE_NAMES[locale] })}
                </Txt>
              ) : (
                <Button label={t('language.system')} variant="ghost" onPress={followSystem} block />
              )}
            </Line>
          </Group>
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

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const s = useStyles(make);
  return (
    <View style={s.group}>
      <Txt variant="label" tone="muted" style={s.groupTitle}>
        {title}
      </Txt>
      <Card style={s.card}>{children}</Card>
    </View>
  );
}

/** Một hàng: icon tròn bên trái, nội dung bên phải. */
function Line({
  icon,
  title,
  hint,
  children,
}: {
  icon: IconName;
  title?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const s = useStyles(make);
  return (
    <View style={s.line}>
      <IconBadge name={icon} />
      <View style={s.content}>
        {title ? (
          <View style={s.head}>
            <Txt variant="label">{title}</Txt>
            {hint ? (
              <Txt variant="faint" tone="muted">
                {hint}
              </Txt>
            ) : null}
          </View>
        ) : null}
        {children}
      </View>
    </View>
  );
}

/** Tab gốc: thanh tab đã lo phần đáy máy. */
const TOP = ['top'] as const;

const make = (c: Palette) =>
  StyleSheet.create({
    me: { alignItems: 'center', gap: space.lg, paddingVertical: space.xxl },
    who: { alignItems: 'center', gap: 2, alignSelf: 'stretch' },
    stat: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: space.md,
      borderRadius: radius.md,
      backgroundColor: c.bg,
    },
    body: {
      paddingTop: space.lg,
      paddingBottom: space.huge,
      gap: space.xxl,
      maxWidth: layout.maxTextWidth,
      width: '100%',
      alignSelf: 'center',
    },
    group: { gap: space.sm },
    groupTitle: { paddingHorizontal: space.xs },
    card: { paddingVertical: space.sm, gap: 0 },
    line: { flexDirection: 'row', gap: space.md, paddingVertical: space.md },
    content: { flex: 1, gap: space.md, justifyContent: 'center', minHeight: layout.minTouch - space.sm },
    head: { gap: 2 },
  });
