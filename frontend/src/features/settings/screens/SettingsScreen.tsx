/**
 * Cài đặt.
 *
 * Đặc tả đầy đủ có bốn màn (docs/03-screen-specs.md, nhóm D). Ở đây CHỈ hiện
 * những hàng đã chạy được thật. Vẽ sẵn "Vị trí", "Thông báo", "Tài khoản" rồi
 * bấm vào không có gì xảy ra thì tệ hơn là chưa có: người dùng tưởng app hỏng,
 * còn người viết code thì tưởng phần đó đã xong.
 *
 * Khi nào dựng thêm màn thì thêm hàng vào đây, không phải sửa gì khác.
 *
 * Luật thứ tự của đặc tả vẫn giữ: nhóm "Riêng tư" đứng đầu — chưa có hàng nào
 * chạy được nên nhóm đó chưa hiện, nhưng chỗ của nó là trên cùng.
 */
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Col, Row, Screen, Scroll, Segmented, TopBar, Txt } from '@ui';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SKIES,
  SKY_KEYS,
  layout,
  radius,
  space,
  useStyles,
  type Palette,
  type PaletteKey,
  type SkyKey,
  type ThemeMode,
} from '@design';
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
import { PalettePicker } from '../components/PalettePicker';

const LOCALE_OPTIONS = LOCALES.map((l) => ({ value: l, label: LOCALE_NAMES[l] }));

export function SettingsScreen({
  name,
  friendCount,
  palette,
  paletteNames,
  onPickPalette,
  mode,
  sky,
  skyNames,
  onPickMode,
  onClose,
}: {
  name: string;
  friendCount: number;
  palette: PaletteKey;
  paletteNames: Readonly<Record<PaletteKey, string>>;
  onPickPalette: (key: PaletteKey) => void;
  mode: ThemeMode;
  sky: SkyKey | null;
  skyNames: Readonly<Record<SkyKey, string>>;
  onPickMode: (mode: ThemeMode) => void;
  onClose: () => void;
}) {
  const t = useT();
  const s = useStyles(make);
  const locale = useLocale();
  const following = useFollowingSystem();
  const setLocale = useSetLocale();
  const followSystem = useFollowSystem();

  return (
    <Screen>
      <TopBar title={t('common.settings')} closeLabel={t('common.closeScreen')} onClose={onClose} />

      <Scroll>
        <Card style={s.profile}>
          <Row gap="md" align="center">
            <Avatar name={name} level={10} size={52} />
            <Col gap="xs">
              <Txt variant="section">{name}</Txt>
              <Txt variant="faint" tone="muted">
                {t('circle.slots', { filled: friendCount, total: 10 })}
              </Txt>
            </Col>
          </Row>
        </Card>

        <Group title={t('theme.title')}>
          <Card style={s.card}>
            <Segmented<ThemeMode>
              options={[
                { value: 'auto', label: t('theme.auto') },
                { value: 'fixed', label: t('theme.fixed') },
              ]}
              value={mode}
              onChange={onPickMode}
              label={t('theme.mode')}
            />
            {mode === 'auto' ? (
              <>
                <View style={s.skies}>
                  {SKY_KEYS.map((k) => (
                    <SkyCard
                      key={k}
                      palette={SKIES[k]}
                      name={skyNames[k]}
                      now={k === sky ? t('theme.now') : null}
                    />
                  ))}
                </View>
                <Txt variant="faint" tone="muted">
                  {t('theme.autoNote')}
                </Txt>
              </>
            ) : (
              <>
                <PalettePicker
                  current={palette}
                  names={paletteNames}
                  label={t('theme.label')}
                  onPick={onPickPalette}
                />
                <Txt variant="faint" tone="muted">
                  {t('theme.fixedNote')}
                </Txt>
              </>
            )}
          </Card>
        </Group>

        <Group title={t('language.title')}>
          <Card style={s.card}>
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
          </Card>
        </Group>
      </Scroll>
    </Screen>
  );
}

/** Một chặng trời, vẽ bằng chính màu của chặng đó. */
function SkyCard({ palette, name, now }: { palette: Palette; name: string; now: string | null }) {
  const s = useStyles(make);
  return (
    <View style={[s.sky, now !== null && s.skyNow]}>
      <LinearGradient
        colors={palette.sky ?? [palette.bg, palette.bg]}
        style={StyleSheet.absoluteFill}
      />
      <Txt variant="label" style={[s.skyText, { color: palette.text }]}>
        {name}
      </Txt>
      {now ? (
        <Txt variant="faint" style={[s.skyText, { color: palette.textMuted }]}>
          {now}
        </Txt>
      ) : null}
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const s = useStyles(make);
  return (
    <View style={s.group}>
      <Txt variant="label" tone="faint" style={s.groupTitle}>
        {title}
      </Txt>
      {children}
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    skies: { flexDirection: 'row', gap: space.sm - 2 },
    sky: {
      flex: 1,
      height: 84,
      borderRadius: radius.sm + 2,
      overflow: 'hidden',
      padding: space.sm,
      justifyContent: 'flex-end',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    skyNow: { borderColor: c.accent },
    skyText: { fontSize: 12, lineHeight: 16 },
    profile: { marginTop: space.lg, maxWidth: layout.maxTextWidth, width: '100%' },
    group: { marginTop: space.xxl, gap: space.sm, maxWidth: layout.maxTextWidth, width: '100%' },
    groupTitle: { paddingHorizontal: space.xs },
    card: { gap: space.lg },
  });
