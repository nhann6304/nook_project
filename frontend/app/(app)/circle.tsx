import { useCallback, useMemo } from 'react';
import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleScreen } from '@/features/circle/screens/CircleScreen';
import { relationOf, useCircle } from '@/features/circle/store/circleStore';
import { useFriendSearch } from '@/features/circle/lib/useFriendSearch';
import { useInvites } from '@/features/circle/lib/useInvites';
import { useT } from '@i18n';
import { INVITE_LINK } from '@/features/circle/lib/inviteLink';


export default function Circle() {
  const router = useRouter();
  const t = useT();
  const friends = useCircle((s) => s.friends);
  const incoming = useCircle((s) => s.incoming);
  const requested = useCircle((s) => s.requested);
  const search = useFriendSearch();
  const invites = useInvites();

  // Người đã trong góc hiện ở mục "Trong góc của bạn" rồi, đừng hiện lần hai.
  const people = useMemo(
    () =>
      search.people
        .map((p) => ({ ...p, relation: relationOf(p.id, { friends, incoming, requested }) }))
        .filter((p) => p.relation !== 'friend'),
    [friends, incoming, requested, search.people],
  );

  // Bảng chia sẻ của hệ điều hành: Zalo, Messenger, tin nhắn… người dùng tự chọn.
  const invite = useCallback(() => {
    void Share.share({ message: t('friends.shareMessage', { link: INVITE_LINK }) });
  }, [t]);

  return (
    <CircleScreen
      friends={friends}
      onBack={() => router.back()}
      onOpenQr={() => router.push('/(app)/qr')}
      onInvite={invite}
      onOpenNearby={() => router.push('/(app)/nearby')}
      onOpenFriend={(id) => router.push({ pathname: '/(app)/friend/[id]', params: { id } })}
      query={search.query}
      onQueryChange={search.setQuery}
      people={people}
      searching={search.searching}
      incoming={incoming}
      busy={invites.busy}
      onRequest={(id) => void invites.request(id)}
      onAccept={(p) => void invites.accept(p)}
      onDecline={(id) => void invites.decline(id)}
      error={invites.error ?? search.error}
    />
  );
}
