/**
 * Màn Camera — màn mặc định khi mở app.
 *
 * Điểm quan trọng nhất của file này: khung ngắm tính theo CHIỀU NGANG máy
 * (88%), không theo chiều dọc. Máy dài hơn thì phần thừa thành khoảng thở,
 * khung KHÔNG giãn ra. Đây là lý do camera của Locket trông gọn còn phần lớn
 * app bắt chước thì nặng nề — và là câu trả lời cho "iPhone SE và iPhone Pro
 * Max có vừa cả hai không": vừa, vì chiều dọc không tham gia vào phép tính.
 *
 * Bốn khối, xếp dọc, không có gì khác:
 *   1. Thanh trên   — dấu hiệu · pill số bạn · cài đặt
 *   2. Khung ngắm   — vuông, bo 32, có pill caption nổi ở đáy
 *   3. Hàng chụp    — thư viện · nút chụp · đảo camera
 *   4. Chân màn     — "Khoảnh khắc"
 */
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Col, EmptyState, IconButton, Pill, Rings, Screen, Txt } from '@ui';
import { color, common, layout, radius, space } from '@design';
import * as feel from '@/lib/haptics';
import { Shutter } from '../components/Shutter';

export function CameraScreen({
  friendCount,
  onOpenCircle,
  onOpenSettings,
  onOpenFeed,
  onCapture,
}: {
  friendCount: number;
  onOpenCircle: () => void;
  onOpenSettings: () => void;
  onOpenFeed: () => void;
  onCapture: (uri: string) => void;
}) {
  const { width } = useWindowDimensions();
  const frame = Math.round(width * layout.cameraFrameRatio);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [busy, setBusy] = useState(false);
  const cam = useRef<CameraView>(null);

  const capture = useCallback(async () => {
    if (busy || !cam.current) return;
    setBusy(true);
    feel.capture();
    try {
      const photo = await cam.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) onCapture(photo.uri);
    } finally {
      setBusy(false);
    }
  }, [busy, onCapture]);

  const flip = useCallback(() => {
    setFacing((f) => (f === 'front' ? 'back' : 'front'));
  }, []);

  if (!permission) return <Screen><View style={common.fill} /></Screen>;

  // Xin quyền có giải thích lý do TRƯỚC, không đẩy thẳng hộp thoại hệ thống.
  // Người dùng bấm "Không cho phép" ở hộp thoại hệ thống là mất luôn, lần sau
  // phải vào Cài đặt máy mới mở lại được.
  if (!permission.granted) {
    return (
      <Screen>
        <EmptyState
          title="Nook cần camera"
          message="Để bạn chụp khoảnh khắc gửi cho bạn bè. Ảnh chỉ đi tới những người trong góc của bạn, không đi đâu khác."
          actionLabel="Cho phép camera"
          onAction={requestPermission}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <View style={s.root}>
        {/* 1 — Thanh trên */}
        <View style={s.topBar}>
          <IconButton label="Góc của bạn" onPress={onOpenCircle}>
            <View style={s.mark}>
              <Rings size={26} />
            </View>
          </IconButton>

          <Pill onPress={onOpenCircle}>
            <Txt variant="label">{`Góc của bạn · ${friendCount}`}</Txt>
          </Pill>

          <IconButton label="Cài đặt" onPress={onOpenSettings}>
            <Ionicons name="settings-outline" size={20} color={color.textMuted} />
          </IconButton>
        </View>

        {/* 2 — Khung ngắm: vuông, khoá theo chiều ngang */}
        <View style={[s.frame, { width: frame, height: frame }]}>
          <CameraView ref={cam} style={common.absoluteFill} facing={facing} />
          <View style={s.captionSlot} pointerEvents="none">
            <Pill onPhoto>
              <Txt variant="label" tone="faint">
                Thêm một dòng…
              </Txt>
            </Pill>
          </View>
        </View>

        {/* 3 — Hàng chụp */}
        <View style={s.shutterRow}>
          <IconButton label="Mở thư viện ảnh" onPress={() => {}}>
            <Ionicons name="images-outline" size={22} color={color.textMuted} />
          </IconButton>

          <Shutter onPress={capture} busy={busy} />

          <IconButton label="Đổi camera trước sau" onPress={flip}>
            <Ionicons name="camera-reverse-outline" size={22} color={color.textMuted} />
          </IconButton>
        </View>

        {/* 4 — Chân màn */}
        <IconButton label="Xem khoảnh khắc của bạn bè" onPress={onOpenFeed} style={s.footer}>
          <Col align="center">
            <Ionicons name="chevron-up" size={16} color={color.textFaint} />
            <Txt variant="faint" tone="faint">
              Khoảnh khắc
            </Txt>
          </Col>
        </IconButton>
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

  frame: { borderRadius: radius.frame, backgroundColor: color.surface, overflow: 'hidden' },
  captionSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: space.md,
    alignItems: 'center',
  },

  shutterRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xxxl + space.xs,
  },

  footer: { width: 'auto', paddingHorizontal: space.lg },
});
