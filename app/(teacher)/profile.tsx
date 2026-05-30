import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { StyleSheet, Text, View } from 'react-native';

export default function TeacherProfileScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Screen title="Profile">
        <View />
      </Screen>
    );
  }

  return (
    <Screen title="Profile" scroll>
      <Card style={styles.hero}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>Class Teacher</Text>
        <Text style={styles.branch}>Branch: {user.branchId ?? 'N/A'}</Text>
      </Card>

      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Subjects</Text>
          <Text style={styles.value}>{user.subjects?.join(', ') ?? 'Not assigned'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Classes assigned</Text>
          <Text style={styles.value}>{user.classIds?.length ?? 0}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>Teacher</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 28,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 8,
  },
  role: {
    fontSize: 15,
    color: AppTheme.primary,
    marginBottom: 4,
  },
  branch: {
    fontSize: 14,
    color: AppTheme.textMuted,
  },
  detailsCard: {
    paddingVertical: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.text,
  },
});