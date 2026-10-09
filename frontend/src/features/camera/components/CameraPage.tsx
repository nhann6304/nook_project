/**
 * Trang camera — trang 0 của màn chính. Gồm cả bước xem lại sau khi chụp.
 *
 * Chụp xong KHÔNG chuyển màn: ảnh đè lên chính khung ngắm, `CameraView` vẫn
 * nằm bên dưới. Đẩy sang màn khác là tháo camera, bấm chụp tiếp phải chờ nó
 * khởi động lại 300–500ms.
 *
 * Gửi: trang này chỉ trao ảnh cho màn chính rồi dọn ngay. Hiệu ứng ảnh bay về
 * góc do màn chính vẽ ở lớp trên cùng — ở trong trang thì ảnh bị cắt bởi
 * khung trang, bay không ra khỏi được.
 */
import { useCallback, useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  type CameraType,
} from 'expo-camera';
import { getThumbnailAsync } from 'expo-video-thumbnails';
import { MEDIA_LIMITS } from '@nook/shared/model/constant';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { CaptionField, Clip, Icon, IconButton, Img, Loading } from '@ui';
import {
  common,
  duration,
  media,
  radius,
  space,
  useColors,
  useStyles,
  useTheme,
  type Palette,
} from '@design';
import { useT } from '@i18n';
import * as feel from '@/lib/device/haptics';
import * as sound from '@/lib/device/sound';
import { CameraPermission } from './overlay/CameraPermission';
import { FlashToggle, type FlashMode } from './controls/FlashToggle';
import { ZoomChip, type ZoomLevel } from './controls/ZoomChip';
import { ScreenFlash, WARMUP_MS, type ScreenFlashHandle } from './overlay/ScreenFlash';
import { SendButton } from './controls/SendButton';
import { Shutter } from './controls/Shutter';
import { AudiencePicker, type AudiencePerson } from './audience/AudiencePicker';
import { AudienceSheet } from './audience/AudienceSheet';
import { photoSeed } from '../utils/photoColor';
import { TagSuggestions } from './overlay/TagSuggestions';
import type { Tag } from '@/features/feed/types';
import {
  insertMention,
  MAX_TAGS,
  mentionAtEnd,
  suggestTags,
  tagsIn,
} from '@/features/feed/utils/tags';

/** `uri` luôn là ẢNH (với video thì là ảnh bìa) — lưới, nhật ký, hiệu ứng bay dùng nó. */
export type Shot = {
  uri: string;
  caption: string;
  tags: Tag[];
  video?: string;
  /** Người KHÔNG được xem tấm này. */
  hiddenFrom: string[];
};

/** Chiều cao hàng chụp. Màn chính cần số này để tính cỡ khung. */
export const CONTROLS_HEIGHT = 128;

/**
 * "2×" bằng zoom số. `zoom` của expo-camera là 0–1 theo thang LOGARIT tới
 * zoom tối đa của máy (iOS: hệ số = max^zoom); max ống chính thường ~16 →
 * 0.25 ≈ 2×. Gần đúng, đủ cho một nút bấm nhanh như Locket.
 */
const ZOOM_2X = 0.25;
/** Chỗ dành cho dải dưới hàng chụp (nhật ký 7 ngày). */
export const FOOTER_HEIGHT = 92;

/** Vầng sáng quanh khung lúc chụp, nhô ra mỗi bên chừng này. */
const GLOW = 10;
/** Đổi camera sang chế độ quay mất một nhịp; `onCameraReady` không báo thì chờ tối đa chừng này. */
const MODE_SWITCH_MS = 600;
const MAX_VIDEO_MS = MEDIA_LIMITS.videoMaxSeconds * 1000;

