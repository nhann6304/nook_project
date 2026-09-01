/**
 * Màn Camera — màn mặc định khi mở app. Gồm cả bước xem lại sau khi chụp.
 *
 * ── Bố cục ───────────────────────────────────────────────────────────────
 * Khung ngắm tính theo CHIỀU NGANG máy (88%), không theo chiều dọc. Máy dài
 * hơn thì phần thừa thành khoảng thở, khung KHÔNG giãn ra. Đây là lý do camera
 * của Locket trông gọn còn phần lớn app bắt chước thì nặng nề — và là câu trả
 * lời cho "iPhone SE và iPhone Pro Max có vừa cả hai không": vừa, vì chiều dọc
 * không tham gia vào phép tính.
 *
 * Bốn khối xếp dọc: thanh trên · khung ngắm · hàng chụp · chân màn.
 *
 * ── Chụp xong thì KHÔNG chuyển màn ───────────────────────────────────────
 * Ảnh vừa chụp đè lên chính khung ngắm, `CameraView` vẫn nằm nguyên bên dưới.
 * Nếu đẩy sang một màn khác thì camera bị tháo, và bấm "chụp tiếp" phải chờ nó
 * khởi động lại — trên máy tầm trung là 300–500ms nhìn thấy được bằng mắt. Giữ
 * camera sống thì quay lại chụp là tức thì.
 *
 * Ba khối trên/dưới đổi nội dung theo `shot`, còn khung ở giữa thì không đổi
 * kích thước — nên lúc đổi giữa hai trạng thái không có gì nhảy chỗ.
 */
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { CaptionField, Col, IconButton, Img, Loading, Pill, Rings, Screen, Txt } from '@ui';
import { color, common, layout, media, radius, space } from '@design';
import { useT } from '@i18n';
import * as feel from '@/lib/haptics';
import { CameraPermission } from '../components/CameraPermission';
import { SendButton } from '../components/SendButton';
import { Shutter } from '../components/Shutter';

export type Shot = { uri: string; caption: string };

export function CameraScreen({
  friendCount,
  onOpenCircle,
  onOpenSettings,
  onOpenFeed,
  onSend,
}: {
  friendCount: number;
  onOpenCircle: () => void;
  onOpenSettings: () => void;
  onOpenFeed: () => void;
  /** Gửi cho cả góc. Trả về khi đã gửi xong — màn tự dọn ảnh và quay về chụp. */
  onSend: (shot: Shot) => Promise<void>;
}) {
  const t = useT();
  const { width } = useWindowDimensions();
  const frame = Math.round(width * layout.cameraFrameRatio);

  const [permission, requestPermission, refreshPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [shot, setShot] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const cam = useRef<CameraView>(null);

  const capture = useCallback(async () => {
    if (busy || !cam.current) return;
    setBusy(true);
    feel.capture();
    try {
      const photo = await cam.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) setShot(photo.uri);
    } finally {
      setBusy(false);
    }
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

  // Chưa đọc xong quyền: đừng vẽ gì. Nháy màn xin quyền lên rồi tắt ngay là
  // tệ hơn hẳn một nhịp trống, vì người dùng kịp đọc và kịp hoang mang.
  if (!permission) return <Screen><Loading /></Screen>;

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
    <Screen padded={false} edges={['top', 'bottom']} keyboard>
      <View style={s.root}>
        {/* 1 — Thanh trên */}
        <View style={s.topBar}>
          {reviewing ? (
            <>
              <IconButton label={t('review.discard')} onPress={discard}>
                <Ionicons name="close" size={24} color={color.textMuted} />
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

              <Pill onPress={onOpenCircle}>
                <Txt variant="label">{t('camera.circlePill', { count: friendCount })}</Txt>
              </Pill>

              <IconButton label={t('camera.openSettings')} onPress={onOpenSettings}>
                <Ionicons name="settings-outline" size={20} color={color.textMuted} />
              </IconButton>
            </>
          )}
        </View>

        {/* 2 — Khung ngắm. Camera Ở LẠI bên dưới ảnh, không bị tháo. */}
        <View style={[s.frame, { width: frame, height: frame }]}>
          <CameraView ref={cam} style={common.absoluteFill} facing={facing} />

          {reviewing ? (
            <Img source={{ uri: shot }} style={media.fill} contentFit="cover" />
          ) : null}

          <View style={s.captionSlot} pointerEvents={reviewing ? 'auto' : 'none'}>
            {reviewing ? (
              <CaptionField
                value={caption}
                onChangeText={setCaption}
                placeholder={t('review.captionPlaceholder')}
              />
            ) : (
              <Pill onPhoto>
                <Txt variant="label" tone="faint">
                  {t('camera.captionHint')}
                </Txt>
              </Pill>
            )}
          </View>
        </View>

        {/* 3 — Hàng chụp / hàng gửi */}
        <View style={s.actionRow}>
          {reviewing ? (
            <>
              {/* Chỗ của "Lưu về máy" — chưa nối, nên chưa vẽ. Nút bấm không ăn
                  là thứ tệ nhất có thể để lại trên màn hình. Cần
                  expo-media-library + một lượt xin quyền ghi. */}
              <View style={s.slot} />

              <SendButton onPress={() => void send()} busy={busy} label={t('review.send')} />

              <View style={s.slot} />
            </>
          ) : (
            <>
              {/* Chỗ của "Mở thư viện ảnh" — chưa nối, cần expo-image-picker. */}
              <View style={s.slot} />

              <Shutter onPress={() => void capture()} busy={busy} label={t('camera.shutter')} />

              <IconButton label={t('camera.flip')} onPress={flip}>
                <Ionicons name="camera-reverse-outline" size={22} color={color.textMuted} />
              </IconButton>
            </>
          )}
        </View>

        {/* 4 — Chân màn. Lúc đang xem lại thì giữ CHỖ chứ không giữ nút: bỏ hẳn
            đi là ba khối trên bị kéo tụt xuống. */}
        {reviewing ? (
          <View style={s.footerSpacer} />
        ) : (
          <IconButton label={t('camera.openMoments')} onPress={onOpenFeed} style={s.footer}>
            <Col align="center">
              <Ionicons name="chevron-up" size={16} color={color.textFaint} />
              <Txt variant="faint" tone="faint">
                {t('camera.moments')}
              </Txt>
            </Col>
          </IconButton>
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  // space-between + flex:1 — chỗ thừa của máy dài rơi vào khoảng GIỮA các khối,
  // không rơi vào khung ngắm.
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.lg,
  },

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
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Giữ chỗ đúng bằng một IconButton để pill ở giữa đứng yên. */
  slot: { width: layout.minTouch },

  frame: { borderRadius: radius.frame, backgroundColor: color.surface, overflow: 'hidden' },
  captionSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: space.md,
    alignItems: 'center',
  },

  actionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xxxl + space.xs,
  },

  footer: { width: 'auto', paddingHorizontal: space.lg },
  footerSpacer: { height: layout.minTouch },
});
