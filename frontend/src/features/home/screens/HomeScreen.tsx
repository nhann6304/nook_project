/**
 * Màn chính — camera ở trang 0, ảnh bạn bè xếp từng trang bên dưới, vuốt lên
 * là tới. Không thanh tab (bảng thiết kế bản 7): góc trái → bạn bè, góc phải
 * → tin nhắn, giữa là việc chính.
 *
 * Ba chuyển cảnh sống ở đây vì chúng phải vẽ ĐÈ lên mọi thứ, ngoài khung trang:
 *   · lướt trang: trang cũ lún xuống sau trang mới (xem `Pager`);
 *   · gửi ảnh: ảnh thu nhỏ bay về viên thuốc "N bạn" trên đầu;
 *   · mở từ lưới: "cửa sổ" nở từ đúng ô vừa chạm ra thành khung ảnh.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  AvatarStack,
  IconButton,
  Img,
  Pager,
  Screen,
  SkyWash,
  Tap,
  Toast,
  Txt,
  type PagerHandle,
} from '@ui';
import {
  duration,
  ease,
  layout,
  media,
  radius,
  space,
  useColors,
  useStyles,
  type Palette,
} from '@design';
import { useAgo, useT } from '@i18n';
import * as feel from '@/lib/haptics';
import {
  CameraPage,
  CONTROLS_HEIGHT,
  FOOTER_HEIGHT,
  type Shot,
} from '@/features/camera/components/CameraPage';
import { MomentPage, type Reaction } from '@/features/feed/components/MomentPage';
import { MomentGrid, type Rect } from '@/features/feed/components/MomentGrid';
import { Shutter } from '@/features/camera/components/Shutter';
import type { Moment } from '@/features/feed/types';
import { JournalStrip } from '@/features/journal/components/JournalStrip';
import type { Entry } from '@/features/journal/types';

const BAR = 52;
const FEED_BAR = 64;
const OUT = Easing.bezier(...ease.out);
const IN_OUT = Easing.bezier(...ease.inOut);

export function HomeScreen({
  friendNames,
  moments,
  unread,
  onSend,
  onReply,
  onOpenFriends,
  onOpenChats,
  onOpenMore,
  journal,
  onOpenJournal,
}: {
  friendNames: readonly string[];
  moments: readonly Moment[];
  unread: boolean;
  onSend: (shot: Shot) => void;
  /** `reaction` null = mở cuộc trò chuyện để nhắn chữ. */
  onReply: (moment: Moment, reaction: Reaction | null) => void;
  onOpenFriends: () => void;
  onOpenChats: () => void;
  onOpenMore: () => void;
  /** Ảnh mình đã gửi — cho dải 7 ngày dưới nút chụp. */
  journal: readonly Entry[];
  onOpenJournal: () => void;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const ago = useAgo();
  const { width } = useWindowDimensions();
  const count = friendNames.length;

  const root = useRef<View>(null);
  const pager = useRef<PagerHandle>(null);
  const scrollY = useSharedValue(0);
  const [area, setArea] = useState({ y: 0, h: 0 });
  const [rootAt, setRootAt] = useState({ x: 0, y: 0 });
  const [page, setPage] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  /* ── Khung ảnh: 3:4, chung cho camera và mọi khoảnh khắc ── */
  const frame = useMemo(() => {
    const maxW = width - layout.frameInset * 2;
    const maxH = area.h - layout.frameInset - CONTROLS_HEIGHT - FOOTER_HEIGHT;
    const h = Math.max(0, Math.min(maxW / layout.cameraFrameRatio, maxH));
    const w = Math.round(h * layout.cameraFrameRatio);
    return { w, h: Math.round(h), x: (width - w) / 2, y: area.y + layout.frameInset };
  }, [area, width]);

  const measure = useCallback((e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    setArea({ y, h: height });
    root.current?.measureInWindow((x, wy) => setRootAt({ x, y: wy }));
  }, []);

  const say = useCallback((text: string) => {
    setToast({ id: Date.now(), text });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ── Gửi: ảnh bay về viên thuốc trên đầu ── */
  const [flying, setFlying] = useState<string | null>(null);
  const fly = useSharedValue(0);
  const landed = useCallback(() => {
    setFlying(null);
    feel.success();
    say(count === 0 ? t('home.sentAlone') : t('home.sent', { count }));
  }, [count, say, t]);

  const send = useCallback(
    (shot: Shot) => {
      setFlying(shot.uri);
      fly.set(0);
      fly.set(
        withTiming(1, { duration: duration.scene + 80, easing: IN_OUT }, (done) => {
          if (done) runOnJS(landed)();
        }),
      );
      onSend(shot);
    },
    [fly, landed, onSend],
  );

  const flyStyle = useAnimatedStyle(() => {
    const dy = frame.y + frame.h / 2 - BAR / 2;
    return {
      opacity: interpolate(fly.value, [0, 0.7, 1], [1, 1, 0]),
      borderRadius: interpolate(fly.value, [0, 1], [radius.viewfinder, frame.w]),
      transform: [{ translateY: -fly.value * dy }, { scale: 1 - fly.value * 0.9 }],
    };
  });

  /* ── Mở từ lưới: cửa sổ nở từ ô vừa chạm ── */
  const [win, setWin] = useState<{ photo: Moment['photo']; from: Rect; index: number } | null>(
    null,
  );
  const open = useSharedValue(0);
  const winFade = useSharedValue(1);

  const opened = useCallback(
    (index: number) => {
      pager.current?.goTo(index + 1, false);
      setGridOpen(false);
      // Trang thật đã nằm đúng chỗ bên dưới; lớp cửa sổ chỉ còn việc tan đi.
      winFade.set(
        withTiming(0, { duration: duration.fast }, (done) => {
          if (done) runOnJS(setWin)(null);
        }),
      );
    },
    [winFade],
  );

  const openFromGrid = useCallback(
    (index: number, rect: Rect) => {
      const photo = moments[index]?.photo;
      if (photo === undefined) return;
      feel.tap();
      const from = { x: rect.x - rootAt.x, y: rect.y - rootAt.y, w: rect.w, h: rect.h };
      setWin({ photo, from, index });
      winFade.set(1);
      open.set(0);
      open.set(
        withTiming(1, { duration: duration.scene, easing: OUT }, (done) => {
          if (done) runOnJS(opened)(index);
        }),
      );
    },
    [moments, open, opened, rootAt, winFade],
  );

  const winStyle = useAnimatedStyle(() => {
    const f = win?.from ?? { x: 0, y: 0, w: 0, h: 0 };
    const k = open.value;
    return {
      opacity: winFade.value,
      left: f.x + (frame.x - f.x) * k,
      top: f.y + (frame.y - f.y) * k,
      width: f.w + (frame.w - f.w) * k,
      height: f.h + (frame.h - f.h) * k,
      borderRadius: radius.md + (radius.viewfinder - radius.md) * k,
    };
  });
  // Song cửa: hai nét chữ thập, tan dần khi cửa mở.
  const muntinStyle = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0, 0.45], [0.7, 0], Extrapolation.CLAMP),
  }));
  const gridBack = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - (win ? open.value : 0) * 0.06 }],
  }));
  const gridDim = useAnimatedStyle(() => ({ opacity: (win ? open.value : 0) * 0.55 }));

  /* ── Thanh trên + hàng dưới đổi theo vị trí lướt ── */
  const onCamera = page === 0;
  const camPill = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, area.h * 0.45], [1, 0], Extrapolation.CLAMP),
  }));
  const feedPill = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [area.h * 0.3, area.h * 0.8], [0, 1], Extrapolation.CLAMP),
  }));
  const feedBar = useAnimatedStyle(() => {
    const k = interpolate(scrollY.value, [area.h * 0.35, area.h], [0, 1], Extrapolation.CLAMP);
    return { opacity: k, transform: [{ translateY: (1 - k) * 24 }] };
  });

  const toCamera = useCallback(() => pager.current?.goTo(0), []);
  const toFeed = useCallback(() => pager.current?.goTo(1), []);

  // Nút quay lại của Android: lưới → đóng lưới; đang xem ảnh → về camera.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (gridOpen) {
        setGridOpen(false);
        return true;
      }
      if (page > 0) {
        toCamera();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [gridOpen, page, toCamera]);

  const react = useCallback(
    (m: Moment, r: Reaction | null) => {
      onReply(m, r);
      if (r) say(t('home.reacted', { name: m.author.name }));
    },
    [onReply, say, t],
  );

  const reactionLabels = useMemo(
    () => ({ heart: t('home.heart'), laugh: t('home.laugh'), fire: t('home.fire') }),
    [t],
  );

  const weekdays = useMemo(() => t('journal.weekdays').split(','), [t]);

  const renderPage = useCallback(
    (i: number) => {
      if (i === 0) {
        return (
          <CameraPage
            frame={frame}
            onReviewChange={setReviewing}
            onSend={send}
            onOpenFeed={toFeed}
            footer={
              <JournalStrip
                entries={journal}
                weekdays={weekdays}
                label={t('journal.open')}
                hint={t('home.swipeHint')}
                onOpen={onOpenJournal}
                onHint={toFeed}
              />
            }
          />
        );
      }
      const m = moments[i - 1];
      if (!m)
        return <EndPage frame={frame} title={t('home.endTitle')} message={t('home.endMessage')} />;
      return (
        <MomentPage
          moment={m}
          frame={frame}
          ago={ago(new Date(m.at))}
          replyHint={t('feed.replyTo', { name: m.author.name })}
          yoursLabel={t('home.yours')}
          reactionLabels={reactionLabels}
          onReply={react}
        />
      );
    },
    [ago, frame, journal, moments, onOpenJournal, react, reactionLabels, send, t, toFeed, weekdays],
  );

  return (
    <View style={s.page}>
      <SkyWash />
      <Screen padded={false} keyboard clear>
        <View ref={root} style={s.root} collapsable={false}>
          {/* 1 — Thanh trên */}
          <View style={s.bar}>
            <Animated.View
              style={reviewing ? s.hidden : null}
              pointerEvents={reviewing ? 'none' : 'auto'}
            >
              <IconButton label={t('home.openFriends')} onPress={onOpenFriends} style={s.round}>
                <Ionicons name="people-outline" size={20} color={c.text} />
              </IconButton>
            </Animated.View>

            {reviewing ? (
              <View style={s.center}>
                <Animated.View entering={FadeIn.duration(duration.base)} style={s.pill}>
                  <AvatarStack names={friendNames} />
                  <Txt variant="label">
                    {count === 0 ? t('review.sendToNobody') : t('home.sendToAll', { count })}
                  </Txt>
                </Animated.View>
              </View>
            ) : (
              // MỘT vùng bấm phủ cả hai viên thuốc. Hai viên chồng lên nhau chỉ là
              // hình (mờ qua lại theo vị trí lướt), không viên nào tự bắt chạm.
              <Tap
                onPress={onOpenFriends}
                scaleTo={0.96}
                style={s.center}
                accessibilityLabel={t('home.openFriends')}
              >
                <Animated.View style={[s.layer, camPill]} pointerEvents="none">
                  {count === 0 ? (
                    <View style={[s.pill, s.pillAccent]}>
                      <Ionicons name="add" size={18} color={c.onAccent} />
                      <Txt variant="label" tone="onAccent">
                        {t('home.inviteFirst')}
                      </Txt>
                    </View>
                  ) : (
                    <View style={s.pill}>
                      <AvatarStack names={friendNames} />
                      <Txt variant="label">{t('home.friendsPill', { count })}</Txt>
                    </View>
                  )}
                </Animated.View>
                <Animated.View style={[s.layer, feedPill]} pointerEvents="none">
                  <View style={s.pill}>
                    <Txt variant="label">{t('home.allFriends')}</Txt>
                    <Ionicons name="chevron-down" size={14} color={c.text} />
                  </View>
                </Animated.View>
              </Tap>
            )}

            <Animated.View
              style={reviewing ? s.hidden : null}
              pointerEvents={reviewing ? 'none' : 'auto'}
            >
              <IconButton label={t('home.openChats')} onPress={onOpenChats} style={s.round}>
                <Ionicons name="chatbubble-outline" size={19} color={c.text} />
                {unread ? <View style={s.dot} /> : null}
              </IconButton>
            </Animated.View>
          </View>

          {/* 2 — Các trang */}
          <View style={s.area} onLayout={measure}>
            {area.h > 0 ? (
              <Pager
                ref={pager}
                count={moments.length + 2}
                pageHeight={area.h}
                renderPage={renderPage}
                scrollY={scrollY}
                onIndexChange={setPage}
                scrollEnabled={!reviewing}
                keep={KEEP}
              />
            ) : null}

            {/* 3 — Hàng dưới khi đang xem ảnh bạn bè */}
            <Animated.View
              style={[s.feedBar, feedBar]}
              pointerEvents={onCamera ? 'none' : 'box-none'}
            >
              <IconButton label={t('home.grid')} onPress={() => setGridOpen(true)}>
                <Ionicons name="grid-outline" size={22} color={c.text} />
              </IconButton>
              <Shutter size={56} onPress={toCamera} label={t('home.backToCamera')} />
              <IconButton label={t('home.more')} onPress={onOpenMore}>
                <Ionicons name="ellipsis-horizontal" size={22} color={c.text} />
              </IconButton>
            </Animated.View>
          </View>

          {/* 4 — Lưới tất cả ảnh */}
          {gridOpen ? (
            <Animated.View
              entering={FadeIn.duration(duration.base)}
              exiting={FadeOut.duration(duration.fast)}
              style={s.overlay}
            >
              <Animated.View style={[s.fill, gridBack]}>
                <MomentGrid
                  moments={moments}
                  title={t('history.title')}
                  todayLabel={t('history.today')}
                  earlierLabel={t('history.earlier')}
                  backLabel={t('home.backToCamera')}
                  openLabel={(name) => t('history.open', { name })}
                  onOpen={openFromGrid}
                  onClose={() => setGridOpen(false)}
                />
              </Animated.View>
              <Animated.View pointerEvents="none" style={[s.dim, gridDim]} />
              <View style={s.gridShutter}>
                <Shutter
                  size={68}
                  onPress={() => {
                    setGridOpen(false);
                    toCamera();
                  }}
                  label={t('home.backToCamera')}
                />
              </View>
            </Animated.View>
          ) : null}

          {/* 5 — Cửa sổ đang mở */}
          {win ? (
            <Animated.View pointerEvents="none" style={[s.window, winStyle]}>
              <Img source={win.photo} style={media.fill} transition={0} />
              <Animated.View style={[s.muntinV, muntinStyle]} />
              <Animated.View style={[s.muntinH, muntinStyle]} />
            </Animated.View>
          ) : null}

          {/* 6 — Ảnh vừa gửi bay về góc */}
          {flying ? (
            <Animated.View
              pointerEvents="none"
              style={[
                s.fly,
                { left: frame.x, top: frame.y, width: frame.w, height: frame.h },
                flyStyle,
              ]}
            >
              <Img source={{ uri: flying }} style={media.fill} transition={0} />
            </Animated.View>
          ) : null}

          <View style={s.toast} pointerEvents="none">
            <Toast message={toast?.text ?? null} id={toast?.id} />
          </View>
        </View>
      </Screen>
    </View>
  );
}

