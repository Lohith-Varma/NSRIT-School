import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
export default function Index() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  switch (user.role) {
    case 'main_admin':
      return <Redirect href="/(main-admin)" />;
    case 'branch_admin':
      return <Redirect href="/(branch-admin)" />;
    case 'principal':
      return <Redirect href="/(principal)" />;
    case 'coordinator':
      return <Redirect href="/(coordinator)" />;
    case 'teacher':
      return <Redirect href="/(teacher)" />;
    case 'parent':
      return <Redirect href="/(parent)" />;
    default:
      return <Redirect href="/(auth)/login" />;
  }
}
