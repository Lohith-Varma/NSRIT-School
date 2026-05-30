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

export default function BranchAdminLayout() {
  const { user } = useAuth();

  if (!user || user.role !== 'branch_admin') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <AdminShell role="branch_admin" subtitle="Management Portal">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: AppTheme.branchAdmin,
          tabBarInactiveTintColor: AppTheme.textMuted,
          tabBarStyle: {
            backgroundColor: AppTheme.admin.surfaceContainerLowest,
            borderTopColor: AppTheme.admin.surfaceContainerHighest,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="classes"
          options={{
            title: 'Courses',
            tabBarIcon: ({ color }) => <TabIcon name="book" color={color} />,
          }}
        />
        <Tabs.Screen
          name="teachers"
          options={{
            title: 'Staff',
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
          name="branch"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabIcon name="cog" color={color} />,
          }}
        />
        <Tabs.Screen name="staff" options={{ href: null }} />
        <Tabs.Screen name="students" options={{ href: null }} />
        <Tabs.Screen name="students-add" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="teachers-add" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="assign-teacher" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="attendance-correction" options={{ href: null }} />
        <Tabs.Screen name="financial-monitoring" options={{ href: null }} />
        <Tabs.Screen name="fees" options={{ href: null }} />
        <Tabs.Screen name="fees-lookup" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="courses-add" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="courses-manage" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="notifications-compose" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="reset-password" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="profile-details" options={{ href: null }} />
      </Tabs>
    </AdminShell>
  );
}
