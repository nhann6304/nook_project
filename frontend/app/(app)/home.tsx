import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import type { Shot } from '@/features/camera/components/CameraPage';
import type { Reaction } from '@/features/feed/components/MomentPage';
import type { Moment } from '@/features/feed/types';
import { useMoments } from '@/features/feed/store/momentsStore';
import { useChats } from '@/features/chat/store/chatStore';
import { lastMessage } from '@/features/chat/types';
import { useJournal } from '@/features/journal/store/journalStore';
import { useCircle } from '@/features/circle/store/circleStore';
import { useOnline } from '@/hooks/useOnline';

export default function Home() {
  const router = useRouter();
  const online = useOnline();
  const friends = useCircle((s) => s.friends);
  const names = useMemo(() => friends.map((f) => f.name), [friends]);
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
  const unread = useChats((s) => s.conversations.some((c) => lastMessage(c)?.mine === false));

  const send = useCallback(
    (shot: Shot) => {
      const at = Date.now();
      // Thông báo cho người được tag là việc của server (đẩy tin) — app chỉ gửi kèm danh sách.
      add(shot.uri, shot.caption, at, shot.tags);
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
      unread={unread}
      onSend={send}
      onReply={reply}
      onOpenFriends={() => router.push('/(app)/circle')}
      onOpenChats={() => router.push('/(app)/chats')}
      onOpenMore={() => router.push('/(app)/settings')}
      journal={journal}
      onOpenJournal={() => router.push('/(app)/journal')}
    />
  );
}
