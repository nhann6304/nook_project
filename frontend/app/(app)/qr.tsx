import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useT } from '@i18n';
import { QrScreen } from '@/features/profile/screens/QrScreen';
import { useProfile } from '@/features/profile/store/profileStore';
import { profileLink } from '@/features/circle/lib/inviteLink';
import { ME } from '@/mocks/moments';

export default function Qr() {
  const router = useRouter();
  const t = useT();
  const name = useProfile((s) => s.name);
  const username = useProfile((s) => s.username);
  const photo = useProfile((s) => s.avatarUri);
  const link = profileLink(username);
  return (
    <QrScreen
      name={name ?? ME.name}
      username={username}
      photo={photo ?? undefined}
      link={link}
      onShare={() => void Share.share({ message: t('qr.shareMessage', { link }) })}
      onClose={() => router.back()}
    />
  );
}
