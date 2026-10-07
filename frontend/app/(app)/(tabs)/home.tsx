import { useCallback, useEffect, useMemo } from 'react';
import { useIsFocused, useRouter } from 'expo-router';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import type { Shot } from '@/features/camera/components/CameraPage';
import type { Reaction } from '@/features/feed/components/MomentPage';
import type { Moment } from '@/features/feed/types';
import { useMoments } from '@/features/feed/store/momentsStore';
import { sendMoment } from '@/features/feed/lib/momentApi';
import { useAudience } from '@/features/camera/store/audienceStore';
import { useNotify } from '@/features/notify/store/notifyStore';
import { useChats } from '@/features/chat/store/chatStore';
import { useJournal } from '@/features/journal/store/journalStore';
import { useCircle } from '@/features/circle/store/circleStore';
import { useOnline } from '@/hooks/useOnline';
import { useHomeNav } from '@/features/home/store/homeNav';

export default function Home() {
  const router = useRouter();
  const focused = useIsFocused();
  const jump = useHomeNav((s) => s.jump);
  const setPage = useHomeNav((s) => s.setPage);
  const setReviewing = useHomeNav((s) => s.setReviewing);
  const online = useOnline();
  const friends = useCircle((s) => s.friends);
  const names = useMemo(() => friends.map((f) => f.name), [friends]);
  const audience = useMemo(
    () => friends.map((f) => ({ id: f.id, name: f.name, uri: f.uri })),
    [friends],
  );
  const defaultHidden = useAudience((s) => s.defaultHidden);
  const noticeUnread = useNotify((s) => s.notices.some((n) => !n.read));
  const loadNotices = useNotify((s) => s.load);
  useEffect(() => {
    void loadNotices();
  }, [loadNotices]);
  const taggable = useMemo(
    () => friends.map((f) => ({ id: f.id, name: f.name, username: f.username })),
    [friends],
  );
  const moments = useMoments((s) => s.moments);
  const add = useMoments((s) => s.add);
  const journal = useJournal((s) => s.entries);
  const addEntry = useJournal((s) => s.add);
  const markReplied = useMoments((s) => s.markReplied);
  const openAbout = useChats((s) => s.openAbout);
  const sendChat = useChats((s) => s.send);

  const send = useCallback(
    (shot: Shot) => {
      const at = Date.now();
      // Thông báo cho người được tag là việc của server (đẩy tin) — app chỉ gửi kèm danh sách.
      add(shot.uri, shot.caption, at, shot.tags, shot.video);
      // Feed thêm ngay trên máy; lên server chạy nền. Hỏng thì ảnh vẫn ở máy —
      // hàng đợi gửi lại khi có mạng (`.docs/03-offline.md`) chưa làm.
      void sendMoment({
        photo: shot.uri,
        video: shot.video,
        caption: shot.caption,
        tagIds: shot.tags.map((tg) => tg.id),
        hiddenFrom: shot.hiddenFrom,
      });
      addEntry(shot.uri, shot.caption, at);
    },
    [add, addEntry],
  );

  // Cảm xúc → gửi NGAY, ở lại. Nhắn chữ → mở cuộc trò chuyện, ảnh ghim ở đầu.
  const reply = useCallback(
    (m: Moment, r: Reaction | null) => {
      const id = openAbout(m.author, m.photo, m.caption);
      if (r) {
        sendChat(id, r.emoji, Date.now());
        markReplied(m.id);
        return;
      }
      router.push({ pathname: '/(app)/chat/[id]', params: { id } });
    },
    [markReplied, openAbout, router, sendChat],
  );

  return (
    <HomeScreen
      friendNames={names}
      taggable={taggable}
      offline={!online}
      onOpenPerson={(id) => router.push({ pathname: '/(app)/person/[id]', params: { id } })}
      moments={moments}
      onSend={send}
      onReply={reply}
      onOpenFriends={() => router.navigate('/(app)/(tabs)/circle')}
      onOpenNotices={() => router.push('/(app)/notifications')}
      noticeUnread={noticeUnread}
      journal={journal}
      onOpenJournal={() => router.push('/(app)/journal')}
      active={focused}
      audience={audience}
      defaultHidden={defaultHidden}
      jump={jump}
      onPageChange={setPage}
      onReviewChange={setReviewing}
    />
  );
}
