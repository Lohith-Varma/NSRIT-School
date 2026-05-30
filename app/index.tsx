import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  // Prevent redirect before auth finishes loading
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: AppTheme.background,
        }}
      >
        <ActivityIndicator
          size="large"
          color={AppTheme.primary}
        />
      </View>
    );
  }

  // User not logged in
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Role-based routing
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
