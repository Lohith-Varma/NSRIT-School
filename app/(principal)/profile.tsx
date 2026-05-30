import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { StyleSheet, Text, View } from 'react-native';

export default function PrincipalProfileScreen() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <Screen scroll>
      <Card style={styles.heroCard}>
        <View style={styles.avatar}>{initials ? <Text style={styles.avatarText}>{initials}</Text> : null}</View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>Principal</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusBadge}>Active</Text>
          <Text style={styles.statusHint}>Profile completion: 100%</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Professional details</Text>
        <Detail label="Branch" value={user.branchId ?? 'N/A'} />
        <Detail label="Employee ID" value={user.id} />
        <Detail label="Role" value="Principal" />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Contact</Text>
        <Detail label="Email" value={user.email} />
        <Detail label="Location" value={user.branchId ?? 'Branch unavailable'} />
      </Card>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: AppTheme.admin.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: AppTheme.admin.onPrimaryFixed,
    fontSize: 34,
    fontWeight: '700',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: AppTheme.principal,
    marginBottom: 6,
  },
  role: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.admin.secondary,
    marginBottom: 14,
  },
  statusRow: {
    alignItems: 'center',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.admin.onPrimaryContainer,
    backgroundColor: AppTheme.admin.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  statusHint: {
    marginTop: 10,
    fontSize: 12,
    color: AppTheme.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 14,
  },
  detailRow: {
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: AppTheme.text,
    fontWeight: '600',
  },
});
