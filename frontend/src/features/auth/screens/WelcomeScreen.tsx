/**
 * Màn 1 — Chào mừng. Màn đầu tiên người lạ nhìn thấy.
 *
 * Bố cục theo đúng thứ tự mắt đi: hình → một câu → hai nút.
 *
 * Hình KHÔNG phải logo. Locket mở màn bằng chính cái app làm ra — một chồng
 * ảnh — chứ không phải bằng dấu hiệu thương hiệu, và đó là ý đáng lấy: người
 * lạ cần thấy MÌNH SẼ ĐƯỢC GÌ trước khi cần biết app tên gì.
 * Chữ "nook" nhỏ, nằm trên cùng, không tranh chỗ với chồng ảnh.
 *
 * Ba khung ảnh xoè ra bằng Reanimated, chạy một lượt lúc vào màn rồi đứng yên.
 * Không lặp: hiệu ứng lặp ở màn chờ làm người ta sốt ruột.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { Button, Col, Flex, GhostFrame, Halo, Row, Screen, Txt, Wordmark } from '@ui';
import { color, layout, radius, space, spring } from '@design';
import { useT } from '@i18n';
import { useReduceMotion } from '@/hooks/useReduceMotion';

export function WelcomeScreen({
  onCreate,
  onSignIn,
}: {
  onCreate: () => void;
  onSignIn: () => void;
}) {
  const t = useT();

  return (
    <Screen>
      {/* Chỉ wordmark, KHÔNG kèm dấu hiệu hai vòng: hai chữ "o" trong "nook"
          đã chính là hai vòng đó rồi (xem Wordmark). Đặt cạnh nhau là nói cùng
          một câu hai lần. */}
      <Row justify="center" style={s.top}>
        <Wordmark size={30} />
      </Row>

      <Flex />

      <View style={s.stage}>
        <Halo size={280} breathe>
          <PhotoFan label={t('welcome.firstMoment')} />
        </Halo>
      </View>

      <Col gap="sm" style={s.words}>
        <Txt variant="display" center style={s.headline}>
          {t('welcome.headline')}
        </Txt>
        <Txt variant="body" tone="muted" center>
          {t('welcome.sub')}
        </Txt>
      </Col>

      <Flex />

      <Col gap="md" style={s.actions}>
        <Button label={t('welcome.create')} onPress={onCreate} block />
        <Button label={t('welcome.signIn')} variant="ghost" onPress={onSignIn} block />
      </Col>
    </Screen>
  );
}

/* ---------- Chồng ba khung ảnh ---------- */

/**
 * Ba khung đứt nét xoè ra như một xấp ảnh vừa được đặt xuống bàn.
 * Khung ĐỨT NÉT chứ không phải ảnh thật: chưa có tài khoản thì chưa có ảnh nào
 * cả, và vẽ ảnh mẫu ở đây là hứa một thứ chưa tồn tại.
 */
function PhotoFan({ label }: { label: string }) {
  const reduced = useReduceMotion();
  // Tên biến là `spread` chứ không phải `t`: `t` giờ là hàm dịch, dùng lại tên
  // đó ở đây là che mất nó trong cả file.
  const spread = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      spread.value = 1;
      return;
    }
    spread.value = withDelay(120, withSpring(1, spring.enter));
  }, [reduced, spread]);

  return (
    <View style={s.fan}>
      <Card t={spread} index={-1} />
      <Card t={spread} index={1} />
      <Card t={spread} index={0} label={label} />
    </View>
  );
}

/** Một khung trong chồng. index: -1 trái, 0 giữa (trên cùng), 1 phải. */
function Card({ t, index, label }: { t: SharedValue<number>; index: number; label?: string }) {
  const anim = useAnimatedStyle(() => {
    const spread = t.value;
    return {
      transform: [
        { translateX: index * 44 * spread },
        { translateY: Math.abs(index) * 10 * spread },
        { rotate: `${index * 9 * spread}deg` },
        { scale: 0.9 + 0.1 * spread },
      ],
      opacity: index === 0 ? 1 : 0.35 + 0.25 * spread,
    };
  });

  return (
    <Animated.View style={[s.card, anim]}>
      <GhostFrame size={148}>
        {label ? (
          <Txt variant="faint" tone="faint" center>
            {label}
          </Txt>
        ) : null}
      </GhostFrame>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  top: { gap: space.sm, paddingTop: space.md },

  stage: { alignItems: 'center', justifyContent: 'center' },
  fan: { width: 240, height: 190, alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute',
    borderRadius: radius.frame,
    backgroundColor: color.surfaceSunken,
  },

  words: { marginTop: space.xxl, maxWidth: layout.maxTextWidth, alignSelf: 'center' },
  headline: { letterSpacing: -0.4 },

  actions: { paddingBottom: space.lg },
});
