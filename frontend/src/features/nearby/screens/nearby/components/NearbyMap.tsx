/**
 * Bản đồ đường phố quanh CHÍNH MÌNH, nằm dưới radar. Chỉ là nền: không kéo,
 * không zoom, không ghim ai — vị trí người khác server không bao giờ trả, nên
 * avatar trên radar xếp theo nấc khoảng cách chứ không phải chỗ thật của họ.
 *
 * Khung bản đồ vừa đúng đường kính bán kính đang chọn (×1.15 cho có lề).
 * Android dùng `liteMode`: ảnh tĩnh của bản đồ, nhẹ hơn hẳn bản đồ sống.
 */
import { memo, useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { mapStyleFor, useColors } from '@design';

const METERS_PER_DEGREE = 111_000;

export const NearbyMap = memo(function NearbyMap({
  center,
  radius,
}: {
  center: { latitude: number; longitude: number };
  radius: number;
}) {
  const c = useColors();
  const style = useMemo(() => mapStyleFor(c), [c]);
  const delta = (radius * 2 * 1.15) / METERS_PER_DEGREE;

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      region={{ ...center, latitudeDelta: delta, longitudeDelta: delta }}
      customMapStyle={style}
      userInterfaceStyle={c.light ? 'light' : 'dark'}
      liteMode={Platform.OS === 'android'}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      showsCompass={false}
      showsPointsOfInterests={false}
      pointerEvents="none"
    />
  );
});
