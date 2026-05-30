import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
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

export default function PrincipalLayout() {
  const { user, signOut } = useAuth();

  if (!user || user.role !== 'principal') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppTheme.principal,
        tabBarInactiveTintColor: AppTheme.textMuted,
        headerStyle: { backgroundColor: AppTheme.principal },
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
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color }) => <TabIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="teachers"
        options={{
          title: 'Teachers',
          tabBarIcon: ({ color }) => <TabIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <TabIcon name="bar-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen name="attendance" options={{ href: null }} />
      <Tabs.Screen name="fees" options={{ href: null }} />
    </Tabs>
  );
}
