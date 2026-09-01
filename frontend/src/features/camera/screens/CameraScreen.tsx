/**
 * Màn Camera — màn mặc định khi mở app. Gồm cả bước xem lại sau khi chụp.
 *
 * ── Khung ngắm lấy cạnh bằng số NHỎ HƠN của hai thứ ──────────────────────
 * 94% bề ngang máy, và chiều cao thật còn lại giữa thanh trên và hàng chụp.
 * Chiều cao đó đo bằng `onLayout` chứ không tính tay từ chắn tai thỏ — tính
 * tay là mỗi lần thêm một hàng lại phải sửa một hằng số, và quên sửa thì khung
 * tràn ra ngoài trên máy ngắn mà không ai biết cho tới khi cầm đúng cái máy đó.
 *
 * Trước đây khung khoá cứng ở 88% bề ngang. Trên iPhone 14 nó để thừa hơn 200pt
 * khoảng trống chia đều vào ba khe — màn nhìn rỗng và các khối rời rạc nhau.
 *
 * ── Chụp xong thì KHÔNG chuyển màn ───────────────────────────────────────
 * Ảnh vừa chụp đè lên chính khung ngắm, `CameraView` vẫn nằm nguyên bên dưới.
 * Nếu đẩy sang một màn khác thì camera bị tháo, và bấm "chụp tiếp" phải chờ nó
 * khởi động lại — trên máy tầm trung là 300–500ms nhìn thấy được bằng mắt.
 *
 * Bốn khối xếp dọc; khối giữa co giãn, ba khối kia cao cố định. Nhờ vậy đổi
 * giữa "đang chụp" và "đang xem lại" không có gì nhảy chỗ.
 */
