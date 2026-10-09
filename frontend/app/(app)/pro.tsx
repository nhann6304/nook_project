import { useRouter } from 'expo-router';
import { useNumber, useT } from '@i18n';
import { ProScreen } from '@/features/pro/screens/pro/ProScreen';
import { PRO_PLANS, TRIAL_DAYS, startTrial } from '@/features/pro/api/proApi';

export default function Pro() {
  const router = useRouter();
  const t = useT();
  const num = useNumber();
  return (
    <ProScreen
      plans={PRO_PLANS}
      trialDays={TRIAL_DAYS}
      onStart={startTrial}
      onBack={() => router.back()}
      formatPrice={(vnd) => t('pro.vnd', { amount: num(vnd) })}
    />
  );
}
