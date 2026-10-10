/**
 * Màn 2 — Tạo tài khoản · Đăng nhập · Quên mật khẩu (10/10/2026: có mật khẩu).
 *
 * MỘT màn cho cả ba việc: ô email/số + ô mật khẩu, chỉ khác chữ và nút phụ.
 *   signup  email + mật khẩu → gửi mã → nhập mã là xong tài khoản
 *   signin  email + mật khẩu → vào thẳng, không mã
 *   reset   email + mật khẩu MỚI → gửi mã → nhập mã là đổi xong
 *
 * `key={method}` trên ô nhập là bắt buộc: đổi email ↔ số điện thoại mà không
 * thay key thì Android giữ nguyên bàn phím chữ, người dùng phải tự tìm bàn
 * phím số. iOS đổi được, Android thì không — đây là bẫy hai nền tảng.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Col,
  Field,
  Flex,
  HelperText,
  Icon,
  IconButton,
  Row,
  Screen,
  Segmented,
  Tap,
  Txt,
  type ComposerHandle,
} from '@ui';
import { layout, space, useColors, useStyles, type Palette } from '@design';
import { useT, type T } from '@i18n';
import {
  formatVnPhone,
  isPasswordLongEnough,
  isValidTarget,
  type SignInIntent,
  type SignInMethod,
} from '../../utils/identity';

export type { SignInIntent };

/**
 * Chữ của ba cửa. Bảng tra tĩnh chứ không phải `t(\`signIn.${intent}Title\`)`:
 * khoá ghép bằng chuỗi thì tsc không kiểm được nữa, mà kiểm được khoá chính là
 * lý do module i18n này tồn tại.
 */
const COPY = {
  signup: {
    title: 'signIn.signupTitle',
    sub: 'signIn.signupSub',
    cta: 'signIn.signupCta',
    password: 'signIn.passwordNew',
    switchTo: 'signin',
    switchLabel: 'signIn.haveAccount',
  },
  signin: {
    title: 'signIn.signinTitle',
    sub: 'signIn.signinSub',
    cta: 'signIn.signinCta',
    password: 'signIn.password',
    switchTo: 'signup',
    switchLabel: 'signIn.noAccount',
  },
  reset: {
    title: 'signIn.resetTitle',
    sub: 'signIn.resetSub',
    cta: 'signIn.resetCta',
    password: 'signIn.passwordReset',
    switchTo: 'signin',
    switchLabel: 'signIn.backToSignin',
  },
} as const satisfies Record<SignInIntent, { switchTo: SignInIntent } & Record<string, string>>;

const methodOptions = (t: T) =>
  [
    { value: 'email', label: t('signIn.email') },
    { value: 'phone', label: t('signIn.phone') },
  ] as const;

