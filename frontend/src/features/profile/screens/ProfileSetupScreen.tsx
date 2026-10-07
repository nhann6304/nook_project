/**
 * Màn 4 — Tên và ảnh. Người MỚI đi qua đúng một lần, ngay sau khi nhập mã.
 *
 * Ba thứ, không hơn: ảnh (tuỳ chọn), tên hiện, và @tên riêng để bạn bè tìm.
 * @tên tự gợi ý theo tên hiện cho tới khi người dùng tự sửa nó — sửa rồi thì
 * thôi không gợi ý đè lên nữa.
 */
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar, Button, Col, Field, Flex, HelperText, Icon, Screen, Tap, Txt } from '@ui';
import { radius, space, useColors, useStyles, type Palette } from '@design';
import { useT } from '@i18n';
import * as feel from '@/lib/haptics';
import { cleanUsername, suggestUsername, usernameProblem } from '../lib/username';

const AVATAR = 112;
const NAME_MAX = 24;

export function ProfileSetupScreen({
  busy = false,
  usernameError,
  onSubmit,
}: {
  busy?: boolean;
  /** Lỗi server trả về cho @tên (đã có người lấy). */
  usernameError?: string | null;
  onSubmit: (p: { name: string; username: string; avatarUri: string | null }) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [edited, setEdited] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const changeName = useCallback(
    (v: string) => {
      setName(v);
      if (!edited) setUsername(suggestUsername(v));
    },
    [edited],
  );

  const changeUsername = useCallback((v: string) => {
    setEdited(true);
    setUsername(cleanUsername(v));
  }, []);

  // Huỷ chọn ảnh là một lựa chọn, không phải sự cố — im lặng quay về.
  const pick = useCallback(async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    const first = res.assets?.[0];
    if (res.canceled || !first) return;
    feel.select();
    setAvatarUri(first.uri);
  }, []);

  const trimmed = name.trim();
  const problem = usernameProblem(username);
  const ready = trimmed.length > 0 && problem === null;

  const hint =
    usernameError ??
    (username.length > 0 && problem === 'chars'
      ? t('profile.usernameChars')
      : username.length > 0 && problem === 'short'
        ? t('profile.usernameShort')
        : t('profile.usernameHint'));
  const hintTone = usernameError || (username.length > 0 && problem) ? 'danger' : 'muted';

  return (
    <Screen keyboard>
      <Col gap="sm" style={s.head}>
        <Txt variant="title">{t('profile.title')}</Txt>
        <Txt variant="body" tone="muted">
          {t('profile.sub')}
        </Txt>
      </Col>

      <View style={s.avatarRow}>
        <Tap
          onPress={() => void pick()}
          scaleTo={0.95}
          accessibilityLabel={avatarUri ? t('profile.changePhoto') : t('profile.addPhoto')}
        >
          <Avatar
            name={trimmed || ' '}
            uri={avatarUri ?? undefined}
            dormant={!avatarUri}
            size={AVATAR}
          />
          {!avatarUri && !trimmed ? (
            <View style={s.cameraIcon} pointerEvents="none">
              <Icon name="camera" size={30} color={c.textFaint} />
            </View>
          ) : null}
          <View style={s.badge} pointerEvents="none">
            <Icon name={avatarUri ? 'edit' : 'add'} size={18} color={c.onAccent} />
          </View>
        </Tap>
      </View>

      <Col gap="md">
        <Field
          value={name}
          onChangeText={changeName}
          placeholder={t('profile.namePlaceholder')}
          accessibilityLabel={t('profile.nameLabel')}
          maxLength={NAME_MAX}
          autoCapitalize="words"
          textContentType="givenName"
          autoComplete="name"
          returnKeyType="next"
        />
        <View>
          <Field
            value={username}
            onChangeText={changeUsername}
            invalid={hintTone === 'danger'}
            placeholder={t('profile.usernamePlaceholder')}
            accessibilityLabel={t('profile.usernameLabel')}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            returnKeyType="done"
            prefix={
              <Txt variant="body" tone="faint" style={s.at}>
                @
              </Txt>
            }
          />
          <HelperText tone={hintTone}>{hint}</HelperText>
        </View>
      </Col>

      <Flex />
      <Button
        label={t('profile.continue')}
        block
        loading={busy}
        disabled={!ready}
        onPress={() => onSubmit({ name: trimmed, username, avatarUri })}
        style={s.cta}
      />
    </Screen>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    head: { paddingTop: space.xxl },
    avatarRow: { alignItems: 'center', paddingVertical: space.xxl },
    cameraIcon: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      right: 2,
      bottom: 2,
      width: 34,
      height: 34,
      borderRadius: radius.full,
      backgroundColor: c.accent,
      borderWidth: 3,
      borderColor: c.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    at: { paddingLeft: space.lg, marginRight: -space.sm },
    cta: { marginBottom: space.md },
  });
