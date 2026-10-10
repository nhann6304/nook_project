import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { IntroScreen } from '@/features/onboarding/screens/intro/IntroScreen';
import { useOnboarding } from '@/features/onboarding/store/onboardingStore';

export default function Intro() {
  const router = useRouter();
  const finishIntro = useOnboarding((s) => s.finishIntro);
  const done = useCallback(() => {
    finishIntro();
    router.replace('/(auth)/welcome');
  }, [finishIntro, router]);
  return <IntroScreen onDone={done} />;
}
