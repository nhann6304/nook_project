/**
 * Kiểu bản đồ (Google Maps, Android) dựng từ bảng màu đang dùng — bản đồ nền
 * của "Tìm quanh đây" đổi theo cảnh như mọi thứ khác, không phải bản đồ mặc
 * định trắng xoá. iOS dùng Apple Maps: chỉ đổi được sáng/tối (`light`).
 */
import type { Palette } from './palettes';

export function mapStyleFor(c: Palette) {
  return [
    { elementType: 'geometry', stylers: [{ color: c.surfaceSunken }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: c.textFaint }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: c.bg }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: c.surfaceRaised }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: c.border }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: c.border }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: c.accentSoft }] },
  ];
}
