import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PersonScreen, type PersonRelation } from '@/features/profile/screens/person/PersonScreen';
import { getPerson, type PersonProfile } from '@/features/profile/api/profileApi';
import { useProfile } from '@/features/profile/store/profileStore';
import { relationOf, useCircle } from '@/features/circle/store/circleStore';
import { useInvites } from '@/features/circle/hooks/useInvites';
import { useT } from '@i18n';
import { ME } from '@/mocks/moments';

export default function Person() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const friends = useCircle((s) => s.friends);
  const incoming = useCircle((s) => s.incoming);
  const requested = useCircle((s) => s.requested);
  const myName = useProfile((s) => s.name);
  const myUsername = useProfile((s) => s.username);
  const myAvatar = useProfile((s) => s.avatarUri);
  const myLocked = useProfile((s) => s.locked);
  const invites = useInvites();
  const self = id === ME.id;
  const relation: PersonRelation = self ? 'self' : relationOf(id, { friends, incoming, requested });
  const isFriend = relation === 'friend';

  const [loaded, setLoaded] = useState<{
    id: string;
    person: PersonProfile | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (self) return;
    let live = true;
    void getPerson(id, isFriend).then((res) => {
      if (!live) return;
      setLoaded(
        res.ok ? { id, person: res.person, error: null } : { id, person: null, error: res.message },
      );
    });
    return () => {
      live = false;
    };
  }, [id, isFriend, self]);

  // Trang của chính mình: dựng từ hồ sơ đang có, không hỏi mạng.
  const person: PersonProfile | null = self
    ? {
        id,
        name: myName ?? ME.name,
        username: myUsername ?? t('person.noUsername'),
        uri: myAvatar ?? undefined,
        locked: myLocked,
      }
    : loaded?.id === id
      ? loaded.person
      : null;
  const error = !self && loaded?.id === id ? loaded.error : null;

  return (
    <PersonScreen
      person={person}
      error={error}
      relation={relation}
      busy={invites.busy.has(id)}
      onInvite={() => void invites.request(id)}
      onAccept={() => person && void invites.accept(person)}
      onOpenPair={() => router.replace({ pathname: '/(app)/friend/[id]', params: { id } })}
      onClose={() => router.back()}
    />
  );
}
