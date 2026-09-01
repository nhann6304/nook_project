/**
 * Màn 3 — Nhập mã.
 *
 * Không có nút "Xác nhận". Đủ sáu số là tự kiểm — người dùng gõ xong số cuối
 * rồi lại phải rướn tay xuống bấm một nút nữa là thừa một nhịp, và trên máy
 * màn to thì nút đó nằm ngoài tầm ngón cái.
 *
 * Sai mã thì XOÁ TRẮNG ô. Để lại số cũ thì họ phải xoá lùi sáu lần trước khi
 * gõ lại được — và tay đang bực.
 *
 * `onVerify` trả về Promise<boolean> chứ không phải void, và đó là chủ đích:
 * việc dọn ô xảy ra NGAY trong nhánh "sai", không phải trong một useEffect
 * rình biến `error`. Rình bằng effect thì hai lần sai liên tiếp với cùng một
 * câu lỗi sẽ không kích hoạt lại — ô không được dọn, người dùng gõ tiếp vào
 * sáu số cũ.
 */
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, CodeInput, Col, Flex, HelperText, Screen, Txt } from '@ui';
import { layout, space } from '@design';
import { useT } from '@i18n';
import { useCountdown } from '@/hooks/useCountdown';
import * as feel from '@/lib/haptics';
import { displayTarget, type SignInMethod } from '../lib/identity';

const RESEND_SECONDS = 60;
const CODE_LENGTH = 6;

export function VerifyCodeScreen({
  method,
  target,
  busy = false,
  error,
  onVerify,
  onResend,
  onChangeTarget,
}: {
  method: SignInMethod;
  target: string;
  busy?: boolean;
  error?: string | null;
  /** Trả `true` nếu mã đúng. Trả `false` là màn tự dọn ô cho gõ lại. */
  onVerify: (code: string) => Promise<boolean>;
  onResend: () => void;
  onChangeTarget: () => void;
}) {
  const t = useT();
  const [code, setCode] = useState('');
  const { left, running, start } = useCountdown(RESEND_SECONDS);

  useEffect(start, [start]);

  const change = useCallback(
    async (v: string) => {
      setCode(v);
      if (v.length < CODE_LENGTH) return;

      const ok = await onVerify(v);
      if (ok) return;

      // Sai mã: rung một nhịp từ chối rồi dọn ô cho người ta gõ lại ngay.
      feel.reject();
      setCode('');
    },
    [onVerify],
  );

  const resend = useCallback(() => {
    setCode('');
    start();
    onResend();
  }, [onResend, start]);

  return (
    <Screen keyboard>
      <Col gap="sm" style={s.head}>
        <Txt variant="title">{t('verify.title')}</Txt>
        <Txt variant="body" tone="muted">
          {t('verify.sub', { target: displayTarget(method, target) })}
        </Txt>
      </Col>

      <Col gap="sm" style={s.form}>
        <CodeInput
          value={code}
          onChange={(v) => void change(v)}
          length={CODE_LENGTH}
          invalid={Boolean(error)}
          editable={!busy}
          autoFocus
          label={t('verify.codeLabel', { count: CODE_LENGTH })}
        />
        <HelperText tone={error ? 'danger' : 'muted'}>
          {error ?? (busy ? t('verify.checking') : undefined)}
        </HelperText>

        <Button
          label={running ? t('verify.resendIn', { seconds: left }) : t('verify.resend')}
          variant="ghost"
          onPress={resend}
          disabled={running || busy}
          block
        />
        <Button
          label={method === 'email' ? t('verify.otherEmail') : t('verify.otherPhone')}
          variant="ghost"
          onPress={onChangeTarget}
          disabled={busy}
          block
        />
      </Col>

      <Flex />
    </Screen>
  );
}

const s = StyleSheet.create({
  head: { paddingTop: space.xxl, maxWidth: layout.maxTextWidth },
  form: { marginTop: space.xxxl, maxWidth: layout.maxTextWidth, width: '100%' },
});
