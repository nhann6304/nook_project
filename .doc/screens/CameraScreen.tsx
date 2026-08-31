/**
 * Nook — màn hình Camera (màn mặc định khi mở app).
 *
 * Điểm quan trọng nhất của file này:
 * khung ngắm tính theo CHIỀU NGANG máy (88%), không theo chiều dọc.
 * Máy dài hơn thì phần thừa thành khoảng thở, khung KHÔNG giãn ra.
 * Đây là lý do camera của Locket trông gọn còn phần lớn app clone thì nặng nề.
 *
 * Bốn khối, xếp dọc, không có gì khác:
 *   1. Thanh trên   — Nem · pill số bạn · cài đặt
 *   2. Khung ngắm   — vuông, bo 32, có pill caption nổi ở đáy
 *   3. Hàng chụp    — thư viện · nút chụp · đảo camera
 *   4. Chân màn     — "Khoảnh khắc"
 */
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen, Txt, Pill, IconButton, EmptyState } from '../components/ui';
import { color, layout, radius, space } from '../theme/tokens';

export default function CameraScreen({
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

  async function capture() {
    if (busy || !cam.current) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cam.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) onCapture(photo.uri);
    } finally {
      setBusy(false);
    }
  }

  if (!permission) return <Screen><View style={{ flex: 1 }} /></Screen>;

  // Xin quyền có giải thích lý do trước, không đẩy thẳng hộp thoại hệ thống.
  if (!permission.granted) {
    return (
      <Screen>
        <EmptyState
          message="Nook cần camera để bạn chụp khoảnh khắc gửi cho bạn bè. Ảnh chỉ đi tới những người trong góc của bạn."
          actionLabel="Cho phép camera"
          onAction={requestPermission}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={s.root}>
        {/* 1 — Thanh trên */}
        <View style={s.topBar}>
          <IconButton label="Nook" onPress={onOpenCircle}>
            <View style={s.mark}>
              <Ionicons name="ellipse" size={18} color={color.accent} />
            </View>
          </IconButton>

          <Pill onPress={onOpenCircle}>
            <Txt variant="body">{`Góc của bạn · ${friendCount}`}</Txt>
          </Pill>

          <IconButton label="Cài đặt" onPress={onOpenSettings}>
            <Ionicons name="settings-outline" size={20} color={color.textMuted} />
          </IconButton>
        </View>

        {/* 2 — Khung ngắm: vuông, khoá theo chiều ngang */}
        <View style={[s.frame, { width: frame, height: frame }]}>
          <CameraView ref={cam} style={StyleSheet.absoluteFill} facing={facing} />
          <View style={s.captionSlot} pointerEvents="none">
            <View style={s.captionPill}>
              <Txt variant="label" faint>Thêm một dòng…</Txt>
            </View>
          </View>
        </View>

        {/* 3 — Hàng chụp */}
        <View style={s.shutterRow}>
          <IconButton label="Mở thư viện" onPress={() => {}}>
            <Ionicons name="images-outline" size={22} color={color.textMuted} />
          </IconButton>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chụp khoảnh khắc"
            accessibilityState={{ busy }}
            onPress={capture}
            style={({ pressed }) => [s.shutterRing, { transform: [{ scale: pressed ? 0.92 : 1 }] }]}
          >
            <View style={s.shutterCore} />
          </Pressable>

          <IconButton
            label="Đổi camera trước sau"
            onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
          >
            <Ionicons name="camera-reverse-outline" size={22} color={color.textMuted} />
          </IconButton>
        </View>

        {/* 4 — Chân màn */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Xem khoảnh khắc của bạn bè"
          onPress={onOpenFeed}
          style={s.footer}
          hitSlop={12}
        >
          <Ionicons name="chevron-up" size={16} color={color.textFaint} />
          <Txt variant="label" faint>Khoảnh khắc</Txt>
        </Pressable>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  // justifyContent 'space-between' + flex:1 — chỗ thừa của máy dài rơi vào
  // khoảng giữa các khối, không rơi vào khung ngắm.
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
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: color.surface,
    alignItems: 'center', justifyContent: 'center',
  },

  frame: {
    borderRadius: radius.frame,
    backgroundColor: color.surface,
    overflow: 'hidden',
  },
  captionSlot: {
    position: 'absolute', left: 0, right: 0, bottom: space.md,
    alignItems: 'center',
  },
  captionPill: {
    backgroundColor: 'rgba(14,13,12,0.6)',
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 1,
  },

  shutterRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xxxl + space.xs,
  },
  shutterRing: {
    width: 66, height: 66, borderRadius: 33,
    borderWidth: 3, borderColor: color.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  shutterCore: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: color.accent,
  },

  footer: { alignItems: 'center', minHeight: layout.minTouch, justifyContent: 'center' },
});
