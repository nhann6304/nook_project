import { useRouter } from 'expo-router';
import { EmptyState, Screen } from '@ui';
import { useT } from '@i18n';

export default function NotFound() {
  const router = useRouter();
  const t = useT();

  return (
    <Screen>
      <EmptyState
        title={t('notFound.title')}
        message={t('notFound.message')}
        actionLabel={t('notFound.home')}
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}
