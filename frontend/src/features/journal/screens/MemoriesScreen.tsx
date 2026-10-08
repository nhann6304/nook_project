/**
 * Ký ức — ảnh của RIÊNG mình, theo tháng (08/10/2026, theo Locket "Memories").
 *
 * Thay dải 7 ngày dưới nút chụp và bản lịch năm/tháng nhỏ xíu cũ. Mỗi tháng
 * là một thẻ KÍNH nổi trên nền trời; lưới 7 cột, ngày có ảnh hiện tấm mới
 * nhất bo góc (to, ~42pt), ngày trống là một chấm nhỏ. Giữa hai tháng có nét
 * đứt uốn lượn nối xuống. Mở ra là đã cuộn sẵn tới tháng này (dưới cùng).
 * Chạm một ngày → xem to, lướt ngang nếu ngày đó có nhiều tấm.
 */
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import {
  Avatar,
  EmptyState,
  Glass,
  Icon,
  IconButton,
  Img,
  Screen,
  Scroll,
  SkyWash,
  type ScrollHandle,
  TabBarSpacer,
  Tap,
  Txt,
} from '@ui';
import { duration, font, layout, radius, space, useColors, useStyles, type Palette } from '@design';
import { useDate, useT } from '@i18n';
import { afterToday, dayKey, type Entry } from '../types';

const COLS = 7;
const GAP = 6;
const CARD_PAD = space.md;
/** Không lùi quá bấy nhiêu tháng — đủ hai năm, khỏi dựng cả nghìn ô. */
const MAX_MONTHS = 24;

type Month = { key: string; year: number; month: number; count: number };

export function MemoriesScreen({
  entries,
  myName,
  myPhoto,
  onOpenMe,
}: {
  entries: readonly Entry[];
  myName: string;
  myPhoto?: string;
  onOpenMe: () => void;
}) {
  const s = useStyles(make);
  const t = useT();
  const { width } = useWindowDimensions();
  const scroll = useRef<ScrollHandle>(null);
  const settled = useRef(false);
  const [open, setOpen] = useState<readonly Entry[] | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of entries) {
      const k = dayKey(e.at);
      const list = map.get(k);
      if (list) list.push(e);
      else map.set(k, [e]);
    }
    return map;
  }, [entries]);

  const months = useMemo<Month[]>(() => {
    if (entries.length === 0) return [];
    const now = new Date();
    const first = new Date(Math.min(...entries.map((e) => e.at)));
    const list: Month[] = [];
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    while (list.length < MAX_MONTHS) {
      const y = d.getFullYear();
      const m = d.getMonth();
      const count = entries.filter((e) => {
        const x = new Date(e.at);
        return x.getFullYear() === y && x.getMonth() === m;
      }).length;
      list.unshift({ key: `${y}-${m}`, year: y, month: m, count });
      if (y === first.getFullYear() && m === first.getMonth()) break;
      d.setMonth(m - 1);
    }
    return list;
  }, [entries]);

  const cardW = width - space.lg * 2;
  const cell = Math.floor((cardW - CARD_PAD * 2 - GAP * (COLS - 1)) / COLS);

  // Mở ra là ở tháng này — cuộn xuống đáy MỘT lần, lúc nội dung đã có cỡ.
  const toEnd = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    scroll.current?.scrollToEnd({ animated: false });
  }, []);

  return (
    <View style={s.page}>
      <SkyWash />
      <Screen padded={false} clear edges={TOP}>
        <View style={s.bar}>
          <View style={s.side} />
          <Txt variant="section" style={s.title}>
            {t('memories.title')}
          </Txt>
          <View style={s.side}>
            <Avatar
              name={myName}
              uri={myPhoto}
              size={40}
              onPress={onOpenMe}
              label={t('home.openMe')}
            />
          </View>
        </View>

        {months.length === 0 ? (
          <EmptyState title={t('memories.title')} message={t('journal.empty')} />
        ) : (
          <Scroll ref={scroll} onContentSizeChange={toEnd}>
            {months.map((m, i) => (
              <View key={m.key}>
                {i > 0 ? <Connector /> : null}
                <MonthCard month={m} byDay={byDay} cell={cell} onOpenDay={setOpen} />
              </View>
            ))}
            <TabBarSpacer />
          </Scroll>
        )}
      </Screen>

      {open ? (
        <Viewer entries={open} closeLabel={t('journal.close')} onClose={() => setOpen(null)} />
      ) : null}
    </View>
  );
}

const TOP = ['top'] as const;