import { useCallback, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { CaptionField, IconButton, Img, Loading, Pill, Rings, Screen, Txt } from '@ui';
import { common, layout, media, radius, space, useColors, useStyles, type Palette } from '@design';
import { useT } from '@i18n';
import * as feel from '@/lib/haptics';
import type { PhotoSource } from '@/features/feed/types';
import { CameraPermission } from '../components/CameraPermission';
import { FlashToggle, type FlashMode } from '../components/FlashToggle';
import { ScreenFlash, WARMUP_MS, type ScreenFlashHandle } from '../components/ScreenFlash';
import { MomentsPeek } from '../components/MomentsPeek';
import { NookStrip, type StripFriend } from '../components/NookStrip';
import { SendButton } from '../components/SendButton';
import { Shutter } from '../components/Shutter';

export type Shot = { uri: string; caption: string };

export function CameraScreen({
  friends,
  peekPhotos,
  peekLabel,
  peekHint,
  inviteLabel,
  onOpenCircle,
  onOpenSettings,
  onOpenFeed,
  onSend,
}: {
  /** Người trong góc. Vừa là hàng avatar trên đầu, vừa là danh sách người nhận. */
  friends: readonly StripFriend[];
  /** Ba tấm mới nhất — cửa nhòm ở chân màn. */
  peekPhotos: readonly PhotoSource[];
  peekLabel: string;
  peekHint: string;
  inviteLabel: string;
  onOpenCircle: () => void;
  onOpenSettings: () => void;
  onOpenFeed: () => void;
  /** Gửi cho cả góc. Trả về khi đã gửi xong — màn tự dọn ảnh và quay về chụp. */
  onSend: (shot: Shot) => Promise<void>;
}) {
  const s = useStyles(make);
  const c = useColors();
  const t = useT();
  const { width } = useWindowDimensions();
  const friendCount = friends.length;

  const [permission, requestPermission, refreshPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [shot, setShot] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [stageHeight, setStageHeight] = useState(0);
  const cam = useRef<CameraView>(null);
  const screenFlash = useRef<ScreenFlashHandle>(null);

  const measure = useCallback((e: LayoutChangeEvent) => {
    setStageHeight(e.nativeEvent.layout.height);
  }, []);

  const capture = useCallback(async () => {
    if (busy || !cam.current) return;
    setBusy(true);
    feel.capture();

    // Camera trước không có đèn thật — lấy màn hình làm đèn. Phải chờ màn kịp
    // sáng rồi mới chụp, nếu không cảm biến đọc xong khung trước khi có sáng.
    const useScreen = flash === 'on' && facing === 'front';
    if (useScreen) {
      screenFlash.current?.on();
      await new Promise((r) => setTimeout(r, WARMUP_MS));
    }

    try {
      const photo = await cam.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) setShot(photo.uri);
    } finally {
      screenFlash.current?.off();
      setBusy(false);
    }
  }, [busy, facing, flash]);

  // Thư viện ảnh xin quyền riêng, và expo-image-picker tự lo hộp thoại đó.
  // Người dùng bấm huỷ thì `canceled` = true — im lặng quay về, không báo lỗi:
  // huỷ là một lựa chọn, không phải một sự cố.
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
    setShot(first.uri);
  }, [busy]);

  const discard = useCallback(() => {
    setShot(null);
    setCaption('');
  }, []);

  const send = useCallback(async () => {
    if (busy || !shot) return;
    setBusy(true);
    try {
      await onSend({ uri: shot, caption: caption.trim() });
      discard();
    } finally {
      setBusy(false);
    }
  }, [busy, caption, discard, onSend, shot]);

  const flip = useCallback(() => {
    setFacing((f) => (f === 'front' ? 'back' : 'front'));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash((f) => (f === 'off' ? 'on' : 'off'));
  }, []);

  // Chưa đọc xong quyền: đừng vẽ gì. Nháy màn xin quyền lên rồi tắt ngay là tệ
  // hơn hẳn một nhịp trống, vì người dùng kịp đọc và kịp hoang mang.
  if (!permission) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

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
  const frame = Math.min(Math.round(width * layout.cameraFrameRatio), Math.floor(stageHeight));

  return (
    <Screen padded={false} edges={['top', 'bottom']} keyboard>
      <View style={s.root}>
        {/* 1 — Thanh trên */}
        <View style={s.topBar}>
          {reviewing ? (
            <>
              <IconButton label={t('review.discard')} onPress={discard}>
                <Ionicons name="close" size={24} color={c.text} />
              </IconButton>

              {/* Chỉ để thông tin, KHÔNG bấm được: Nook không có bước chọn
                  người nhận — gửi là gửi cho cả góc. */}
              <Pill>
                <Txt variant="label" tone="muted">
                  {friendCount === 0
                    ? t('review.sendToNobody')
                    : t('review.sendTo', { count: friendCount })}
                </Txt>
              </Pill>

              <View style={s.slot} />
            </>
          ) : (
            <>
              <IconButton label={t('camera.openCircle')} onPress={onOpenCircle}>
                <View style={s.mark}>
                  <Rings size={26} />
                </View>
              </IconButton>

              {/* Không lặp lại con số ở đây: hàng avatar ngay dưới đã nói rồi,
                  và nói bằng hình thì đọc nhanh hơn. */}
              <Txt variant="section">{t('camera.openCircle')}</Txt>

              <IconButton label={t('camera.openSettings')} onPress={onOpenSettings}>
                <Ionicons name="settings-outline" size={20} color={c.textMuted} />
              </IconButton>
            </>
          )}
        </View>

        {/* 2 — Hàng người trong góc. Có ở CẢ HAI trạng thái: lúc chụp nó nói
            "ai sẽ thấy tấm này", lúc xem lại nó chính là danh sách người nhận. */}
        <View style={s.strip}>
          <NookStrip
            friends={friends}
            inviteLabel={inviteLabel}
            showInvite={!reviewing}
            onPressFriend={onOpenCircle}
            onInvite={onOpenCircle}
          />
        </View>

        {/* 3 — Sân khấu: co giãn hết chỗ còn lại. Khung vuông lấy cạnh bằng số
            NHỎ HƠN giữa 96% bề ngang và chiều cao thật của cái sân này. */}
        <View style={s.stage} onLayout={measure}>
          {frame > 0 ? (
            <View style={[s.frame, { width: frame, height: frame }]}>
              <CameraView
                ref={cam}
                style={common.absoluteFill}
                facing={facing}
                // Camera SAU dùng đèn thật; camera trước đã có đèn màn hình lo,
                // bật cả hai là loé hai lần.
                flash={facing === 'back' ? flash : 'off'}
              />

              {reviewing ? (
                <Img source={{ uri: shot }} style={media.fill} contentFit="cover" />
              ) : null}

              {/* Công tắc đèn nằm trong góc khung, chỉ có nghĩa lúc đang ngắm. */}
              {reviewing ? null : (
                <View style={s.frameCorner}>
                  <FlashToggle mode={flash} label={t('camera.flash')} onToggle={toggleFlash} />
                </View>
              )}

              <View style={s.captionSlot} pointerEvents={reviewing ? 'auto' : 'none'}>
                {reviewing ? (
                  <CaptionField
                    value={caption}
                    onChangeText={setCaption}
                    placeholder={t('review.captionPlaceholder')}
                    label={t('review.captionLabel')}
                  />
                ) : (
                  <Pill onPhoto>
                    <Ionicons name="create-outline" size={15} color={c.textMuted} />
                    <Txt variant="label" tone="muted">
                      {t('camera.captionHint')}
                    </Txt>
                  </Pill>
                )}
              </View>
            </View>
          ) : null}
        </View>

        {/* 4 — Hàng chụp / hàng gửi. Cùng chiều cao ở cả hai trạng thái. */}
        <View style={s.actionRow}>
          {reviewing ? (
            <>
              <View style={s.slot} />
              <SendButton onPress={() => void send()} busy={busy} label={t('review.send')} />
              <View style={s.slot} />
            </>
          ) : (
            <>
              <IconButton label={t('camera.gallery')} onPress={() => void pick()}>
                <Ionicons name="images-outline" size={24} color={c.textMuted} />
              </IconButton>

              <Shutter onPress={() => void capture()} busy={busy} label={t('camera.shutter')} />

              <IconButton label={t('camera.flip')} onPress={flip}>
                <Ionicons name="camera-reverse-outline" size={24} color={c.textMuted} />
              </IconButton>
            </>
          )}
        </View>

        {/* 5 — Chân màn. Hai trạng thái, cùng chiều cao. */}
        <View style={s.footer}>
          {reviewing ? (
            // Nhắc lại lời hứa đúng vào giây người ta sắp gửi. Đây là chỗ duy
            // nhất trong app mà câu đó còn kịp thay đổi quyết định.
            <Txt variant="faint" tone="faint" center style={s.promise}>
              {friendCount === 0 ? peekHint : t('review.privacy', { count: friendCount })}
            </Txt>
          ) : (
            <MomentsPeek
              photos={peekPhotos}
              label={peekLabel}
              accessibilityLabel={peekLabel}
              onPress={onOpenFeed}
            />
          )}
        </View>
      </View>

      {/* Nhuộm trắng CẢ MÀN chứ không riêng khung: cần bao nhiêu ánh sáng thì
          lấy bấy nhiêu. Nằm ngoài cùng nên nó phủ lên mọi thứ. */}
      <ScreenFlash ref={screenFlash} />
    </Screen>
  );
}

