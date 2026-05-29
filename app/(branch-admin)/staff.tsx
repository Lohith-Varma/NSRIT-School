import { HubActionCard } from '@/components/branch-admin/HubActionCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatGrid } from '@/components/admin/AdminStatGrid';
import { Screen } from '@/components/ui/Screen';
import { useActor } from '@/hooks/useActor';
import { getStaffHubStats } from '@/services/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { BranchStaffHubStats } from '@/types/branchAdmin';

export default function StaffManagementHubScreen() {
  const router = useRouter();
  const actor = useActor();
  const [stats, setStats] = useState<BranchStaffHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStaffHubStats(actor).then(setStats).finally(() => setLoading(false));
  }, [actor]);

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="Staff Management"
        subtitle="Manage teachers, coordinators, and branch personnel."
      />
      {stats ? (
        <AdminStatGrid
          items={[
            { label: 'Total Students', value: String(stats.totalStudents) },
            { label: 'Active', value: String(stats.activeStudents) },
            { label: 'On Leave', value: String(stats.onLeave) },
            { label: 'Reg. Issues', value: String(stats.regIssues), tone: 'error' },
          ]}
        />
      ) : null}
      <View style={styles.grid}>
        <HubActionCard
          title="Manage Students"
          icon="school"
          primary={{ label: 'Add New Student', onPress: () => router.push('/(branch-admin)/students-add' as never) }}
          secondary={{ label: 'View Student Registry', onPress: () => router.push('/(branch-admin)/students' as never) }}
        />
        <HubActionCard
          title="Manage Staff"
          icon="groups"
          iconColor="#006a60"
          primary={{ label: 'Add New Teacher', onPress: () => router.push('/(branch-admin)/teachers-add' as never) }}
          secondary={{ label: 'View Teacher Directory', onPress: () => router.push('/(branch-admin)/teachers' as never) }}
        />
        <HubActionCard
          title="Manage Class Assignments"
          icon="assignment-ind"
          primary={{
            label: 'Assign Class Teacher',
            onPress: () => router.push('/(branch-admin)/assign-teacher' as never),
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 24, marginTop: 8 },
});
