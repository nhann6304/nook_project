/**
 * Nhật ký — ảnh mình đã gửi, xếp theo NĂM rồi THÁNG.
 *
 * Bản đầu xếp mọi tháng thành một cột dài: dùng một năm là phải kéo qua 12
 * lịch mới tới được tháng cần tìm. Giờ có hai tầng:
 *   · Năm  — 12 ô tháng, mỗi ô lấy tấm mới nhất của tháng làm bìa. Một cái
 *            nhìn là thấy cả năm mình đã sống thế nào. ‹ › đổi năm.
 *   · Tháng — lịch của đúng một tháng; hàng T1…T12 để nhảy thẳng, ‹ › để đi
 *            tháng liền kề.
 * Chạm một ngày có ảnh → tấm ảnh nở ra xem to.
 */
import { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeOut, ZoomIn } from 'react-native-reanimated';
import { EmptyState, IconButton, Img, Screen, Scroll, Tap, Txt } from '@ui';
import {
  duration,
  layout,
  radius,
  space,
  spring,
  useColors,
  useStyles,
  type Palette,
} from '@design';
import { useDate, useLocale, useT } from '@i18n';
import { dayKey, type Entry } from '../types';

const COLS = 7;
const GAP = 4;
const PAD = space.lg;
const MONTHS = Array.from({ length: 12 }, (_, i) => i);

type Cell = {
  key: string;
  day: number;
  entries: readonly Entry[];
  today: boolean;
  future: boolean;
} | null;

function push(map: Map<string, Entry[]>, key: string, e: Entry) {
  const list = map.get(key);
  if (list) list.push(e);
  else map.set(key, [e]);
}

/** Gom ảnh theo năm → tháng → ngày, một lần cho cả màn. */
function useIndex(entries: readonly Entry[]) {
  return useMemo(() => {
    const byDay = new Map<string, Entry[]>();
    const byMonth = new Map<string, Entry[]>();
    const years = new Set<number>([new Date().getFullYear()]);
    for (const e of entries) {
      const d = new Date(e.at);
      years.add(d.getFullYear());
      const dk = dayKey(d);
      const mk = `${d.getFullYear()}-${d.getMonth()}`;
      push(byDay, dk, e);
      push(byMonth, mk, e);
    }
    return { byDay, byMonth, years: [...years].sort((a, b) => a - b) };
  }, [entries]);
}