const FOOTER_HEIGHT = 76;

const make = (c: Palette) =>
  StyleSheet.create({
  root: { flex: 1, alignItems: 'center', paddingVertical: space.sm },

  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
  },
  mark: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Giữ chỗ đúng bằng một IconButton để pill ở giữa đứng yên. */
  slot: { width: layout.minTouch },

  strip: { alignSelf: 'stretch', paddingTop: space.md, paddingBottom: space.sm },

  /*
   * Khung neo về ĐÁY sân, không nằm giữa.
   *
   * Khung là hình vuông nên trên máy dài luôn còn thừa chiều cao. Chia đôi chỗ
   * thừa thì có một khe ngay trên nút chụp — nút bấm nhiều nhất app lại là nút
   * trôi lơ lửng. Dồn chỗ thừa lên trên thì nó nhập vào khoảng thở dưới hàng
   * avatar, còn nút chụp nằm sát ngay dưới ảnh: đúng chỗ ngón cái với tới, và
   * đúng chỗ mắt đang nhìn.
   */
  stage: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: space.md,
    paddingBottom: space.xxl,
  },
  frame: {
    borderRadius: radius.viewfinder,
    backgroundColor: c.surface,
    overflow: 'hidden',
  },
  frameCorner: { position: 'absolute', top: space.lg, left: space.lg },
  captionSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: space.lg,
    alignItems: 'center',
  },

  actionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xxxl + space.sm,
  },

  footer: {
    height: FOOTER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xxl,
  },
  promise: { maxWidth: layout.maxTextWidth },
});