export function CameraPage({
  active,
  audience,
  defaultHidden,
  frame,
  keyboardGap,
  taggable,
  onReviewChange,
  onSend,
  onOpenFeed,
  footer,
}: {
  /** `false` khi màn chính bị che (sang tab khác) — tắt hẳn camera. */
  active: boolean;
  /** Bạn trong góc — hàng chọn người xem dưới ảnh vừa chụp. */
  audience: readonly AudiencePerson[];
  /** Người bị giấu sẵn theo Cài đặt. */
  defaultHidden: readonly string[];
  /** `top`: khoảng từ đỉnh trang tới khung — màn chính tính, mọi trang dùng chung. */
  frame: { w: number; h: number; top: number };
  /** Khoảng từ đáy khung tới đáy màn — để chữ chú thích né bàn phím. */
  keyboardGap: number;
  /** Bạn trong góc — những người tag được vào chú thích. */
  taggable: readonly Tag[];
  onReviewChange: (reviewing: boolean) => void;
  /** Màn chính nhận ảnh, vẽ hiệu ứng bay, rồi lưu. */
  onSend: (shot: Shot) => void;
  onOpenFeed: () => void;
  /** Vẽ dưới hàng chụp khi đang ngắm; ẩn lúc xem lại ảnh vừa chụp. */
  footer?: React.ReactNode;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();

  const [permission, requestPermission, refreshPermission] = useCameraPermissions();
  const [mic, requestMic] = useMicrophonePermissions();
  const [mode, setMode] = useState<'picture' | 'video'>('picture');
  const [recording, setRecording] = useState(false);
  const [clip, setClip] = useState<string | null>(null);
  const [hidden, setHidden] = useState<readonly string[]>(defaultHidden);
  const [sheet, setSheet] = useState(false);
  const holding = useRef(false);
  const recordingRef = useRef(false);
  const readyWait = useRef<(() => void) | null>(null);
  const [facing, setFacing] = useState<CameraType>('front');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState<ZoomLevel>(1);
  // Tên ống góc siêu rộng nếu máy có (iOS báo qua `onAvailableLensesChanged`).
  const [ultraWide, setUltraWide] = useState<string | null>(null);
  const [shot, setShot] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const cam = useRef<CameraView>(null);
  const screenFlash = useRef<ScreenFlashHandle>(null);

  // Nháy trắng trong khung lúc bấm — cửa trập "đóng" một cái.
  const blink = useSharedValue(0);
  const blinkStyle = useAnimatedStyle(() => ({ opacity: blink.get() }));
  // Khung "bừng sáng" một nhịp quanh viền — chỉ opacity, chạy trên luồng UI.
  const glowStyle = useAnimatedStyle(() => ({ opacity: blink.get() * 0.6 }));
  // Khung đứng yên khi bàn phím bật; chỉ ô chú thích nhích lên vừa đủ né nó.
  const keyboard = useAnimatedKeyboard();
  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -Math.max(0, keyboard.height.value - keyboardGap + space.md) }],
  }));
  const spin = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));


  const review = useCallback(
    (uri: string | null) => {
      // Mỗi tấm mới bắt đầu từ người xem mặc định, không mang theo lựa chọn tấm trước.
      if (uri) setHidden(defaultHidden);
      setShot(uri);
      onReviewChange(uri !== null);
    },
    [defaultHidden, onReviewChange],
  );

  /**
   * Máy bắt ảnh NGAY lúc gọi `takePictureAsync`; phần chậm (0,3–0,8s) là xử lý
   * ảnh độ phân giải đầy đủ SAU đó. Trước đây khung ngắm vẫn chạy trong lúc
   * chờ và rung "đã chụp" tới muộn, nên người dùng tưởng phải giữ yên máy.
   * Giờ: rung + nháy ngay khi bấm, ảnh về là hiện liền, không vòng chờ.
   * KHÔNG đứng hình khung ngắm (`pausePreview`) nữa: Android tháo cả camera,
   * iOS thì cắt ngang ảnh đang chụp.
   */
  const capture = useCallback(async () => {
    if (busy || !cam.current) return;
    setBusy(true);

    // Camera trước không có đèn thật — lấy màn hình làm đèn, chờ màn kịp sáng.
    const useScreen = flash === 'on' && facing === 'front';
    if (useScreen) {
      screenFlash.current?.on();
      await new Promise((r) => setTimeout(r, WARMUP_MS));
    }

    feel.capture();
    blink.set(
      withSequence(
        withTiming(0.85, { duration: duration.instant }),
        withTiming(0, { duration: duration.slow }),
      ),
    );

    try {
      // KHÔNG pausePreview trước khi ảnh về, và tiếng "tách" phát SAU: iOS
      // 07/10/2026 báo "Image could not be captured" — dừng khung ngắm hay
      // bật phiên âm thanh giữa lúc chụp đều cắt ngang phiên camera.
      const photo = await cam.current.takePictureAsync({ quality: 1 });
      if (photo?.uri) {
        sound.capture();
        // Hiện ảnh gốc NGAY (khung cắt bằng `cover` giống hệt), không vòng chờ.
        review(photo.uri);
      }
    } catch {
      // Máy từ chối chụp (phiên camera vừa bị ngắt) — rung báo, giữ nguyên khung
      // ngắm để bấm lại, không văng lỗi đỏ.
      feel.reject();
    } finally {
      screenFlash.current?.off();
      setBusy(false);
    }
  }, [blink, busy, facing, flash, review]);

  // Huỷ chọn ảnh là một lựa chọn, không phải sự cố — im lặng quay về.
  const pick = useCallback(async () => {
    if (busy) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      // ẢNH GỐC 100% (09/10/2026): không cắt, không nén lại — iOS giữ nguyên
      // tệp HEIC/JPEG trong thư viện. Khung vuông chỉ là cách HIỂN THỊ (`cover`).
      allowsEditing: false,
      quality: 1,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
    });
    const first = res.assets?.[0];
    if (res.canceled || !first) return;
    feel.select();
    review(first.uri);
  }, [busy, review]);

  /*
   * Giữ nút = quay. Camera chỉ đổi sang chế độ quay LÚC GIỮ (đổi sẵn thì chụp
   * ảnh trên Android chậm hẳn). Thả tay trong lúc đang đổi thì thôi, không quay.
   * Micro bị từ chối thì vẫn quay, video câm.
   */
  const onReady = useCallback(() => {
    readyWait.current?.();
    readyWait.current = null;
  }, []);

  const holdStart = useCallback(async () => {
    if (busy || !cam.current) return;
    holding.current = true;
    setBusy(true);
    if (mic && !mic.granted && mic.canAskAgain) await requestMic();
    if (holding.current && mode !== 'video') {
      await new Promise<void>((resolve) => {
        readyWait.current = resolve;
        setMode('video');
        setTimeout(resolve, MODE_SWITCH_MS);
      });
    }
    if (!holding.current || !cam.current) {
      setMode('picture');
      setBusy(false);
      return;
    }
    feel.capture();
    recordingRef.current = true;
    setRecording(true);
    try {
      const res = await cam.current.recordAsync({ maxDuration: MEDIA_LIMITS.videoMaxSeconds });
      if (res?.uri) {
        const poster = await getThumbnailAsync(res.uri, { time: 0 }).catch(() => null);
        setClip(res.uri);
        review(poster?.uri ?? res.uri);
      } else {
        setMode('picture');
      }
    } catch {
      setMode('picture');
    } finally {
      recordingRef.current = false;
      setRecording(false);
      setBusy(false);
    }
  }, [busy, mic, mode, requestMic, review]);

  const holdEnd = useCallback(() => {
    holding.current = false;
    if (recordingRef.current) cam.current?.stopRecording();
  }, []);

  const discard = useCallback(() => {
    review(null);
    setClip(null);
    setMode('picture');
    setCaption('');
  }, [review]);

  const send = useCallback(async () => {
    if (!shot) return;
    const text = caption.trim();
    // Gửi ĐÚNG tệp máy ảnh chụp ra — không cắt, không nén lại.
    const uri = shot;
    onSend({
      uri,
      caption: text,
      tags: tagsIn(text, taggable),
      video: clip ?? undefined,
      hiddenFrom: [...hidden],
    });
    discard();
    // "Theo ảnh": app ngả theo màu tấm vừa gửi. Chạy sau khi gửi — lỗi hay ảnh
    // không có màu thì giữ màu cũ, không ai biết.
    void photoSeed(uri)
      .then((seed) => {
        if (seed) useTheme.getState().setSeed(seed);
      })
      .catch(() => undefined);
  }, [caption, clip, discard, hidden, onSend, shot, taggable]);

  const toggleHidden = useCallback((id: string) => {
    setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  }, []);
  // "Tất cả": đang có người bị giấu thì mở lại cho cả góc; đang đủ thì giấu hết.
  const toggleAll = useCallback(() => {
    setHidden((h) => (h.length > 0 ? [] : audience.map((p) => p.id)));
  }, [audience]);

  /* ── Tag bạn: gõ "@" là hiện hàng gợi ý ── */
  const captionRef = useRef<ComponentRef<typeof CaptionField>>(null);
  const partial = mentionAtEnd(caption);
  const tagged = tagsIn(caption, taggable);
  const suggestions =
    partial !== null && tagged.length < MAX_TAGS ? suggestTags(partial, taggable, tagged) : [];
  const pickTag = useCallback((tag: Tag) => {
    feel.select();
    setCaption((v) => insertMention(v, tag.username));
  }, []);
  const startTag = useCallback(() => {
    setCaption((v) => (mentionAtEnd(v) !== null ? v : `${v}${v && !v.endsWith(' ') ? ' ' : ''}@`));
    captionRef.current?.focus();
  }, []);

  const flip = useCallback(() => {
    spin.set(withTiming(spin.get() + 180, { duration: duration.slow }));
    setFacing((f) => (f === 'front' ? 'back' : 'front'));
    setZoom(1);
  }, [spin]);

  // 1× → 2× → 0.5× (khi có ống siêu rộng ở camera sau) → 1×.
  const cycleZoom = useCallback(() => {
    setZoom((z) => (z === 1 ? 2 : z === 2 && facing === 'back' && ultraWide ? 0.5 : 1));
  }, [facing, ultraWide]);
  const onLenses = useCallback((e: { lenses: string[] }) => {
    setUltraWide(e.lenses.find((l) => /ultra ?wide/i.test(l)) ?? null);
  }, []);

  const toggleFlash = useCallback(() => setFlash((f) => (f === 'off' ? 'on' : 'off')), []);

  // Chưa đọc xong quyền: một nhịp trống, đừng nháy màn xin quyền lên rồi tắt.
  if (!permission) return <Loading />;

  if (!permission.granted) {
    return (
      <CameraPermission
        permission={permission}
        onRequest={requestPermission}
        onRefresh={refreshPermission}
        onSkip={onOpenFeed}
      />
    );
  }

  const reviewing = shot !== null;

  return (
    <View style={[s.root, { paddingTop: frame.top }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          s.glow,
          { top: frame.top - GLOW, width: frame.w + GLOW * 2, height: frame.h + GLOW * 2 },
          glowStyle,
        ]}
      />
      <View style={[s.frame, { width: frame.w, height: frame.h }]}>
        <CameraView
          ref={cam}
          active={active}
          mode={mode}
          // Quay video bằng camera sau: "đèn" là đèn pin bật suốt lúc quay.
          enableTorch={recording && facing === 'back' && flash === 'on'}
          // Chỉ mở micro lúc QUAY. Chụp ảnh mà camera giữ micro thì phiên âm
          // thanh của tiếng "tách" không bật được, và cắt ngang luôn ảnh đang chụp.
          mute={mode !== 'video' || !mic?.granted}
          onCameraReady={onReady}
          style={common.absoluteFill}
          facing={facing}
          // Ảnh camera trước giữ y như lúc ngắm (soi gương). Mặc định `false`
          // thì ảnh ra bị lật ngang so với thứ người dùng vừa thấy.
          mirror
          // Camera sau dùng đèn thật; camera trước đã có đèn màn hình lo.
          flash={facing === 'back' ? flash : 'off'}
          // 0.5× = đổi sang ỐNG góc siêu rộng (iOS), không phải zoom số.
          selectedLens={zoom === 0.5 && ultraWide ? ultraWide : undefined}
          onAvailableLensesChanged={onLenses}
          zoom={zoom === 2 ? ZOOM_2X : 0}
        />

        {reviewing ? (
          <Animated.View entering={FadeIn.duration(duration.fast)} style={common.absoluteFill}>
            <Img source={{ uri: shot }} style={media.fill} transition={0} />
            {clip ? <Clip uri={clip} playing={active} /> : null}
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeIn.duration(duration.base)}
            exiting={FadeOut.duration(duration.fast)}
            style={s.corner}
          >
            <FlashToggle mode={flash} label={t('camera.flash')} onToggle={toggleFlash} />
          </Animated.View>
        )}
        {reviewing ? null : (
          <Animated.View
            entering={FadeIn.duration(duration.base)}
            exiting={FadeOut.duration(duration.fast)}
            style={s.cornerRight}
          >
            <ZoomChip level={zoom} label={t('camera.zoom')} onPress={cycleZoom} />
          </Animated.View>
        )}

        <Animated.View pointerEvents="none" style={[s.blink, blinkStyle]} />
        {/* Đèn màn hình CHỈ trong khung (07/10/2026: trắng cả màn hình thì chói và
            hụt nhịp) — đủ soi mặt ở khoảng cách cầm máy. */}
        <ScreenFlash ref={screenFlash} />

        {reviewing ? (
          <Animated.View
            entering={FadeIn.delay(duration.fast).duration(duration.base)}
            style={[s.captionSlot, liftStyle]}
          >
            <TagSuggestions
              people={suggestions}
              label={(name) => t('review.tagPerson', { name })}
              onPick={pickTag}
            />
            <CaptionField
              ref={captionRef}
              value={caption}
              onChangeText={setCaption}
              placeholder={t('review.captionPlaceholder')}
              label={t('review.captionLabel')}
            />
          </Animated.View>
        ) : null}
      </View>

      {/* Hàng chụp và hàng gửi cùng chiều cao; đổi qua lại bằng mờ + nảy. */}
      <View style={s.controls}>
        {reviewing ? (
          <>
            <Animated.View key="discard" entering={FadeIn.duration(duration.base)}>
              <IconButton label={t('review.discard')} onPress={discard} style={s.round}>
                <Icon name="close" size={30} color={c.text} />
              </IconButton>
            </Animated.View>
            <Animated.View key="send" entering={FadeIn.duration(duration.base)}>
              <SendButton onPress={() => void send()} label={t('review.send')} />
            </Animated.View>
            {taggable.length > 0 ? (
              <Animated.View key="tag" entering={FadeIn.duration(duration.base)}>
                <IconButton label={t('review.tag')} onPress={startTag} style={s.round}>
                  <Icon name="at" size={30} color={c.text} />
                </IconButton>
              </Animated.View>
            ) : (
              <View style={s.slot} />
            )}
          </>
        ) : (
          <>
            <Animated.View key="gallery" entering={FadeIn.duration(duration.base)}>
              <IconButton label={t('camera.gallery')} onPress={() => void pick()} style={s.square}>
                <Icon name="image" size={30} color={c.text} />
              </IconButton>
            </Animated.View>
            <Animated.View key="shutter" entering={FadeIn.duration(duration.base)}>
              <Shutter
                onPress={() => void capture()}
                onHoldStart={() => void holdStart()}
                onHoldEnd={holdEnd}
                recording={recording}
                maxMs={MAX_VIDEO_MS}
                busy={busy}
                label={t('camera.shutter')}
              />
            </Animated.View>
            <Animated.View key="flip" entering={FadeIn.duration(duration.base)}>
              <IconButton label={t('camera.flip')} onPress={flip} style={s.round}>
                <Animated.View style={spinStyle}>
                  <Icon name="flip" size={32} color={c.text} />
                </Animated.View>
              </IconButton>
            </Animated.View>
          </>
        )}
      </View>

      {reviewing ? (
        <Animated.View entering={FadeIn.duration(duration.base)} style={s.footer}>
          <AudiencePicker
            people={audience}
            hidden={hidden}
            onToggle={toggleHidden}
            onToggleAll={toggleAll}
            onSearch={() => setSheet(true)}
            searchLabel={t('audience.search')}
            allLabel={t('audience.all')}
            hiddenLabel={(name) => t('audience.hiddenPerson', { name })}
            label={t('audience.title')}
          />
          <AudienceSheet
            visible={sheet}
            people={audience}
            hidden={hidden}
            onToggle={toggleHidden}
            onClose={() => setSheet(false)}
            title={t('audience.title')}
            searchLabel={t('audience.searchPlaceholder')}
            doneLabel={t('audience.done')}
            shownLabel={t('audience.shown')}
            hiddenLabel={t('audience.hidden')}
            emptyLabel={t('audience.noMatch')}
          />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(duration.base)} style={s.footer}>
          {footer}
        </Animated.View>
      )}
    </View>
  );
}

const make = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, alignItems: 'center' },
    frame: {
      borderRadius: radius.viewfinder,
      borderCurve: 'continuous',
      backgroundColor: c.surfaceRaised,
      overflow: 'hidden',
    },
    corner: { position: 'absolute', top: space.md + 2, left: space.md + 2 },
    cornerRight: { position: 'absolute', top: space.md + 2, right: space.md + 2 },
    blink: { ...StyleSheet.absoluteFill, backgroundColor: c.onPhotoText },
    glow: {
      position: 'absolute',
      borderRadius: radius.viewfinder + GLOW,
      backgroundColor: c.accentBright,
    },
    captionSlot: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: space.lg,
      alignItems: 'center',
    },

    controls: {
      height: CONTROLS_HEIGHT,
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.huge - space.sm,
    },
    // Icon trần một màu, không viên nền (08/10/2026, theo Locket).
    round: { width: 58, height: 58 },
    square: { width: 58, height: 58 },
    slot: { width: 58 },

    footer: { height: FOOTER_HEIGHT, alignSelf: 'stretch' },
  });
