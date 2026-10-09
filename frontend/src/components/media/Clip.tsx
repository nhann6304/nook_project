/**
 * Video ngắn của khoảnh khắc — lặp, không nút điều khiển, phủ kín khung như ảnh.
 *
 * Mượt trước đã: CHỈ dựng khi đang xem (`playing`). Người gọi để ảnh bìa nằm
 * dưới, nên lúc trình phát chưa kịp ra hình vẫn thấy ảnh, không thấy ô đen.
 * Một khung một trình phát — lướt qua năm video là năm trình phát lần lượt,
 * không phải năm cái chạy cùng lúc.
 */
import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

export const Clip = memo(function Clip({ uri, playing }: { uri: string; playing: boolean }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (playing) player.play();
    else player.pause();
  }, [player, playing]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
      pointerEvents="none"
    />
  );
});
