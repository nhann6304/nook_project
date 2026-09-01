/**
 * Màn 2 — Đăng nhập / Tạo tài khoản.
 *
 * MỘT màn cho cả hai cửa. Luồng y hệt nhau (gõ email hoặc số → nhận mã), chỉ
 * khác chữ và khác chỗ có hộp điều khoản. Tách thành hai màn là nhân đôi số
 * chỗ có thể hỏng mà không được gì.
 *
 * `key={method}` trên ô nhập là bắt buộc: đổi email ↔ số điện thoại mà không
 * thay key thì Android giữ nguyên bàn phím chữ, người dùng phải tự tìm bàn
 * phím số. iOS đổi được, Android thì không — đây là bẫy hai nền tảng.
 */
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Col,
  Field,
  Flex,
  HelperText,
  Row,
  Screen,
  Segmented,
  Txt,
} from '@ui';
import { color, layout, space } from '@design';
import { formatVnPhone, isValidTarget, type SignInMethod } from '../lib/identity';

export type SignInIntent = 'signup' | 'signin';

const COPY = {
  signup: {
    title: 'Tạo góc của bạn',
    sub: 'Chúng mình gửi bạn một mã sáu số để xác nhận đây đúng là bạn.',
    cta: 'Tiếp tục',
  },
  signin: {
    title: 'Chào bạn quay lại',
    sub: 'Nhập lại email hoặc số điện thoại bạn đã dùng lần trước.',
    cta: 'Gửi mã cho mình',
  },
} as const;

const METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Số điện thoại' },
] as const;

export function SignInScreen({
  intent,
  busy = false,
  error,
  onSubmit,
}: {
  intent: SignInIntent;
  busy?: boolean;
  error?: string | null;
  onSubmit: (method: SignInMethod, target: string) => void;
}) {
  const [method, setMethod] = useState<SignInMethod>('email');
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const copy = COPY[intent];
  const valid = isValidTarget(method, value);
  const showError = touched && value.length > 0 && !valid;

  const hint = useMemo(() => {
    if (error) return error;
    if (!showError) return undefined;
    return method === 'email'
      ? 'Email này trông chưa đúng. Bạn xem lại giúp mình nhé.'
      : 'Số này chưa đúng. Số di động Việt Nam có 10 chữ số.';
  }, [error, method, showError]);

  const changeMethod = useCallback((m: SignInMethod) => {
    setMethod(m);
    setValue('');
    setTouched(false);
  }, []);

  const change = useCallback(
    (t: string) => setValue(method === 'phone' ? formatVnPhone(t) : t),
    [method],
  );

  return (
    <Screen keyboard>
      <Col gap="sm" style={s.head}>
        <Txt variant="title">{copy.title}</Txt>
        <Txt variant="body" tone="muted">
          {copy.sub}
        </Txt>
      </Col>

      <View style={s.form}>
        <Segmented
          options={METHODS}
          value={method}
          onChange={changeMethod}
          label="Cách nhận mã"
        />

        <Field
          // Đổi cách nhận mã = ô nhập mới hoàn toàn, để Android đổi bàn phím.
          key={method}
          value={value}
          onChangeText={change}
          onBlur={() => setTouched(true)}
          invalid={showError}
          autoFocus
          placeholder={method === 'email' ? 'ban@gmail.com' : '912 345 678'}
          keyboardType={method === 'email' ? 'email-address' : 'number-pad'}
          inputMode={method === 'email' ? 'email' : 'numeric'}
          textContentType={method === 'email' ? 'emailAddress' : 'telephoneNumber'}
          autoComplete={method === 'email' ? 'email' : 'tel'}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={() => valid && onSubmit(method, value)}
          prefix={
            method === 'phone' ? (
              <Txt variant="body" tone="muted">
                +84
              </Txt>
            ) : undefined
          }
          containerStyle={s.field}
        />

        <HelperText tone={hint ? 'danger' : 'muted'}>{hint}</HelperText>

        {/* Nút nằm NGAY dưới ô nhập, không đẩy xuống đáy màn: khi bàn phím bật
            lên, nút ở đáy bị che mất và người dùng tưởng màn này không có nút. */}
        <Button
          label={copy.cta}
          onPress={() => onSubmit(method, value)}
          disabled={!valid}
          loading={busy}
          block
        />

        {intent === 'signup' ? <Terms /> : null}
      </View>

      <Flex />
    </Screen>
  );
}

/**
 * Hộp điều khoản — chỉ hiện ở cửa Tạo tài khoản.
 * Nội dung thật chưa có; chỗ này giữ đúng bố cục để sau thay chữ là xong.
 */
function Terms() {
  return (
    <Row style={s.terms}>
      <View style={s.termsBar} />
      <Txt variant="faint" tone="faint" style={s.termsText}>
        Chạm “Tiếp tục” là bạn đồng ý với Điều khoản dịch vụ và Chính sách riêng tư
        của Nook.
      </Txt>
    </Row>
  );
}

const s = StyleSheet.create({
  head: { paddingTop: space.xxl, maxWidth: layout.maxTextWidth },
  form: { marginTop: space.xxxl, gap: space.lg, maxWidth: layout.maxTextWidth, width: '100%' },
  field: { marginTop: space.xs },

  terms: { marginTop: space.sm, gap: space.md, alignItems: 'flex-start' },
  termsBar: { width: 2, alignSelf: 'stretch', backgroundColor: color.borderSoft },
  termsText: { flex: 1 },
});