export function SignInScreen({
  intent,
  busy = false,
  error,
  onSubmit,
  onSwitch,
}: {
  intent: SignInIntent;
  busy?: boolean;
  error?: string | null;
  onSubmit: (method: SignInMethod, target: string, password: string) => void;
  /** Đổi sang cửa khác, giữ nguyên những gì đã gõ. */
  onSwitch: (intent: SignInIntent) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const passwordRef = useRef<ComposerHandle>(null);
  const [method, setMethod] = useState<SignInMethod>('email');
  const [value, setValue] = useState('');
  const [password, setPassword] = useState('');
  const [shown, setShown] = useState(false);
  const [touched, setTouched] = useState(false);

  const copy = COPY[intent];
  const methods = useMemo(() => methodOptions(t), [t]);
  const targetOk = isValidTarget(method, value);
  const passwordOk = isPasswordLongEnough(password);
  const valid = targetOk && passwordOk;
  const showError = touched && value.length > 0 && !targetOk;

  const hint = useMemo(() => {
    if (error) return error;
    if (showError) return method === 'email' ? t('signIn.badEmail') : t('signIn.badPhone');
    return undefined;
  }, [error, method, showError, t]);

  const changeMethod = useCallback((m: SignInMethod) => {
    setMethod(m);
    setValue('');
    setTouched(false);
  }, []);

  const change = useCallback(
    (v: string) => setValue(method === 'phone' ? formatVnPhone(v) : v),
    [method],
  );

  const submit = useCallback(() => {
    if (valid && !busy) onSubmit(method, value, password);
  }, [busy, method, onSubmit, password, valid, value]);

  // Đăng nhập là mật khẩu ĐANG có; tạo mới / đặt lại là mật khẩu MỚI — hệ
  // điều hành gợi ý lưu / tự sinh mật khẩu theo đúng chữ này.
  const isNew = intent !== 'signin';

  return (
    <Screen keyboard>
      <Col gap="sm" style={s.head}>
        <Txt variant="title">{t(copy.title)}</Txt>
        <Txt variant="body" tone="muted">
          {t(copy.sub)}
        </Txt>
      </Col>

      <View style={s.form}>
        <Segmented
          options={methods}
          value={method}
          onChange={changeMethod}
          label={t('signIn.methodLabel')}
        />

        <Field
          // Đổi cách nhận mã = ô nhập mới hoàn toàn, để Android đổi bàn phím.
          key={method}
          value={value}
          onChangeText={change}
          onBlur={() => setTouched(true)}
          invalid={showError}
          autoFocus
          placeholder={
            method === 'email' ? t('signIn.emailPlaceholder') : t('signIn.phonePlaceholder')
          }
          keyboardType={method === 'email' ? 'email-address' : 'number-pad'}
          inputMode={method === 'email' ? 'email' : 'numeric'}
          textContentType={method === 'email' ? 'emailAddress' : 'telephoneNumber'}
          autoComplete={method === 'email' ? 'email' : 'tel'}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          prefix={
            method === 'phone' ? (
              <Txt variant="body" tone="muted">
                +84
              </Txt>
            ) : undefined
          }
          containerStyle={s.field}
        />

        <Field
          ref={passwordRef}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!shown}
          placeholder={t(copy.password)}
          accessibilityLabel={t(copy.password)}
          textContentType={isNew ? 'newPassword' : 'password'}
          autoComplete={isNew ? 'new-password' : 'current-password'}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={submit}
          suffix={
            <IconButton
              label={shown ? t('signIn.hidePassword') : t('signIn.showPassword')}
              onPress={() => setShown((v) => !v)}
              style={s.eye}
            >
              <Icon name={shown ? 'eyeOff' : 'eye'} size={20} color={c.textMuted} />
            </IconButton>
          }
        />

        <HelperText tone={hint ? 'danger' : 'muted'}>
          {hint ?? (isNew ? t('signIn.passwordRule') : undefined)}
        </HelperText>

        {/* Nút nằm NGAY dưới ô nhập, không đẩy xuống đáy màn: khi bàn phím bật
            lên, nút ở đáy bị che mất và người dùng tưởng màn này không có nút. */}
        <Button label={t(copy.cta)} onPress={submit} disabled={!valid} loading={busy} block />

        {intent === 'signin' ? (
          <Tap
            onPress={() => onSwitch('reset')}
            style={s.link}
            accessibilityLabel={t('signIn.forgot')}
          >
            <Txt variant="label" tone="accent" center>
              {t('signIn.forgot')}
            </Txt>
          </Tap>
        ) : null}

        {intent === 'signup' ? <Terms text={t('signIn.terms')} /> : null}
      </View>

      <Flex />

      <Tap
        onPress={() => onSwitch(copy.switchTo)}
        style={s.link}
        accessibilityLabel={t(copy.switchLabel)}
      >
        <Txt variant="body" tone="muted" center>
          {t(copy.switchLabel)}
        </Txt>
      </Tap>
    </Screen>
  );
}

/**
 * Hộp điều khoản — chỉ hiện ở cửa Tạo tài khoản.
 * Nội dung thật chưa có; chỗ này giữ đúng bố cục để sau thay chữ là xong.
 */
function Terms({ text }: { text: string }) {
  const s = useStyles(make);
  return (
    <Row style={s.terms}>
      <View style={s.termsBar} />
      <Txt variant="faint" tone="faint" style={s.termsText}>
        {text}
      </Txt>
    </Row>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    head: { paddingTop: space.xxl, maxWidth: layout.maxTextWidth },
    form: { marginTop: space.xxxl, gap: space.lg, maxWidth: layout.maxTextWidth, width: '100%' },
    field: { marginTop: space.xs },
    eye: { width: layout.minTouch, height: layout.minTouch },
    link: { minHeight: layout.minTouch, justifyContent: 'center', paddingHorizontal: space.md },

    terms: { marginTop: space.sm, gap: space.md, alignItems: 'flex-start' },
    termsBar: { width: 2, alignSelf: 'stretch', backgroundColor: c.borderSoft },
    termsText: { flex: 1 },
  });
