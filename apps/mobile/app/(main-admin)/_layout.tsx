import { useAuth } from '@/context/AuthContext';
import { AppTheme } from '@/constants/Theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs } from 'expo-router';
import { Pressable, Text } from 'react-native';

function TabIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} name={name} color={color} style={{ marginBottom: -2 }} />;
}

export default function MainAdminLayout() {
  const { user, signOut } = useAuth();

  if (!user || user.role !== 'main_admin') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppTheme.accent,
        tabBarInactiveTintColor: AppTheme.textMuted,
        headerStyle: { backgroundColor: AppTheme.mainAdmin },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        headerRight: () => (
          <Pressable onPress={signOut} style={{ marginRight: 16 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Logout</Text>
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Network',
          tabBarIcon: ({ color }) => <TabIcon name="globe" color={color} />,
        }}
      />
      <Tabs.Screen
        name="branches"
        options={{
          title: 'Branches',
          tabBarIcon: ({ color }) => <TabIcon name="building" color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <TabIcon name="line-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
