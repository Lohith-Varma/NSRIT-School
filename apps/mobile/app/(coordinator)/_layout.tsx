import { useAuth } from '@/context/AuthContext';
import { formatWing } from '@/constants/Wings';
import { AppTheme } from '@/constants/Theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

function TabIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} name={name} color={color} style={{ marginBottom: -2 }} />;
}

export default function CoordinatorLayout() {
  const { user, signOut } = useAuth();

  if (!user || user.role !== 'coordinator') {
    return <Redirect href="/(auth)/login" />;
  }

  const wingLabel = user.wing ? formatWing(user.wing) : 'Wing';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppTheme.coordinator,
        tabBarInactiveTintColor: AppTheme.textMuted,
        headerStyle: { backgroundColor: AppTheme.coordinator },
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
          title: wingLabel,
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
          headerTitle: () => (
            <View>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 17 }}>Coordinator</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>{wingLabel}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ color }) => <TabIcon name="graduation-cap" color={color} />,
        }}
      />
      <Tabs.Screen
        name="monitoring"
        options={{
          title: 'Monitoring',
          tabBarIcon: ({ color }) => <TabIcon name="eye" color={color} />,
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
