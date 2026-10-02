import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { openSettings } from 'expo-linking';
import { NearbyScreen } from '@/features/nearby/screens/NearbyScreen';
import { useNearby } from '@/features/nearby/lib/useNearby';
import { relationOf, useCircle } from '@/features/circle/store/circleStore';
import { useInvites } from '@/features/circle/lib/useInvites';

export default function Nearby() {
  const router = useRouter();
  const nearby = useNearby();
  const invites = useInvites();
  const friends = useCircle((s) => s.friends);
  const incoming = useCircle((s) => s.incoming);
  const requested = useCircle((s) => s.requested);

  const people = useMemo(
    () =>
      nearby.people.map((p) => ({
        ...p,
        relation: relationOf(p.id, { friends, incoming, requested }),
      })),
    [friends, incoming, nearby.people, requested],
  );

  return (
    <NearbyScreen
      status={nearby.status}
      radius={nearby.radius}
      people={people}
      left={nearby.left}
      busy={invites.busy}
      onRadius={nearby.setRadius}
      onStart={() => void nearby.start()}
      onStop={nearby.stop}
      onOpenSettings={() => void openSettings()}
      onRequest={(id) => void invites.request(id)}
      onAccept={(p) => void invites.accept(p)}
      onOpenPerson={(id) => router.push({ pathname: '/(app)/person/[id]', params: { id } })}
      onClose={() => router.back()}
    />
  );
}
