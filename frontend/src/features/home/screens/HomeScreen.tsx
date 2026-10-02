/**
 * Màn chính — camera ở trang 0, ảnh bạn bè xếp từng trang bên dưới, vuốt lên
 * là tới. Không thanh tab (bảng thiết kế bản 7): góc trái → bạn bè, góc phải
 * → tin nhắn, giữa là việc chính.
 *
 * Hai chuyển cảnh sống ở đây vì chúng phải vẽ ĐÈ lên mọi thứ, ngoài khung trang:
 *   · gửi ảnh: ảnh thu nhỏ bay về viên thuốc "N bạn" trên đầu;
 *   · mở từ lưới: ảnh nở từ đúng ô vừa chạm ra thành khung.
 * Cả hai chỉ dùng transform + opacity. Đừng animate left/top/width/height:
 * mỗi khung hình phải dàn trang lại, máy yếu là giật.
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
  OfflineBar,
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
import * as sound from '@/lib/sound';
import {
  CameraPage,
  CONTROLS_HEIGHT,
  FOOTER_HEIGHT,
  type Shot,
} from '@/features/camera/components/CameraPage';
import { MomentPage, type Reaction } from '@/features/feed/components/MomentPage';
import { MomentGrid, type Rect } from '@/features/feed/components/MomentGrid';
import { Shutter } from '@/features/camera/components/Shutter';
import type { Moment, Tag } from '@/features/feed/types';
import { JournalStrip } from '@/features/journal/components/JournalStrip';
import type { Entry } from '@/features/journal/types';

const BAR = 52;
const FEED_BAR = 64;
const OUT = Easing.bezier(...ease.out);
const IN_OUT = Easing.bezier(...ease.inOut);

export function HomeScreen({
  friendNames,
  taggable,
  onOpenPerson,
  offline,
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
  /** Bạn trong góc — tag được vào chú thích. */
  taggable: readonly Tag[];
  onOpenPerson: (id: string) => void;
  /** Máy đang không ra được internet — hiện viên "Đang chờ mạng". */
  offline: boolean;
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
  const { width, height: windowH } = useWindowDimensions();
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

  /* ── Khung ảnh vuông, chung cho camera và mọi khoảnh khắc ── */
  const frame = useMemo(() => {
    const maxW = width - layout.frameInset * 2;
    const maxH = area.h - layout.frameInset - CONTROLS_HEIGHT - FOOTER_HEIGHT;
    const h = Math.max(0, Math.min(maxW / layout.cameraFrameRatio, maxH));
    const w = Math.round(h * layout.cameraFrameRatio);
    // Máy cao còn dư chỗ: đẩy khung xuống một nửa phần dư, đừng dồn hết xuống đáy.
    const top = layout.frameInset + Math.round(Math.max(0, maxH - h) / 2);
    return { w, h: Math.round(h), top, x: (width - w) / 2, y: area.y + top };
  }, [area, width]);

  // Bàn phím KHÔNG được co khung: co là trang đổi cao, khung camera nhỏ lại rồi
  // to ra, cả màn giật lên giật xuống. Ô gõ duy nhất ở màn này là chú thích lúc
  // xem lại ảnh, nên trong lúc đó bỏ qua mọi lần co; chữ chú thích tự nhích lên
  // trên bàn phím (`CameraPage`).
  const reviewingRef = useRef(false);
  useEffect(() => {
    reviewingRef.current = reviewing;
  }, [reviewing]);
  const measure = useCallback((e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    setArea((prev) => (reviewingRef.current && height < prev.h ? prev : { y, h: height }));
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
  const sentTags = useRef<readonly Tag[]>([]);
  const landed = useCallback(() => {
    setFlying(null);
    feel.success();
    sound.sent();
    const tagged = sentTags.current;
    if (tagged.length > 0) {
      say(t('home.sentTagged', { names: tagged.map((tg) => tg.name).join(', ') }));
    } else {
      say(count === 0 ? t('home.sentAlone') : t('home.sent', { count }));
    }
  }, [count, say, t]);

  const send = useCallback(
    (shot: Shot) => {
      sentTags.current = shot.tags;
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

  /* ── Mở từ lưới: ảnh nở từ ô vừa chạm ── */
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
        withTiming(1, { duration: duration.slow, easing: OUT }, (done) => {
          if (done) runOnJS(opened)(index);
        }),
      );
    },
    [moments, open, opened, rootAt, winFade],
  );

  // Lớp ảnh nằm sẵn ĐÚNG chỗ khung; transform kéo nó về ô vừa chạm rồi thả ra.
  // Ô lưới và khung cùng vuông nên co một hệ số là khớp, bo góc co theo luôn.
  const winStyle = useAnimatedStyle(() => {
    const f = win?.from ?? { x: frame.x, y: frame.y, w: frame.w, h: frame.h };
    const k = 1 - open.value;
    const dx = f.x + f.w / 2 - (frame.x + frame.w / 2);
    const dy = f.y + f.h / 2 - (frame.y + frame.h / 2);
    const from = frame.w > 0 ? f.w / frame.w : 1;
    return {
      opacity: winFade.value,
      transform: [{ translateX: dx * k }, { translateY: dy * k }, { scale: 1 - (1 - from) * k }],
    };
  });

  /* ── Thanh trên + hàng dưới đổi theo vị trí lướt ── */
  const onCamera = page === 0;
  const camPill = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, area.h * 0.45], [1, 0], Extrapolation.CLAMP),
  }));
  const feedPill = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [area.h * 0.3, area.h * 0.8], [0, 1], Extrapolation.CLAMP),
  }));
  const feedBar = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [area.h * 0.35, area.h], [0, 1], Extrapolation.CLAMP),
  }));

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
            taggable={taggable}
            keyboardGap={windowH - (rootAt.y + frame.y + frame.h)}
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
          mentionedLabel={t('home.mentioned')}
          onReply={react}
          onOpenPerson={onOpenPerson}
        />
      );
    },
    [
      ago,
      frame,
      journal,
      moments,
      onOpenJournal,
      onOpenPerson,
      react,
      reactionLabels,
      rootAt.y,
      send,
      t,
      taggable,
      toFeed,
      weekdays,
      windowH,
    ],
  );

  return (
    <View style={s.page}>
      <SkyWash />
      <Screen padded={false} clear>
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
              <View style={s.fill}>
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
              </View>
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

          {/* 5 — Ảnh đang nở từ lưới */}
          {win ? (
            <Animated.View
              pointerEvents="none"
              style={[
                s.window,
                { left: frame.x, top: frame.y, width: frame.w, height: frame.h },
                winStyle,
              ]}
            >
              <Img source={win.photo} style={media.fill} transition={0} />
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

          <View style={s.offline} pointerEvents="none">
            <OfflineBar visible={offline} label={t('home.offline')} />
          </View>

          <View style={s.toast} pointerEvents="none">
            <Toast message={toast?.text ?? null} id={toast?.id} />
          </View>
        </View>
      </Screen>
    </View>
  );
}

const KEEP = [0] as const;

type Frame = { w: number; h: number; top: number };

function EndPage({ frame, title, message }: { frame: Frame; title: string; message: string }) {
  const s = useStyles(make);
  return (
    <View style={[s.endRoot, { paddingTop: frame.top }]}>
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
      borderRadius: radius.viewfinder,
      backgroundColor: c.surfaceRaised,
      zIndex: 4,
    },

    fly: { position: 'absolute', overflow: 'hidden', zIndex: 5 },
    toast: { position: 'absolute', left: 0, right: 0, top: BAR + space.sm, zIndex: 6 },
    offline: { position: 'absolute', left: 0, right: 0, top: BAR + space.xs, zIndex: 5 },

    endRoot: { flex: 1, alignItems: 'center' },
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
