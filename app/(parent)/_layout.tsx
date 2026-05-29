import { ParentShell } from '@/components/parent/ParentShell';
import { useAuth } from '@/context/AuthContext';
import { Redirect, Stack } from 'expo-router';

export default function ParentLayout() {
  const { user } = useAuth();

  if (!user || user.role !== 'parent') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ParentShell>
      <Stack screenOptions={{ headerShown: false }} />
    </ParentShell>
  );
}
