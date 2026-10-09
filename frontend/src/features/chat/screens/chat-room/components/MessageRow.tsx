/**
 * Một dòng trong phòng chat — kiểu Telegram (09/10/2026):
 *
 *   · bong bóng có ĐUÔI ở tin cuối của mỗi cụm (cùng người, cách nhau < 3 phút),
 *     các tin giữa cụm khít nhau, không đuôi;
 *   · giờ + dấu gửi (đồng hồ → ✓ → ✓✓) nằm TRONG bong bóng, góc dưới phải;
 *   · trích tin khác (giữ lâu → Trả lời) hiện thanh màu nhấn ở đầu bong bóng;
 *   · tin chỉ 1–3 emoji vẽ TO không bong bóng; sticker vẽ to, giờ nằm trên viên mờ.
 *
 * Giữ lâu một tin = trả lời tin đó. Tin hỏng có chấm đỏ, chạm để gửi lại.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Icon, Img, Tap, Txt } from '@ui';
import { duration, font, radius, space, useColors, useStyles, type Palette } from '@design';
import * as feel from '@/lib/device/haptics';
import { Sticker } from '../../../components/Sticker';
import type { About, Message } from '../../../types';
import { bigEmojiCount } from '../../../utils/emojiSet';

export type Row =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'about'; key: string; about: About; label: string; mine: boolean }
  | { kind: 'msg'; key: string; m: Message; tail: boolean; first: boolean };

export const MessageRow = memo(function MessageRow({
  row,
  onLongPress,
  onRetry,
  quoteName,
  darkWall,
}: {
  row: Row;
  onLongPress: (m: Message) => void;
  onRetry: (m: Message) => void;
  /** Tên người được trích ("Bạn" hoặc tên bạn kia). */
  quoteName: (mine: boolean) => string;
  /** Nền tối — chữ ngày phải sáng. */
  darkWall: boolean;
}) {
  const s = useStyles(make);
  if (row.kind === 'day') {
    return (
      <View style={s.dayRow}>
        <View style={[s.dayPill, darkWall && s.dayPillDark]}>
          <Txt variant="faint" tone={darkWall ? 'onPhoto' : 'muted'} style={s.dayText}>
            {row.label}
          </Txt>
        </View>
      </View>
    );
  }
  if (row.kind === 'about') {
    return (
      <View style={[s.aboutRow, row.mine && s.aboutMine]}>
        <Img source={row.about.photo} recyclingKey={row.key} style={s.about} shimmer />
        <Txt variant="faint" tone={darkWall ? 'onPhoto' : 'muted'} numberOfLines={1} style={s.aboutLabel}>
          {row.label}
        </Txt>
      </View>
    );
  }
  return (
    <MessageBubble
      m={row.m}
      tail={row.tail}
      first={row.first}
      onLongPress={onLongPress}
      onRetry={onRetry}
      quoteName={quoteName}
    />
  );
});

const MessageBubble = memo(function MessageBubble({
  m,
  tail,
  first,
  onLongPress,
  onRetry,
  quoteName,
}: {
  m: Message;
  tail: boolean;
  first: boolean;
  onLongPress: (m: Message) => void;
  onRetry: (m: Message) => void;
  quoteName: (mine: boolean) => string;
}) {
  const s = useStyles(make);
  const c = useColors();
  const time = clock(m.at);
  const big = m.kind === 'text' ? bigEmojiCount(m.text) : 0;
  const bare = m.kind === 'sticker' || big > 0;

  const press = () => {
    if (m.status === 'failed') onRetry(m);
  };
  const longPress = () => {
    feel.select();
    onLongPress(m);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(duration.fast)}
      style={[s.row, m.mine ? s.end : s.start, first && s.firstOfGroup]}
    >
      <Tap
        onPress={press}
        onLongPress={longPress}
        delayLongPress={280}
        scaleTo={0.97}
        feedback={null}
        style={bare ? s.bare : [s.bubble, m.mine ? s.mine : s.theirs, tail && (m.mine ? s.mineTail : s.theirsTail)]}
        accessibilityLabel={m.text || m.sticker || time}
      >
        {m.quote && !bare ? (
          <View style={[s.quote, m.mine && s.quoteMine]}>
            <Txt variant="faint" tone={m.mine ? 'onAccent' : 'accent'} style={s.quoteName} numberOfLines={1}>
              {quoteName(m.quote.mine)}
            </Txt>
            <Txt variant="faint" tone={m.mine ? 'onAccent' : 'muted'} numberOfLines={1}>
              {m.quote.text}
            </Txt>
          </View>
        ) : null}

        {m.kind === 'sticker' && m.sticker ? (
          <Sticker id={m.sticker} size={136} />
        ) : big > 0 ? (
          <Txt style={big === 1 ? s.emoji1 : s.emojiN}>{m.text}</Txt>
        ) : m.kind === 'image' && m.image ? (
          <Img source={m.image} style={s.image} shimmer />
        ) : (
          <Txt variant="body" tone={m.mine ? 'onAccent' : 'default'} style={s.text}>
            {m.text}
            {/* Chừa chỗ cho giờ ở cuối dòng chót — như Telegram, giờ không đè chữ. */}
            <Txt variant="faint" style={s.spacer}>
              {m.mine ? `${time}     ` : `${time}  `}
            </Txt>
          </Txt>
        )}

        <View style={[s.meta, bare && s.metaBare]}>
          <Txt
            variant="faint"
            tone={bare ? 'onPhoto' : m.mine ? 'onAccent' : 'muted'}
            style={[s.time, !bare && m.mine && s.timeMine]}
          >
            {time}
          </Txt>
          {m.mine ? <Ticks status={m.status} color={bare ? c.onPhotoText : c.onAccent} danger={c.danger} /> : null}
        </View>
      </Tap>

      {tail && !bare ? <Tail mine={m.mine} color={m.mine ? c.accent : c.glass} /> : null}
    </Animated.View>
  );
});

