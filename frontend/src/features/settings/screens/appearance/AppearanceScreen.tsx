/**
 * Giao diện — trang con của Cài đặt. Chọn chỉ đổi BẢN NHÁP và hình xem trước;
 * bấm Lưu mới áp dụng cho cả app và gửi server một lần.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Txt } from '@ui';
import {
  previewPalette,
  space,
  useStyles,
  type AccentKey,
  type SkyScene,
  type ThemeMode,
} from '@design';
import { useT } from '@i18n';
import { AccentPicker } from './components/AccentPicker';
import { ChoiceRow, PrefPage, PrefSection } from '../../components/Pref';
import { SkyStrip } from './components/SkyStrip';
import { ThemePreview } from './components/ThemePreview';

export function AppearanceScreen({
  mode,
  accent,
  accentNames,
  sceneNames,
  rainReady,
  onEnableRain,
  onSave,
  onBack,
}: {
  mode: ThemeMode;
  accent: AccentKey;
  accentNames: Readonly<Record<AccentKey, string>>;
  sceneNames: Readonly<Record<SkyScene, string>>;
  rainReady: boolean;
  onEnableRain: () => void;
  /** Trả câu lỗi nếu server không nhận (máy vẫn đã áp dụng). */
  onSave: (mode: ThemeMode, accent: AccentKey) => Promise<string | null>;
  onBack: () => void;
}) {
  const t = useT();
  const s = useStyles(make);
  const [draftMode, setDraftMode] = useState(mode);
  const [draftAccent, setDraftAccent] = useState(accent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = previewPalette(draftMode, draftAccent);
  const scene: SkyScene = preview.scene === 'rainNight' ? 'rain' : preview.scene;
  const dirty = draftMode !== mode || draftAccent !== accent;

  const save = async () => {
    setSaving(true);
    setError(null);
    const err = await onSave(draftMode, draftAccent);
    setSaving(false);
    if (err) setError(err);
    else onBack();
  };

  const modes: { value: ThemeMode; title: string; hint: string }[] = [
    { value: 'sky', title: t('theme.sky'), hint: t('theme.skyNote') },
    { value: 'light', title: t('theme.light'), hint: t('settings.lightHint') },
    { value: 'dark', title: t('theme.dark'), hint: t('settings.darkHint') },
    { value: 'system', title: t('theme.system'), hint: t('theme.systemNote') },
  ];

  return (
    <PrefPage
      title={t('settings.appearance')}
      backLabel={t('settings.back')}
      onBack={onBack}
      saveLabel={t('settings.save')}
      onSave={() => void save()}
      dirty={dirty}
      saving={saving}
      error={error}
    >
      <ThemePreview
        palette={preview}
        caption={t('settings.previewCaption', {
          scene: sceneNames[scene],
          accent: accentNames[draftAccent],
        })}
        button={t('settings.previewButton')}
      />

      <PrefSection title={t('settings.mode')}>
        <View style={s.list}>
          {modes.map((m) => (
            <ChoiceRow
              key={m.value}
              title={m.title}
              hint={m.hint}
              selected={draftMode === m.value}
              onPress={() => setDraftMode(m.value)}
            />
          ))}
        </View>
        {draftMode === 'sky' ? (
          <View style={s.sky}>
            <SkyStrip
              current={scene}
              accent={draftAccent}
              names={sceneNames}
              nowLabel={t('theme.now')}
            />
            {rainReady ? (
              <Txt variant="faint" tone="accent">
                {t('theme.rainReady')}
              </Txt>
            ) : (
              <>
                <Button
                  label={t('theme.rainOn')}
                  variant="secondary"
                  onPress={onEnableRain}
                  block
                />
                <Txt variant="faint" tone="muted">
                  {t('theme.rainHint')}
                </Txt>
              </>
            )}
          </View>
        ) : null}
      </PrefSection>

      <PrefSection title={t('settings.locket')}>
        <AccentPicker
          current={draftAccent}
          names={accentNames}
          label={t('settings.locket')}
          onPick={setDraftAccent}
        />
        <Txt variant="faint" tone="muted">
          {t('theme.locketHint')}
        </Txt>
      </PrefSection>
    </PrefPage>
  );
}

const make = () =>
  StyleSheet.create({
    list: { gap: space.sm },
    sky: { gap: space.md, paddingTop: space.md },
  });
