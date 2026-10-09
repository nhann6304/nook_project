/**
 * Riêng tư — khoá trang cá nhân + người xem mặc định của ảnh mới. Bản nháp,
 * bấm Lưu mới áp dụng và gửi server một lần.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Toggle, Txt } from '@ui';
import { space, useStyles } from '@design';
import { useT } from '@i18n';
import { AudiencePicker, type AudiencePerson } from '@/features/camera/components/audience/AudiencePicker';
import { AudienceSheet } from '@/features/camera/components/audience/AudienceSheet';
import { PrefPage, PrefSection } from '../../components/Pref';

const sameSet = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

export function PrivacyScreen({
  locked,
  hidden,
  audience,
  onSave,
  onBack,
}: {
  locked: boolean;
  hidden: readonly string[];
  audience: readonly AudiencePerson[];
  onSave: (locked: boolean, hidden: readonly string[]) => Promise<string | null>;
  onBack: () => void;
}) {
  const t = useT();
  const s = useStyles(make);
  const [draftLocked, setDraftLocked] = useState(locked);
  const [draftHidden, setDraftHidden] = useState<readonly string[]>(hidden);
  const [sheet, setSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = draftLocked !== locked || !sameSet(draftHidden, hidden);
  const toggle = (id: string) =>
    setDraftHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));

  const save = async () => {
    setSaving(true);
    setError(null);
    const err = await onSave(draftLocked, draftHidden);
    setSaving(false);
    if (err) setError(err);
    else onBack();
  };

  return (
    <PrefPage
      title={t('settings.privacy')}
      backLabel={t('settings.back')}
      onBack={onBack}
      saveLabel={t('settings.save')}
      onSave={() => void save()}
      dirty={dirty}
      saving={saving}
      error={error}
    >
      <Card>
        <Toggle
          value={draftLocked}
          onChange={setDraftLocked}
          label={t('privacy.lock')}
          hint={t('privacy.lockHint')}
        />
      </Card>

      <PrefSection title={t('audience.settingsTitle')}>
        <Txt variant="faint" tone="muted">
          {t('audience.settingsHint')}
        </Txt>
        {audience.length === 0 ? (
          <Txt variant="body" tone="muted">
            {t('audience.empty')}
          </Txt>
        ) : (
          <View style={s.bleed}>
            <AudiencePicker
              people={audience}
              hidden={draftHidden}
              onToggle={toggle}
              onToggleAll={() =>
                setDraftHidden((h) => (h.length > 0 ? [] : audience.map((p) => p.id)))
              }
              onSearch={() => setSheet(true)}
              searchLabel={t('audience.search')}
              allLabel={t('audience.all')}
              hiddenLabel={(n) => t('audience.hiddenPerson', { name: n })}
              label={t('audience.settingsTitle')}
            />
          </View>
        )}
      </PrefSection>

      <AudienceSheet
        visible={sheet}
        people={audience}
        hidden={draftHidden}
        onToggle={toggle}
        onClose={() => setSheet(false)}
        title={t('audience.settingsTitle')}
        searchLabel={t('audience.searchPlaceholder')}
        doneLabel={t('audience.done')}
        shownLabel={t('audience.shown')}
        hiddenLabel={t('audience.hidden')}
        emptyLabel={t('audience.noMatch')}
      />
    </PrefPage>
  );
}

const make = () =>
  StyleSheet.create({
    // Hàng avatar cuộn tới mép màn, không bị cắt ở lề trong.
    bleed: { marginHorizontal: -space.lg },
  });
