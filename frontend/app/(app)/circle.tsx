import { useCallback } from 'react';
import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleScreen } from '@/features/circle/screens/CircleScreen';
import { useT } from '@i18n';
import { FRIENDS } from '@/mocks/friends';

/** Link mời giả — khi có server thì lấy link thật (hạn 7 ngày) từ API. */
const INVITE_LINK = 'https://nook.app/i/demo';

export default function Circle() {
  const router = useRouter();
  const t = useT();

  // Bảng chia sẻ của hệ điều hành: Zalo, Messenger, tin nhắn… người dùng tự chọn.
  const invite = useCallback(() => {
    void Share.share({ message: t('friends.shareMessage', { link: INVITE_LINK }) });
  }, [t]);

  return (
    <CircleScreen
      friends={FRIENDS}
      onInvite={invite}
      onOpenFriend={(id) => router.push({ pathname: '/(app)/friend/[id]', params: { id } })}
      onClose={() => router.back()}
    />
  );
}
