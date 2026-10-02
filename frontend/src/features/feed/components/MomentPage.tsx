/**
 * Một khoảnh khắc = một trang trong màn chính. Dùng CHUNG khung với camera nên
 * lướt từ camera xuống thì khung đứng yên, chỉ có ảnh trong nó đổi.
 *
 * Caption nằm TRONG ảnh, đúng chỗ người gửi đã gõ nó.
 *
 * Hàng đáp lại nằm ngay dưới ảnh: "ký ức" của Nook tính bằng tương tác HAI
 * CHIỀU, đáp lại tốn ba nhịp là phần lớn người ta không đáp. Bấm cảm xúc là
 * gửi RIÊNG cho người đó, không đếm số, không ai khác thấy.
 */
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Avatar, Img, Tap, Txt } from '@ui';
import {
  duration,
  media,
  radius,
  space,
  spring,
  useColors,
  useStyles,
  type Palette,
} from '@design';
import * as feel from '@/lib/haptics';
import * as sound from '@/lib/sound';
import type { Moment } from '../types';
import { splitCaption } from '../lib/tags';

/** Ba cảm xúc, không hơn. Gửi đi dưới dạng emoji trong cuộc trò chuyện. */
export const REACTIONS = [
  { key: 'heart', emoji: '❤️', icon: 'heart' },
  { key: 'laugh', emoji: '😂', icon: 'happy' },
  { key: 'fire', emoji: '🔥', icon: 'flame' },
] as const;
export type Reaction = (typeof REACTIONS)[number];

export const REPLY_HEIGHT = 54;

/** Id của chính mình trong dữ liệu khoảnh khắc. Đổi thành id thật khi có hồ sơ từ server. */
const ME_ID = 'me';

export const MomentPage = memo(function MomentPage({
  moment,
  frame,
  ago,
  replyHint,
  yoursLabel,
  reactionLabels,
  mentionedLabel,
  onReply,
  onOpenPerson,
}: {
  moment: Moment;
  /** `top`: khoảng từ đỉnh trang tới khung — màn chính tính, mọi trang dùng chung. */
  frame: { w: number; h: number; top: number };
  ago: string;
  replyHint: string;
  yoursLabel: string;
  reactionLabels: Record<Reaction['key'], string>;
  /** Chữ trên nhãn khi chính mình được tag, ví dụ "Nhắc tới bạn". */
  mentionedLabel: string;
  /** `null` = mở ô nhắn chữ. */
  onReply: (moment: Moment, reaction: Reaction | null) => void;
  /** Chạm vào một tên được tag → trang cá nhân người đó. */
  onOpenPerson: (id: string) => void;
}) {
  const s = useStyles(make);
  const c = useColors();

  return (
    <View style={[s.root, { paddingTop: frame.top }]}>
      <View style={[s.frame, { width: frame.w, height: frame.h }]}>
        <Img source={moment.photo} recyclingKey={moment.id} style={media.fill} shimmer />
        <LinearGradient colors={[c.scrim, 'transparent']} style={s.topShade} pointerEvents="none" />

        <View style={s.author}>
          <Avatar
            name={moment.author.name}
            level={moment.author.level}
            dormant={moment.author.dormant}
            size={36}
            recyclingKey={moment.author.id}
          />
          <Txt variant="label" tone="onPhoto">
            {moment.mine ? yoursLabel : moment.author.name}
          </Txt>
          <Txt variant="faint" tone="onPhoto" style={s.dim}>
            {ago}
          </Txt>
        </View>

        {moment.tags?.some((tg) => tg.id === ME_ID) ? (
          <View style={s.mentioned} pointerEvents="none">
            <Txt variant="faint" tone="onAccent">
              {mentionedLabel}
            </Txt>
          </View>
        ) : null}

        {moment.caption ? (
          <View style={s.captionSlot} pointerEvents="box-none">
            <View style={s.caption}>
              <Txt variant="label" tone="onPhoto" center numberOfLines={2}>
                {splitCaption(moment.caption, moment.tags).map((part, i) =>
                  part.tag ? (
                    <Txt
                      key={i}
                      variant="label"
                      tone="onPhoto"
                      style={s.tag}
                      onPress={() => onOpenPerson(part.tag!.id)}
                      accessibilityRole="link"
                    >
                      {part.text}
                    </Txt>
                  ) : (
                    part.text
                  ),
                )}
              </Txt>
            </View>
          </View>
        ) : null}
      </View>

      {moment.mine ? null : (
        <View style={s.reply}>
          <Tap
            onPress={() => onReply(moment, null)}
            scaleTo={0.99}
            style={s.replyField}
            accessibilityLabel={replyHint}
          >
            <Txt variant="body" tone="faint" numberOfLines={1}>
              {replyHint}
            </Txt>
          </Tap>
          {REACTIONS.map((r) => (
            <ReactButton
              key={r.key}
              reaction={r}
              label={reactionLabels[r.key]}
              color={r.key === 'heart' ? c.accent2 : r.key === 'laugh' ? c.honey : c.accent}
              onPress={() => onReply(moment, r)}
            />
          ))}
        </View>
      )}
    </View>
  );
});

