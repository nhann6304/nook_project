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
import { useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CaptionField, IconButton, Img, Loading, Spinner } from '@ui';
import {
  common,
  duration,
  layout,
  media,
  radius,
  space,
  spring,
  useColors,
  useStyles,
  type Palette,
} from '@design';
import { useT } from '@i18n';
import * as feel from '@/lib/haptics';
import { CameraPermission } from './CameraPermission';
import { FlashToggle, type FlashMode } from './FlashToggle';
import { ScreenFlash, WARMUP_MS, type ScreenFlashHandle } from './ScreenFlash';
import { SendButton } from './SendButton';
import { Shutter } from './Shutter';
import { squarePhoto } from '../lib/squarePhoto';

export type Shot = { uri: string; caption: string };

/** Chiều cao hàng chụp. Màn chính cần số này để tính cỡ khung. */
export const CONTROLS_HEIGHT = 128;
/** Chỗ dành cho dải dưới hàng chụp (nhật ký 7 ngày). */
export const FOOTER_HEIGHT = 92;

export function CameraPage({
  frame,
  onReviewChange,
  onSend,
  onOpenFeed,
  footer,
}: {
  /** `top`: khoảng từ đỉnh trang tới khung — màn chính tính, mọi trang dùng chung. */
  frame: { w: number; h: number; top: number };
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
  const [facing, setFacing] = useState<CameraType>('front');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [shot, setShot] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const cam = useRef<CameraView>(null);
  const screenFlash = useRef<ScreenFlashHandle>(null);

  // Nháy trắng trong khung lúc bấm — cửa trập "đóng" một cái.
  const blink = useSharedValue(0);
  const blinkStyle = useAnimatedStyle(() => ({ opacity: blink.get() }));
  const spin = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  // Cắt hỏng (hiếm) thì vẫn giữ ảnh gốc — mất ảnh vừa chụp tệ hơn lệch khung.
  const toSquare = useCallback(async (uri: string) => {
    try {
      return await squarePhoto(uri);
    } catch {
      return uri;
    }
  }, []);

  const review = useCallback(
    (uri: string | null) => {
      setShot(uri);
      onReviewChange(uri !== null);
    },
    [onReviewChange],
  );

  /**
   * Máy bắt ảnh NGAY lúc gọi `takePictureAsync`; phần chậm (0,3–0,8s) là xử lý
   * ảnh độ phân giải đầy đủ SAU đó. Trước đây khung ngắm vẫn chạy trong lúc
   * chờ và rung "đã chụp" tới muộn, nên người dùng tưởng phải giữ yên máy.
   * Giờ: rung + nháy ngay khi bấm, iPhone đứng hình khung ngắm đúng khoảnh
   * khắc đó, và có vòng xoay tới khi ảnh về.
   *
   * Android KHÔNG đứng hình: `pausePreview` bên đó tháo cả camera, gọi lúc
   * đang chụp là mất ảnh.
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
      const shooting = cam.current.takePictureAsync({ quality: 0.8 });
      if (Platform.OS === 'ios') void cam.current.pausePreview();
      setProcessing(true);
      const photo = await shooting;
      if (photo?.uri) review(await toSquare(photo.uri));
      else if (Platform.OS === 'ios') void cam.current?.resumePreview();
    } finally {
      screenFlash.current?.off();
      setProcessing(false);
      setBusy(false);
    }
  }, [blink, busy, facing, flash, review, toSquare]);

  // Huỷ chọn ảnh là một lựa chọn, không phải sự cố — im lặng quay về.
  const pick = useCallback(async () => {
    if (busy) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    const first = res.assets?.[0];
    if (res.canceled || !first) return;
    feel.select();
    // Android có thể bỏ qua `aspect`, iOS thì luôn vuông — cắt lại cho chắc.
    review(await toSquare(first.uri));
  }, [busy, review, toSquare]);

  const discard = useCallback(() => {
    if (Platform.OS === 'ios') void cam.current?.resumePreview();
    review(null);
    setCaption('');
  }, [review]);

  const send = useCallback(() => {
    if (!shot) return;
    onSend({ uri: shot, caption: caption.trim() });
    discard();
  }, [caption, discard, onSend, shot]);

  const flip = useCallback(() => {
    spin.set(withSpring(spin.get() + 180, spring.enter));
    setFacing((f) => (f === 'front' ? 'back' : 'front'));
  }, [spin]);

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
      <View style={[s.frame, { width: frame.w, height: frame.h }]}>
        <CameraView
          ref={cam}
          style={common.absoluteFill}
          facing={facing}
          // Ảnh camera trước giữ y như lúc ngắm (soi gương). Mặc định `false`
          // thì ảnh ra bị lật ngang so với thứ người dùng vừa thấy.
          mirror
          // Camera sau dùng đèn thật; camera trước đã có đèn màn hình lo.
          flash={facing === 'back' ? flash : 'off'}
        />

        {reviewing ? (
          <Animated.View entering={FadeIn.duration(duration.fast)} style={common.absoluteFill}>
            <Img source={{ uri: shot }} style={media.fill} transition={0} />
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

        <Animated.View pointerEvents="none" style={[s.blink, blinkStyle]} />

        {processing ? (
          <Animated.View
            entering={FadeIn.delay(duration.fast).duration(duration.fast)}
            exiting={FadeOut.duration(duration.fast)}
            style={s.processing}
            pointerEvents="none"
          >
            <Spinner size={34} color={c.onPhotoText} />
          </Animated.View>
        ) : null}

        {reviewing ? (
          <Animated.View
            entering={FadeIn.delay(duration.fast).duration(duration.base)}
            style={s.captionSlot}
          >
            <CaptionField
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
                <Ionicons name="close" size={22} color={c.text} />
              </IconButton>
            </Animated.View>
            <Animated.View key="send" entering={ZoomIn.springify().damping(spring.enter.damping)}>
              <SendButton onPress={send} label={t('review.send')} />
            </Animated.View>
            <View style={s.slot} />
          </>
        ) : (
          <>
            <Animated.View key="gallery" entering={FadeIn.duration(duration.base)}>
              <IconButton label={t('camera.gallery')} onPress={() => void pick()} style={s.square}>
                <Ionicons name="images-outline" size={20} color={c.text} />
              </IconButton>
            </Animated.View>
            <Animated.View key="shutter" entering={FadeIn.duration(duration.base)}>
              <Shutter onPress={() => void capture()} busy={busy} label={t('camera.shutter')} />
            </Animated.View>
            <Animated.View key="flip" entering={FadeIn.duration(duration.base)}>
              <IconButton label={t('camera.flip')} onPress={flip} style={s.round}>
                <Animated.View style={spinStyle}>
                  <Ionicons name="sync" size={22} color={c.text} />
                </Animated.View>
              </IconButton>
            </Animated.View>
          </>
        )}
      </View>

      {reviewing ? null : (
        <Animated.View entering={FadeIn.duration(duration.base)} style={s.footer}>
          {footer}
        </Animated.View>
      )}

      <ScreenFlash ref={screenFlash} />
    </View>
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
    corner: { position: 'absolute', top: space.md + 2, left: space.md + 2 },
    blink: { ...StyleSheet.absoluteFill, backgroundColor: c.onPhotoText },
    processing: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.scrimSoft,
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
    round: { borderRadius: radius.full, backgroundColor: c.surface },
    square: {
      borderRadius: radius.sm + 2,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    slot: { width: layout.minTouch },

    footer: { height: FOOTER_HEIGHT, alignSelf: 'stretch' },
  });
