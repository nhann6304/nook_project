import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { FeedScreen } from '@/features/feed/screens/FeedScreen';
import { useMoments } from '@/features/feed/store/momentsStore';
import type { Moment } from '@/features/feed/types';
import type { Quick } from '@/features/feed/components/MomentCard';
import { useChats } from '@/features/chat/store/chatStore';

export default function Feed() {
  const router = useRouter();
  const moments = useMoments((s) => s.moments);
  const markReplied = useMoments((s) => s.markReplied);
  const openAbout = useChats((s) => s.openAbout);
  const send = useChats((s) => s.send);

  /**
   * Hai đường đáp lại, cố ý khác nhau:
   *
   *   icon cảm xúc → gửi NGAY và ở lại feed. Nhanh là cả điểm của nó; bắt
   *   chuyển màn cho một cái emoji là làm chậm đúng thứ cần nhanh nhất.
   *
   *   ô nhắn chữ → mở màn Trò chuyện, có tấm ảnh ghim sẵn ở đầu làm ngữ cảnh.
   *
   * Cả hai đều đi qua `openAbout` để tấm ảnh được ghim đúng, và để một người
   * luôn chỉ có ĐÚNG MỘT cuộc trò chuyện.
   */
  const reply = useCallback(
    (moment: Moment, emoji: Quick | null) => {
      const id = openAbout(moment.author, moment.photo, moment.caption);
      if (emoji) {
        send(id, emoji, Date.now());
        markReplied(moment.id);
        return;
      }
      router.push({ pathname: '/(app)/chat/[id]', params: { id } });
    },
    [markReplied, openAbout, router, send],
  );

  return (
    <FeedScreen
      moments={moments}
      onOpenCamera={() => router.navigate('/(app)/(tabs)/camera')}
      onReply={reply}
    />
  );
}