/** Đồng hồ (đang gửi) · ✓ (đã lưu) · ✓✓ (đã đọc) · ! (hỏng, chạm gửi lại). */
function Ticks({
  status,
  color,
  danger,
}: {
  status: Message['status'];
  color: string;
  danger: string;
}) {
  if (status === 'failed') return <Icon name="clear" size={12} color={danger} />;
  if (status === 'sending') return <Icon name="timer" size={11} color={color} weight="line" />;
  return <Icon name={status === 'read' ? 'checks' : 'check'} size={13} color={color} weight="line" />;
}

/** Đuôi bong bóng — cong ra ngoài ở góc dưới, như Telegram. */
function Tail({ mine, color }: { mine: boolean; color: string }) {
  const s = useStyles(make);
  return (
    <Svg width={10} height={16} style={[s.tail, mine ? s.tailMine : s.tailTheirs]}>
      <Path
        d={mine ? 'M0 0 C0 9 3 14 10 16 C4 16 0 15 0 15 Z' : 'M10 0 C10 9 7 14 0 16 C6 16 10 15 10 15 Z'}
        fill={color}
      />
    </Svg>
  );
}

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
function clock(at: number): string {
  const d = new Date(at);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const make = (c: Palette) =>
  StyleSheet.create({
    row: { paddingHorizontal: space.md, paddingVertical: 1.5, flexDirection: 'row' },
    firstOfGroup: { marginTop: space.sm },
    start: { justifyContent: 'flex-start' },
    end: { justifyContent: 'flex-end' },

    bubble: {
      maxWidth: '80%',
      minWidth: 72,
      paddingHorizontal: space.md,
      paddingTop: space.sm - 1,
      paddingBottom: space.sm - 1,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
    },
    mine: { backgroundColor: c.accent },
    theirs: { backgroundColor: c.glass },
    mineTail: { borderBottomRightRadius: 4 },
    theirsTail: { borderBottomLeftRadius: 4 },
    bare: { maxWidth: '80%', alignItems: 'flex-end' },

    text: { fontFamily: font.bodyMedium },
    spacer: { opacity: 0, fontSize: 11 },
    emoji1: { fontSize: 64, lineHeight: 76 },
    emojiN: { fontSize: 44, lineHeight: 56 },
    image: { width: 220, height: 220, borderRadius: radius.md },

    meta: {
      position: 'absolute',
      right: space.md - 2,
      bottom: space.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    metaBare: {
      position: 'relative',
      right: 0,
      bottom: 0,
      marginTop: 2,
      paddingHorizontal: space.sm,
      paddingVertical: 1,
      borderRadius: radius.full,
      backgroundColor: c.onPhoto,
    },
    time: { fontSize: 11, lineHeight: 14 },
    timeMine: { opacity: 0.85 },

    quote: {
      borderLeftWidth: 3,
      borderLeftColor: c.accent,
      paddingLeft: space.sm,
      marginBottom: space.xs,
      borderRadius: 2,
    },
    quoteMine: { borderLeftColor: c.onAccent },
    quoteName: { fontFamily: font.bodyBold },

    tail: { position: 'absolute', bottom: 1.5 },
    tailMine: { right: space.md - 7 },
    tailTheirs: { left: space.md - 7 },

    dayRow: { alignItems: 'center', paddingVertical: space.sm },
    dayPill: {
      paddingHorizontal: space.md,
      paddingVertical: 3,
      borderRadius: radius.full,
      backgroundColor: c.glass,
    },
    dayPillDark: { backgroundColor: c.onPhoto },
    dayText: { fontFamily: font.bodyBold, fontSize: 12 },

    aboutRow: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.xs, alignItems: 'flex-start' },
    aboutMine: { alignItems: 'flex-end' },
    about: { width: 140, height: 140, borderRadius: radius.lg },
    aboutLabel: { maxWidth: 220 },
  });
