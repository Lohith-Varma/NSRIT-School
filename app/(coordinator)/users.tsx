import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import type { User, UserRole } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { mockStore } from '@/data/mock/store';
import { logAction } from '@/services/api/audit';

export default function CoordinatorUsersScreen() {
  const actor = useActor();
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | UserRole>('all');
  const [loading, setLoading] = useState(true);

  // Modal / Editing states simulated inline
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadAllUsers = () => {
    setLoading(true);
    // Find all users registered in this branch
    const branchUsers = mockStore.users.filter((u) => u.branchId === actor.branchId);
    setUsers(branchUsers);
    setFiltered(branchUsers);
    setLoading(false);
  };

  useEffect(() => {
    loadAllUsers();
  }, [actor]);

  useEffect(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }

    if (selectedRole !== 'all') {
      result = result.filter((u) => u.role === selectedRole);
    }

    setFiltered(result);
  }, [search, selectedRole, users]);

  const handleToggleStatus = async (userToUpdate: User) => {
    const currentStatus = userToUpdate.status || 'Active';
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    userToUpdate.status = nextStatus;
    await logAction(actor, 'User Status Modified', `Changed status of ${userToUpdate.name} (${userToUpdate.id}) to ${nextStatus}`);
    Alert.alert('Status Updated', `${userToUpdate.name} is now ${nextStatus}`);
    loadAllUsers();
  };

  const handleResetPassword = async () => {
    if (!activeUser || !newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    await logAction(actor, 'User Password Reset', `Reset password of ${activeUser.name} (${activeUser.id})`);
    Alert.alert('Password Reset', `Password for ${activeUser.name} has been successfully updated.`);
    setNewPassword('');
    setActiveUser(null);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'main_admin':
      case 'branch_admin':
        return AppTheme.danger;
      case 'principal':
        return AppTheme.primary;
      case 'coordinator':
        return AppTheme.coordinator;
      case 'teacher':
        return AppTheme.accent;
      case 'accountant':
        return '#10b981';
      case 'front_desk':
        return '#f59e0b';
      case 'student':
      case 'parent':
      default:
        return AppTheme.textMuted;
    }
  };

  return (
    <Screen title="User Management" subtitle="Manage accounts, reset credentials, and audit access" loading={loading} scroll>
      <View style={styles.layout}>
        <View style={styles.listCol}>
          <Card style={styles.searchCard}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search user by name, email, or ID..."
              placeholderTextColor={AppTheme.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            <View style={styles.roleTabs}>
              {(['all', 'teacher', 'student', 'parent', 'accountant', 'front_desk'] as const).map((role) => (
                <Pressable
                  key={role}
                  style={[styles.roleTab, selectedRole === role ? styles.roleTabActive : null]}
                  onPress={() => setSelectedRole(role)}>
                  <Text style={[styles.roleTabText, selectedRole === role ? styles.roleTabTextActive : null]}>
                    {role.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {filtered.map((u) => (
              <Card key={u.id} style={styles.userCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                    <Text style={styles.userId}>ID: {u.id}</Text>
                  </View>
                  <View style={styles.badgeCol}>
                    <Badge label={u.role.toUpperCase()} color={getRoleColor(u.role)} />
                    <View style={{ marginTop: 6 }}>
                      <Badge label={u.status || 'Active'} color={(u.status || 'Active') === 'Active' ? AppTheme.success : AppTheme.danger} />
                    </View>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <Pressable style={styles.actionBtn} onPress={() => setActiveUser(u)}>
                    <Text style={styles.actionBtnText}>Reset Password</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { borderColor: (u.status || 'Active') === 'Active' ? AppTheme.danger : AppTheme.success }]} onPress={() => handleToggleStatus(u)}>
                    <Text style={[styles.actionBtnText, { color: (u.status || 'Active') === 'Active' ? AppTheme.danger : AppTheme.success }]}>
                      {(u.status || 'Active') === 'Active' ? 'Deactivate' : 'Activate'}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>

        {activeUser ? (
          <View style={styles.modalCol}>
            <Card style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Password Reset</Text>
                <Pressable onPress={() => setActiveUser(null)}>
                  <Text style={styles.closeText}>Cancel</Text>
                </Pressable>
              </View>
              <Text style={styles.modalDesc}>
                Reset credentials for <Text style={styles.bold}>{activeUser.name}</Text> ({activeUser.role})
              </Text>

              <FormField label="Enter New Password">
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </FormField>

              <Button title="Apply Credentials" onPress={handleResetPassword} style={styles.applyBtn} />
            </Card>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  listCol: {
    flex: 1.4,
    minWidth: 360,
  },
  modalCol: {
    flex: 1,
    minWidth: 320,
  },
  searchCard: {
    padding: 16,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
    backgroundColor: AppTheme.background,
    marginBottom: 12,
  },
  roleTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: AppTheme.background,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  roleTabActive: {
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  roleTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppTheme.text,
  },
  roleTabTextActive: {
    color: '#fff',
  },
  scroll: {
    maxHeight: 520,
  },
  userCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  userEmail: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  userId: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  badgeCol: {
    alignItems: 'flex-end',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppTheme.border,
  },
  actionBtn: {
    borderColor: AppTheme.primary,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnText: {
    fontSize: 12,
    color: AppTheme.primary,
    fontWeight: '600',
  },
  modalCard: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppTheme.text,
  },
  closeText: {
    fontSize: 13,
    color: AppTheme.danger,
    fontWeight: '600',
  },
  modalDesc: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginBottom: 14,
  },
  bold: {
    fontWeight: '700',
    color: AppTheme.text,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
  },
  applyBtn: {
    marginTop: 12,
  },
});