const MonthCard = memo(function MonthCard({
  month,
  byDay,
  cell,
  onOpenDay,
}: {
  month: Month;
  byDay: ReadonlyMap<string, readonly Entry[]>;
  cell: number;
  onOpenDay: (entries: readonly Entry[]) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const date = useDate();
  const title = date(new Date(month.year, month.month, 1), { month: 'long', year: 'numeric' });
  const days = new Date(month.year, month.month + 1, 0).getDate();
  // Tuần bắt đầu thứ Hai: getDay() 0 = Chủ nhật.
  const lead = (new Date(month.year, month.month, 1).getDay() + 6) % 7;
  const today = dayKey(new Date());

  return (
    <Glass style={s.card}>
      <View style={s.cardHead}>
        <Txt variant="section" style={s.monthTitle}>
          {title.charAt(0).toUpperCase() + title.slice(1)}
        </Txt>
        {month.count > 0 ? (
          <Txt variant="faint" tone="muted">
            {t('journal.monthCount', { count: month.count })}
          </Txt>
        ) : null}
      </View>
      <View style={s.grid}>
        {Array.from({ length: lead }, (_, i) => (
          <View key={`b${i}`} style={[s.blank, { width: cell, height: cell }]} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(month.year, month.month, i + 1);
          const k = dayKey(d);
          const list = byDay.get(k);
          const top = list?.[0];
          const isToday = k === today;
          if (top && list) {
            return (
              <Tap
                key={k}
                onPress={() => onOpenDay(list)}
                scaleTo={0.92}
                accessibilityLabel={t('journal.photoOf', { day: i + 1 })}
                style={[s.dayPhoto, { width: cell, height: cell }, isToday && s.today]}
              >
                <Img source={top.photo} recyclingKey={top.id} style={s.fill} />
              </Tap>
            );
          }
          const future = afterToday(d);
          return (
            <View key={k} style={[s.dayEmpty, { width: cell, height: cell }]}>
              {future ? null : <View style={[s.dot, isToday && { backgroundColor: c.accent }]} />}
            </View>
          );
        })}
      </View>
    </Glass>
  );
});

/** Nét đứt uốn lượn nối hai tháng — như sợi chỉ xâu các tháng lại. */
function Connector() {
  const s = useStyles(make);
  const c = useColors();
  return (
    <View style={s.connector}>
      <Svg width={24} height={36}>
        <Path
          d="M12 2 C 2 12, 22 22, 12 34"
          stroke={c.textFaint}
          strokeWidth={2}
          strokeDasharray="4 5"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

function Viewer({
  entries,
  closeLabel,
  onClose,
}: {
  entries: readonly Entry[];
  closeLabel: string;
  onClose: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const date = useDate();
  const { width } = useWindowDimensions();
  const w = width - layout.frameInset * 2;
  const h = Math.round(w / layout.cameraFrameRatio);

  return (
    <Animated.View
      entering={FadeIn.duration(duration.base)}
      exiting={FadeOut.duration(duration.fast)}
      style={s.viewer}
    >
      <Tap
        onPress={onClose}
        feedback={null}
        scaleTo={1}
        style={StyleSheet.absoluteFill}
        accessibilityLabel={closeLabel}
      >
        <View style={s.backdrop} />
      </Tap>
      <Scroll horizontal pagingEnabled style={[s.pager, { width: w }]}>
        {entries.map((e) => (
          <View key={e.id} style={[s.page2, { width: w, height: h }]}>
            <Img
              source={e.photo}
              recyclingKey={e.id}
              style={[s.big, { width: w, height: h }]}
              shimmer
            />
            <View style={s.bigMeta} pointerEvents="none">
              <View style={s.bigPill}>
                <Txt variant="faint" tone="onPhoto">
                  {date(new Date(e.at), { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                </Txt>
              </View>
            </View>
            {e.caption ? (
              <View style={s.bigCaption} pointerEvents="none">
                <View style={s.bigPill}>
                  <Txt variant="label" tone="onPhoto" center>
                    {e.caption}
                  </Txt>
                </View>
              </View>
            ) : null}
          </View>
        ))}
      </Scroll>
      <Glass radius={radius.full} style={s.closeBig}>
        <IconButton label={closeLabel} onPress={onClose}>
          <Icon name="close" size={22} color={c.text} />
        </IconButton>
      </Glass>
    </Animated.View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    fill: { width: '100%', height: '100%' },
    bar: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: space.lg,
    },
    side: { width: 44, alignItems: 'flex-end' },
    title: { flex: 1, textAlign: 'center', fontFamily: font.heavy, fontSize: 20 },

    card: { marginHorizontal: space.lg, padding: CARD_PAD, gap: space.md },
    cardHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    monthTitle: { fontFamily: font.heavy },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
    dayPhoto: {
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      overflow: 'hidden',
      backgroundColor: c.surfaceRaised,
    },
    today: { borderWidth: 2, borderColor: c.accent },
    dayEmpty: { alignItems: 'center', justifyContent: 'center' },
    blank: {},
    dot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: c.textDisabled },
    connector: { alignItems: 'center', paddingVertical: space.xs },

    viewer: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    backdrop: { flex: 1, backgroundColor: c.bg, opacity: 0.94 },
    pager: { flexGrow: 0 },
    page2: { overflow: 'hidden' },
    big: { borderRadius: radius.viewfinder, borderCurve: 'continuous' },
    bigMeta: { position: 'absolute', top: space.lg, left: space.lg },
    bigCaption: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: space.lg + 2,
      alignItems: 'center',
    },
    bigPill: {
      backgroundColor: c.onPhoto,
      borderRadius: radius.full,
      paddingHorizontal: space.md + 2,
      paddingVertical: space.xs + 2,
      maxWidth: '86%',
    },
    closeBig: {
      position: 'absolute',
      bottom: space.huge,
      width: 52,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
