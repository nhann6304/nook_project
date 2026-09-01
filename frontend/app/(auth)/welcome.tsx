import { useRouter } from 'expo-router';
import { WelcomeScreen } from '@/features/auth/screens/WelcomeScreen';

export default function Welcome() {
  const router = useRouter();
  return (
    <WelcomeScreen
      onCreate={() => router.push('/(auth)/sign-in?intent=signup')}
      onSignIn={() => router.push('/(auth)/sign-in?intent=signin')}
    />
  );
}
