import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { FeedScreen } from '@/features/feed/screens/FeedScreen';
import { useMoments } from '@/features/feed/store/momentsStore';
import type { Moment } from '@/features/feed/types';

export default function Feed() {
  const router = useRouter();
  const moments = useMoments((s) => s.moments);
  const markReplied = useMoments((s) => s.markReplied);

  // Bấm icon cảm xúc là gửi RIÊNG cho người đó — không phải "thích" công khai.
  // Ô nhắn chữ sẽ mở màn Trò chuyện (đặc tả màn 10), chưa dựng; tạm thời cả hai
  // đường đều ghi nhận là đã đáp lại.
  const reply = useCallback(
    (moment: Moment) => markReplied(moment.id),
    [markReplied],
  );

  return <FeedScreen moments={moments} onOpenCamera={() => router.back()} onReply={reply} />;
}
