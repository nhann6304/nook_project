/**
 * Một sticker — hình SVG nhiều màu (Fluent Emoji), vẽ bằng `SvgXml`. Dùng ở
 * bong bóng tin và ở bảng chọn. Mã lạ (tin cũ từ bản app mới hơn) thì thôi
 * không vẽ, không văng lỗi.
 */
import { memo } from 'react';
import { SvgXml } from 'react-native-svg';
import { STICKERS, type StickerId } from '../utils/stickers.generated';

export const Sticker = memo(function Sticker({ id, size }: { id: StickerId; size: number }) {
  const xml = STICKERS[id] as string | undefined;
  if (!xml) return null;
  return <SvgXml xml={xml} width={size} height={size} />;
});