const KEEP = [0] as const;

function EndPage({
  frame,
  title,
  message,
}: {
  frame: { w: number; h: number };
  title: string;
  message: string;
}) {
  const s = useStyles(make);
  return (
    <View style={s.endRoot}>
      <View style={[s.end, { width: frame.w, height: frame.h }]}>
        <Txt variant="title" center>
          {title}
        </Txt>
        <Txt variant="body" tone="muted" center>
          {message}
        </Txt>
      </View>
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    root: { flex: 1 },
    fill: { flex: 1 },
    bar: {
      height: BAR,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.md,
      zIndex: 2,
    },
    hidden: { opacity: 0 },
    round: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: c.surface },
    dot: {
      position: 'absolute',
      top: 9,
      right: 9,
      width: 10,
      height: 10,
      borderRadius: radius.full,
      backgroundColor: c.accent,
      borderWidth: 2,
      borderColor: c.surface,
    },
    center: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' },
    layer: { position: 'absolute' },
    pill: {
      height: 44,
      borderRadius: radius.full,
      backgroundColor: c.surface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingHorizontal: space.lg,
    },
    pillAccent: { backgroundColor: c.accent },

    area: { flex: 1 },
    feedBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: FEED_BAR,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.xxxl,
    },

    overlay: { ...StyleSheet.absoluteFill, backgroundColor: c.bg, zIndex: 3 },
    dim: { ...StyleSheet.absoluteFill, backgroundColor: c.bg },
    gridShutter: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: space.xxxl,
      alignItems: 'center',
    },

    window: {
      position: 'absolute',
      overflow: 'hidden',
      backgroundColor: c.surfaceRaised,
      zIndex: 4,
    },
    muntinV: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: '50%',
      width: 3,
      marginLeft: -1.5,
      backgroundColor: c.bg,
    },
    muntinH: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      height: 3,
      marginTop: -1.5,
      backgroundColor: c.bg,
    },

    fly: { position: 'absolute', overflow: 'hidden', zIndex: 5 },
    toast: { position: 'absolute', left: 0, right: 0, top: BAR + space.sm, zIndex: 6 },

    endRoot: { flex: 1, alignItems: 'center', paddingTop: layout.frameInset },
    end: {
      borderRadius: radius.viewfinder,
      backgroundColor: c.surfaceSunken,
      borderWidth: 1.5,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
      paddingHorizontal: space.xxxl,
    },
  });
