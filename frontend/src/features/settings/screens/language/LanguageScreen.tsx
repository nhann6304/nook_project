/** Ngôn ngữ — chọn tiếng hoặc theo máy. Bản nháp, bấm Lưu mới đổi. */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { space, useStyles } from '@design';
import { LOCALES, LOCALE_NAMES, useT, type Locale } from '@i18n';
import { ChoiceRow, PrefPage } from '../../components/Pref';

/** `null` = theo ngôn ngữ máy. */
export type LocaleChoice = Locale | null;

export function LanguageScreen({
  current,
  onSave,
  onBack,
}: {
  current: LocaleChoice;
  onSave: (choice: LocaleChoice) => Promise<string | null>;
  onBack: () => void;
}) {
  const t = useT();
  const s = useStyles(make);
  const [draft, setDraft] = useState<LocaleChoice>(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const err = await onSave(draft);
    setSaving(false);
    if (err) setError(err);
    else onBack();
  };

  return (
    <PrefPage
      title={t('settings.language')}
      backLabel={t('settings.back')}
      onBack={onBack}
      saveLabel={t('settings.save')}
      onSave={() => void save()}
      dirty={draft !== current}
      saving={saving}
      error={error}
    >
      <View style={s.list}>
        <ChoiceRow
          title={t('settings.followPhone')}
          hint={t('settings.followPhoneHint')}
          selected={draft === null}
          onPress={() => setDraft(null)}
        />
        {LOCALES.map((l) => (
          <ChoiceRow
            key={l}
            title={LOCALE_NAMES[l]}
            selected={draft === l}
            onPress={() => setDraft(l)}
          />
        ))}
      </View>
    </PrefPage>
  );
}

const make = () => StyleSheet.create({ list: { gap: space.sm } });
