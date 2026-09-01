/**
 * Màn xin quyền camera.
 *
 * ── Cái bẫy mà file này tồn tại để tránh ──────────────────────────────────
 * `requestPermission()` chỉ bung hộp thoại hệ thống ĐÚNG MỘT LẦN. Người dùng
 * bấm "Không cho phép" là từ lần thứ hai trở đi hàm đó trả về ngay lập tức với
 * `granted: false, canAskAgain: false` — không có hộp thoại nào, không có lỗi
 * nào. Nếu màn hình chỉ có một nút gọi thẳng `requestPermission` thì nút đó im
 * lặng chết: bấm bao nhiêu lần cũng không có gì xảy ra, và người dùng không có
 * cách nào biết vì sao. Camera lại là màn mặc định của Nook, nên nó khoá luôn
 * cả app.
 *
 * Ba việc phải làm cho đủ, thiếu một cái là vẫn kẹt:
 *   1. Đọc `canAskAgain` để biết còn hỏi được không, rồi ĐỔI CHỮ và ĐỔI NÚT —
 *      hết hỏi được thì nút phải mở Cài đặt máy chứ không hỏi lại.
 *   2. Nghe `AppState`. Người dùng bật quyền trong Cài đặt máy rồi quay lại,
 *      `useCameraPermissions` KHÔNG tự đọc lại — không có bước này thì họ vừa
 *      bật xong quay về vẫn thấy y nguyên màn "camera đang tắt".
 *   3. Chừa một lối đi tiếp. Không cho quyền vẫn phải xem được Khoảnh khắc,
 *      không thì màn này là ngõ cụt.
 */
import { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet } from 'react-native';
import { openSettings } from 'expo-linking';
import type { PermissionResponse } from 'expo-camera';
import { Button, Col, EmptyState, Screen } from '@ui';
import { layout, space } from '@design';
import { useT } from '@i18n';

export function CameraPermission({
  permission,
  onRequest,
  onRefresh,
  onSkip,
}: {
  permission: PermissionResponse;
  /** Bung hộp thoại hệ thống. Chỉ ăn khi `canAskAgain` còn true. */
  onRequest: () => Promise<PermissionResponse>;
  /** Đọc lại quyền từ hệ thống, không bung hộp thoại nào. */
  onRefresh: () => Promise<PermissionResponse>;
  onSkip: () => void;
}) {
  const t = useT();
  const [asking, setAsking] = useState(false);
  const blocked = !permission.canAskAgain;

  // Quay lại app từ Cài đặt máy thì đọc lại quyền. Thiếu đoạn này là người
  // dùng bật quyền xong quay về vẫn thấy màn cũ, tưởng app hỏng.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void onRefresh();
    });
    return () => sub.remove();
  }, [onRefresh]);

  const ask = useCallback(async () => {
    if (blocked) {
      // Hệ thống không hỏi lại nữa — chỉ còn đường vào Cài đặt máy.
      await openSettings();
      return;
    }
    setAsking(true);
    try {
      await onRequest();
    } finally {
      setAsking(false);
    }
  }, [blocked, onRequest]);

  return (
    <Screen>
      <EmptyState
        title={blocked ? t('camera.permission.blockedTitle') : t('camera.permission.title')}
        message={blocked ? t('camera.permission.blockedMessage') : t('camera.permission.message')}
        actionLabel={blocked ? t('common.openSettings') : t('camera.permission.allow')}
        onAction={() => void ask()}
        loading={asking}
      />

      <Col style={s.escape}>
        <Button label={t('camera.permission.skip')} variant="ghost" onPress={onSkip} block />
      </Col>
    </Screen>
  );
}

const s = StyleSheet.create({
  escape: { paddingBottom: space.lg, maxWidth: layout.maxTextWidth, width: '100%', alignSelf: 'center' },
});
