import { useAuth } from '@/context/AuthContext';
import { Redirect, Stack } from 'expo-router';

export default function StudentLayout() {
  const { user } = useAuth();

  if (!user || user.role !== 'student') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
