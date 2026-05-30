import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminStatGrid } from '@/components/admin/AdminStatGrid';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listDirectoryUsers, listRoleConfigs } from '@/services/api';
import type { AdminDirectoryUser, AdminRoleConfig } from '@/types/admin';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function UserRoleManagementScreen() {
  const actor = useActor();
  const router = useRouter();
  const [users, setUsers] = useState<AdminDirectoryUser[]>([]);
  const [roles, setRoles] = useState<AdminRoleConfig[]>([]);
  const [search, setSearch] = useState('');
  const [branchName, setBranchName] = useState('Enter New Branch Name');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([listDirectoryUsers(actor), listRoleConfigs(actor)]);
      setUsers(u);
      setRoles(r);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  return (
    <Screen loading={loading} scroll embedded>
      <AdminCard style={styles.branchContext}>
        <Text style={styles.branchLabel}>Branch Context</Text>
        <TextInput
          style={styles.branchInput}
          value={branchName}
          onChangeText={setBranchName}
          placeholder="Enter Branch Name"
        />
        <Text style={styles.branchId}>Branch ID: [Auto-generated]</Text>
      </AdminCard>

      <AdminPageHeader
        title="User & Role Management"
        subtitle="Manage administrative access and permissions across the platform."
        action={
          <Pressable
            style={styles.createBtn}
            onPress={() => router.push('/(main-admin)/users-create' as never)}>
            <Text style={styles.createBtnText}>Create User</Text>
          </Pressable>
        }
      />

      <AdminStatGrid
        items={[
          { label: 'Total Users', value: '1,248' },
          { label: 'Main Admins', value: '12' },
          { label: 'Branch Admins', value: '45' },
          { label: 'Pending', value: '7' },
        ]}
      />

      <AdminCard style={styles.directory}>
        <View style={styles.directoryHeader}>
          <Text style={styles.directoryTitle}>Directory</Text>
          <AdminSearchBar value={search} onChangeText={setSearch} placeholder="Search users..." />
        </View>
        {filtered.map((user) => (
          <View key={user.id} style={styles.userRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitials}>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{user.role}</Text>
              </View>
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.dept}>{user.department}</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </AdminCard>

      <Text style={styles.section}>Role Configuration</Text>
      {roles.map((role) => (
        <AdminCard key={role.id} style={role.selected ? styles.roleSelected : undefined}>
          <Text style={styles.roleName}>{role.name}</Text>
          <Text style={styles.roleDesc}>{role.description}</Text>
          <View style={styles.tagRow}>
            {role.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </AdminCard>
      ))}

      <Pressable style={styles.createBranchBtn}>
        <Text style={styles.createBranchText}>Create Branch</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  branchContext: { marginBottom: 8 },
  branchLabel: { fontSize: 14, fontWeight: '600', color: AppTheme.textMuted, marginBottom: 8 },
  branchInput: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: AppTheme.surface,
  },
  branchId: { fontSize: 13, color: AppTheme.textMuted, marginTop: 8 },
  createBtn: {
    backgroundColor: AppTheme.admin.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: AppTheme.radius.lg,
  },
  createBtnText: { color: '#fff', fontWeight: '600' },
  directory: { marginTop: 16 },
  directoryHeader: { marginBottom: 12 },
  directoryTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: AppTheme.text },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: AppTheme.admin.surfaceContainerHigh,
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppTheme.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitials: { fontWeight: '700', color: AppTheme.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: AppTheme.text },
  userEmail: { fontSize: 12, color: AppTheme.textMuted },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AppTheme.admin.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '600', color: AppTheme.admin.onPrimaryContainer },
  userMeta: { alignItems: 'flex-end' },
  dept: { fontSize: 12, color: AppTheme.textMuted },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AppTheme.accent },
  statusText: { fontSize: 12, color: AppTheme.accent, textTransform: 'capitalize' },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  roleSelected: { borderColor: AppTheme.primary, borderWidth: 2 },
  roleName: { fontSize: 16, fontWeight: '600', color: AppTheme.primary },
  roleDesc: { fontSize: 13, color: AppTheme.textMuted, marginTop: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: AppTheme.surfaceContainer,
  },
  tagText: { fontSize: 11, color: AppTheme.textMuted },
  createBranchBtn: {
    marginTop: 16,
    marginBottom: 24,
    alignSelf: 'flex-end',
    backgroundColor: AppTheme.admin.primaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: AppTheme.radius.lg,
  },
  createBranchText: { color: '#fff', fontWeight: '600' },
});