export function JournalScreen({
  entries,
  onClose,
}: {
  entries: readonly Entry[];
  onClose: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const date = useDate();
  const locale = useLocale();
  const now = new Date();
  const { byDay, byMonth, years } = useIndex(entries);

  const [year, setYear] = useState(now.getFullYear());
  // Mở thẳng tháng hiện tại: đó là thứ người ta muốn xem nhiều nhất.
  const [month, setMonth] = useState<number | null>(now.getMonth());
  const [open, setOpen] = useState<readonly Entry[] | null>(null);

  const monthName = useCallback(
    (m: number) => {
      const n = date(new Date(year, m, 1), { month: 'long' });
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    [date, year],
  );
  const monthShort = useCallback(
    (m: number) => (locale === 'vi' ? `T${m + 1}` : date(new Date(year, m, 1), { month: 'short' })),
    [date, locale, year],
  );

  const yearStats = useMemo(() => {
    let photos = 0;
    let days = 0;
    for (const [k, list] of byDay) {
      if (k.startsWith(`${year}-`)) {
        photos += list.length;
        days += 1;
      }
    }
    return { photos, days };
  }, [byDay, year]);

  const yi = years.indexOf(year);
  const canPrevYear = yi > 0;
  const canNextYear = yi < years.length - 1;

  const stepMonth = (delta: number) => {
    if (month === null) return;
    const d = new Date(year, month + delta, 1);
    if (d > now) return;
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <Screen padded={false}>
      <View style={s.bar}>
        <IconButton label={t('journal.close')} onPress={onClose} style={s.round}>
          <Ionicons name="chevron-down" size={22} color={c.text} />
        </IconButton>
        <Txt variant="section" style={s.barTitle}>
          {t('journal.title')}
        </Txt>
        <View style={s.yearSwitch}>
          <IconButton
            label={t('journal.prevYear')}
            onPress={() => setYear(years[yi - 1] ?? year)}
            disabled={!canPrevYear}
            style={!canPrevYear && s.off}
          >
            <Ionicons name="chevron-back" size={18} color={c.text} />
          </IconButton>
          <Tap onPress={() => setMonth(null)} accessibilityLabel={t('journal.wholeYear', { year })}>
            <Txt variant="section">{year}</Txt>
          </Tap>
          <IconButton
            label={t('journal.nextYear')}
            onPress={() => setYear(years[yi + 1] ?? year)}
            disabled={!canNextYear}
            style={!canNextYear && s.off}
          >
            <Ionicons name="chevron-forward" size={18} color={c.text} />
          </IconButton>
        </View>
      </View>

      {entries.length === 0 ? (
        <EmptyState message={t('journal.empty')} />
      ) : month === null ? (
        <YearView
          key={`y-${year}`}
          year={year}
          byMonth={byMonth}
          stats={yearStats}
          monthName={monthName}
          onOpenMonth={setMonth}
        />
      ) : (
        <View style={s.fill}>
          {/* Hàng T1…T12: nhảy thẳng tới tháng cần tìm, không phải kéo. */}
          <Scroll horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            <Tap
              onPress={() => setMonth(null)}
              style={s.chip}
              accessibilityLabel={t('journal.wholeYear', { year })}
            >
              <Ionicons name="apps" size={14} color={c.text} />
            </Tap>
            {MONTHS.map((m) => {
              const has = byMonth.has(`${year}-${m}`);
              const future = new Date(year, m, 1) > now;
              const on = m === month;
              return (
                <Tap
                  key={m}
                  onPress={() => setMonth(m)}
                  disabled={future}
                  style={[s.chip, on && s.chipOn, future && s.off]}
                  accessibilityLabel={monthName(m)}
                  accessibilityState={{ selected: on }}
                >
                  <Txt variant="label" tone={on ? 'onAccent' : has ? 'default' : 'faint'}>
                    {monthShort(m)}
                  </Txt>
                  {has && !on ? <View style={s.chipDot} /> : null}
                </Tap>
              );
            })}
          </Scroll>

          <MonthView
            key={`m-${year}-${month}`}
            year={year}
            month={month}
            title={monthName(month)}
            byDay={byDay}
            count={byMonth.get(`${year}-${month}`)?.length ?? 0}
            canNext={new Date(year, month + 1, 1) <= now}
            onPrev={() => stepMonth(-1)}
            onNext={() => stepMonth(1)}
            onPick={setOpen}
          />
        </View>
      )}

      {open ? (
        <Viewer entries={open} closeLabel={t('journal.close')} onClose={() => setOpen(null)} />
      ) : null}
    </Screen>
  );
}

/* ─────────────── Năm: 12 ô tháng có bìa ─────────────── */

function YearView({
  year,
  byMonth,
  stats,
  monthName,
  onOpenMonth,
}: {
  year: number;
  byMonth: ReadonlyMap<string, readonly Entry[]>;
  stats: { photos: number; days: number };
  monthName: (m: number) => string;
  onOpenMonth: (m: number) => void;
}) {
  const s = useStyles(make);
  const t = useT();
  const { width } = useWindowDimensions();
  const tileW = Math.floor((Math.min(width, 560) - PAD * 2 - space.sm * 2) / 3);
  const now = new Date();

  return (
    <Scroll contentContainerStyle={s.yearContent}>
      <Animated.View entering={FadeInDown.springify().damping(spring.enter.damping)}>
        <Txt variant="display">{year}</Txt>
        <Txt variant="body" tone="muted">
          {t('journal.yearSummary', stats)}
        </Txt>
      </Animated.View>
      <View style={s.yearGrid}>
        {MONTHS.map((m) => {
          const list = byMonth.get(`${year}-${m}`) ?? [];
          return (
            <MonthTile
              key={m}
              index={m}
              name={monthName(m)}
              cover={list[0]}
              count={list.length}
              width={tileW}
              future={new Date(year, m, 1) > now}
              current={year === now.getFullYear() && m === now.getMonth()}
              onOpen={onOpenMonth}
            />
          );
        })}
      </View>
    </Scroll>
  );
}

const MonthTile = memo(function MonthTile({
  index,
  name,
  cover,
  count,
  width,
  future,
  current,
  onOpen,
}: {
  index: number;
  name: string;
  cover: Entry | undefined;
  count: number;
  width: number;
  future: boolean;
  current: boolean;
  onOpen: (m: number) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const size = { width, height: Math.round(width / layout.cameraFrameRatio) };

  return (
    <Animated.View entering={FadeIn.delay(duration.fast + index * 35)}>
      <Tap
        onPress={() => onOpen(index)}
        disabled={future}
        scaleTo={0.95}
        accessibilityLabel={t('journal.openMonth', { month: name })}
      >
        <View style={[s.tile, current && s.tileNow, future && s.off, size]}>
          {cover ? (
            <>
              <Img
                source={cover.photo}
                recyclingKey={`cover-${cover.id}`}
                style={StyleSheet.absoluteFill}
                shimmer
              />
              <LinearGradient
                colors={['transparent', c.scrim]}
                style={s.tileShade}
                pointerEvents="none"
              />
            </>
          ) : null}
          <View style={s.tileText}>
            <Txt variant="label" tone={cover ? 'onPhoto' : 'muted'} numberOfLines={1}>
              {name}
            </Txt>
            <Txt
              variant="faint"
              tone={cover ? 'onPhoto' : 'faint'}
              style={cover ? s.tileSub : null}
            >
              {count > 0 ? t('journal.monthCount', { count }) : t('journal.monthNone')}
            </Txt>
          </View>
        </View>
      </Tap>
    </Animated.View>
  );
});

/* ─────────────── Tháng: lịch một tháng ─────────────── */

function MonthView({
  year,
  month,
  title,
  byDay,
  count,
  canNext,
  onPrev,
  onNext,
  onPick,
}: {
  year: number;
  month: number;
  title: string;
  byDay: ReadonlyMap<string, readonly Entry[]>;
  count: number;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPick: (list: readonly Entry[]) => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const { width } = useWindowDimensions();
  const cellW = Math.floor(
    (Math.min(width, layout.maxTextWidth + PAD * 2) - PAD * 2 - GAP * (COLS - 1)) / COLS,
  );
  const weekdays = useMemo(() => t('journal.weekdays').split(','), [t]);

  const cells = useMemo(() => {
    const now = new Date();
    const todayKey = dayKey(now);
    const lead = (new Date(year, month, 1).getDay() + 6) % 7; // thứ Hai = 0
    const total = new Date(year, month + 1, 0).getDate();
    const out: Cell[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= total; d++) {
      const date = new Date(year, month, d);
      const k = dayKey(date);
      out.push({
        key: k,
        day: d,
        entries: byDay.get(k) ?? [],
        today: k === todayKey,
        future: date > now,
      });
    }
    return out;
  }, [byDay, month, year]);

  return (
    <Scroll contentContainerStyle={s.monthContent}>
      <Animated.View
        entering={FadeInDown.springify().damping(spring.enter.damping)}
        style={s.monthHead}
      >
        <View style={s.monthTitle}>
          <Txt variant="display">{title}</Txt>
          <Txt variant="body" tone="muted">
            {count > 0 ? t('journal.monthCount', { count }) : t('journal.monthEmpty')}
          </Txt>
        </View>
        <IconButton label={t('journal.prevMonth')} onPress={onPrev} style={s.round}>
          <Ionicons name="chevron-back" size={20} color={c.text} />
        </IconButton>
        <IconButton
          label={t('journal.nextMonth')}
          onPress={onNext}
          disabled={!canNext}
          style={[s.round, !canNext && s.off]}
        >
          <Ionicons name="chevron-forward" size={20} color={c.text} />
        </IconButton>
      </Animated.View>

      <View style={s.week}>
        {weekdays.map((w, i) => (
          <Txt
            key={`${w}-${i}`}
            variant="faint"
            tone="faint"
            center
            style={[s.wd, { width: cellW }]}
          >
            {w}
          </Txt>
        ))}
      </View>
      <Animated.View entering={FadeIn.duration(duration.base)} style={s.grid}>
        {cells.map((cell, i) =>
          cell ? (
            <DayCell
              key={cell.key}
              cell={cell}
              width={cellW}
              onPick={onPick}
              label={t('journal.photoOf', { day: cell.day })}
            />
          ) : (
            <View key={`pad-${i}`} style={[s.pad, { width: cellW }]} />
          ),
        )}
      </Animated.View>
    </Scroll>
  );
}

const DayCell = memo(function DayCell({
  cell,
  width,
  label,
  onPick,
}: {
  cell: NonNullable<Cell>;
  width: number;
  label: string;
  onPick: (list: readonly Entry[]) => void;
}) {
  const s = useStyles(make);
  const size = { width, height: Math.round(width / layout.cameraFrameRatio) };
  const first = cell.entries[0];

  if (!first) {
    return (
      <View
        style={[s.cell, s.cellEmpty, cell.today && s.cellToday, cell.future && s.cellFuture, size]}
      >
        <Txt variant="faint" tone={cell.today ? 'accent' : 'faint'}>
          {cell.day}
        </Txt>
      </View>
    );
  }
  return (
    <Tap onPress={() => onPick(cell.entries)} scaleTo={0.92} accessibilityLabel={label}>
      <View style={[s.cell, cell.today && s.cellToday, size]}>
        <Img source={first.photo} recyclingKey={first.id} style={StyleSheet.absoluteFill} shimmer />
        <View style={s.dayTag}>
          <Txt variant="faint" tone="onPhoto" style={s.dayText}>
            {cell.day}
          </Txt>
        </View>
        {cell.entries.length > 1 ? <View style={s.more} /> : null}
      </View>
    </Tap>
  );
});

/* ─────────────── Xem to ─────────────── */

/** Tấm ảnh nở ra giữa màn, vuốt ngang khi ngày đó có nhiều tấm. */
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
      <Animated.View entering={ZoomIn.springify().damping(spring.enter.damping)}>
        <Scroll
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={[s.pager, { width: w }]}
        >
          {entries.map((e) => (
            <View key={e.id} style={[s.page, { width: w, height: h }]}>
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
      </Animated.View>
      <IconButton label={closeLabel} onPress={onClose} style={s.closeBig}>
        <Ionicons name="close" size={22} color={c.text} />
      </IconButton>
    </Animated.View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    fill: { flex: 1 },
    off: { opacity: 0.35 },
    bar: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingHorizontal: space.lg,
    },
    round: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: c.surface },
    barTitle: { flex: 1 },
    yearSwitch: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.full,
      backgroundColor: c.surface,
      paddingHorizontal: space.xs,
    },

    /* Năm */
    yearContent: {
      paddingHorizontal: PAD,
      paddingTop: space.sm,
      paddingBottom: space.huge,
      gap: space.xl,
    },
    yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    tile: {
      borderRadius: radius.md,
      overflow: 'hidden',
      backgroundColor: c.surfaceSunken,
      borderWidth: 2,
      borderColor: 'transparent',
      justifyContent: 'flex-end',
    },
    tileNow: { borderColor: c.accent },
    tileShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
    tileText: { padding: space.sm + 2, gap: 1 },
    tileSub: { opacity: 0.8 },

    /* Tháng */
    chips: { paddingHorizontal: PAD, gap: space.sm, paddingVertical: space.xs },
    chip: {
      height: 36,
      minWidth: 44,
      paddingHorizontal: space.md,
      borderRadius: radius.full,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    chipOn: { backgroundColor: c.accent },
    chipDot: {
      position: 'absolute',
      top: 5,
      right: 7,
      width: 5,
      height: 5,
      borderRadius: radius.full,
      backgroundColor: c.accent,
    },
    monthContent: { paddingHorizontal: PAD, paddingBottom: space.huge, alignItems: 'center' },
    monthHead: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingTop: space.lg,
      paddingBottom: space.lg,
    },
    monthTitle: { flex: 1 },
    week: { flexDirection: 'row', gap: GAP, marginBottom: space.sm },
    wd: { fontSize: 11 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, width: '100%' },
    pad: { height: 1 },
    cell: {
      borderRadius: radius.xs + 2,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    cellEmpty: { backgroundColor: c.surfaceSunken, alignItems: 'center', justifyContent: 'center' },
    cellToday: { borderColor: c.accent },
    cellFuture: { opacity: 0.4 },
    dayTag: { position: 'absolute', left: 3, bottom: 2 },
    dayText: { fontSize: 10, lineHeight: 13 },
    more: {
      position: 'absolute',
      right: 4,
      top: 4,
      width: 6,
      height: 6,
      borderRadius: radius.full,
      backgroundColor: c.onPhotoText,
    },

    /* Xem to */
    pager: { flexGrow: 0 },
    page: { overflow: 'hidden' },
    viewer: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    backdrop: { flex: 1, backgroundColor: c.bg, opacity: 0.94 },
    big: { borderRadius: radius.viewfinder },
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
      borderRadius: radius.full,
      backgroundColor: c.surface,
    },
  });