/** Chạm: icon nở 1,25 rồi về, một bản sao bay lên và tan. Gửi ngay, không mở màn nào. */
function ReactButton({
  reaction,
  label,
  color,
  onPress,
}: {
  reaction: Reaction;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const s = useStyles(make);
  const pop = useSharedValue(1);
  const fly = useSharedValue(0);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const ghostStyle = useAnimatedStyle(() => ({
    opacity: fly.value === 0 ? 0 : 1 - fly.value,
    transform: [{ translateY: -fly.value * 56 }, { scale: 1 + fly.value * 0.6 }],
  }));

  const press = useCallback(() => {
    feel.confirm();
    sound.reacted();
    pop.set(withSequence(withSpring(1.25, spring.press), withSpring(1, spring.enter)));
    fly.set(0);
    fly.set(withTiming(1, { duration: duration.scene }));
    onPress();
  }, [fly, onPress, pop]);

  return (
    <Tap onPress={press} feedback={null} scaleTo={1} style={s.react} accessibilityLabel={label}>
      <Animated.View pointerEvents="none" style={[s.ghost, ghostStyle]}>
        <Ionicons name={reaction.icon} size={22} color={color} />
      </Animated.View>
      <Animated.View style={iconStyle}>
        <Ionicons name={reaction.icon} size={23} color={color} />
      </Animated.View>
    </Tap>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, alignItems: 'center' },
    frame: {
      borderRadius: radius.viewfinder,
      backgroundColor: c.surfaceRaised,
      overflow: 'hidden',
    },
    topShade: { position: 'absolute', left: 0, right: 0, top: 0, height: 96 },
    author: {
      position: 'absolute',
      top: space.lg,
      left: space.lg,
      right: space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm + 2,
    },
    captionSlot: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: space.lg + 2,
      alignItems: 'center',
    },
    caption: {
      maxWidth: '86%',
      minHeight: 40,
      justifyContent: 'center',
      backgroundColor: c.onPhoto,
      borderRadius: radius.lg,
      paddingHorizontal: space.lg,
      paddingVertical: space.sm,
    },

    reply: {
      marginTop: space.md + 2,
      alignSelf: 'stretch',
      marginHorizontal: space.lg,
      height: REPLY_HEIGHT,
      borderRadius: radius.full,
      backgroundColor: c.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: space.xl,
      paddingRight: space.xs + 2,
    },
    replyField: { flex: 1, height: '100%', justifyContent: 'center' },
    react: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
    ghost: { position: 'absolute' },
    dim: { opacity: 0.75 },
    tag: { textDecorationLine: 'underline' },
    mentioned: {
      position: 'absolute',
      top: space.lg + 44,
      left: space.lg,
      borderRadius: radius.full,
      backgroundColor: c.accent,
      paddingHorizontal: space.md,
      paddingVertical: space.xs,
    },
  });
