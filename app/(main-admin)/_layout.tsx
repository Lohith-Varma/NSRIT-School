import { AdminShell } from '@/components/admin/AdminShell';
import { useAuth } from '@/context/AuthContext';
import { AppTheme } from '@/constants/Theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs } from 'expo-router';

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
  const { user } = useAuth();

  if (!user || user.role !== 'main_admin') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <AdminShell role="main_admin" subtitle="Secure Session Active">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: AppTheme.accent,
          tabBarInactiveTintColor: AppTheme.textMuted,
          tabBarStyle: {
            backgroundColor: AppTheme.admin.surfaceContainerLowest,
            borderTopColor: AppTheme.admin.surfaceContainerHighest,
          },
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
        <Tabs.Screen name="security" options={{ href: null }} />
        <Tabs.Screen name="audit-logs" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="notifications-compose" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="users" options={{ href: null }} />
        <Tabs.Screen name="users-create" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="fees" options={{ href: null }} />
      </Tabs>
    </AdminShell>
  );
}
