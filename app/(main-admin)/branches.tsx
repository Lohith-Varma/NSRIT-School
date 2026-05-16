import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import {
  createBranch,
  deleteBranch,
  listBranches,
  provisionBranchAdmin,
  updateBranch,
} from '@/services/api';
import type { Branch } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function MainAdminBranchesScreen() {
  const actor = useActor();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [provisionBranchId, setProvisionBranchId] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listBranches(actor);
      setBranches(list);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createBranch(actor, { name, code, address: address || undefined });
      setName('');
      setCode('');
      setAddress('');
      setShowCreate(false);
      await load();
      Alert.alert('Created', 'Branch added to the network.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not create branch.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: Branch) => {
    try {
      await updateBranch(actor, b.id, { active: !b.active });
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Update failed.');
    }
  };

  const removeBranch = async (b: Branch) => {
    Alert.alert('Delete branch', `Permanently remove ${b.name}? Only empty branches can be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBranch(actor, b.id);
            await load();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete.');
          }
        },
      },
    ]);
  };

  const provision = async () => {
    if (!provisionBranchId) return;
    setSaving(true);
    try {
      await provisionBranchAdmin(actor, {
        branchId: provisionBranchId,
        name: adminName,
        email: adminEmail,
      });
      setAdminName('');
      setAdminEmail('');
      Alert.alert('Done', 'Branch Admin account created.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Provisioning failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen loading={loading} scroll>
      <Button
        title={showCreate ? 'Cancel' : '+ New branch'}
        variant="secondary"
        onPress={() => setShowCreate((v) => !v)}
      />

      {showCreate ? (
        <Card style={styles.form}>
          <Text style={styles.formTitle}>Create branch</Text>
          <FormField label="Campus name" value={name} onChangeText={setName} placeholder="South Campus" />
          <FormField label="Code" value={code} onChangeText={setCode} placeholder="SOUTH" autoCapitalize="characters" />
          <FormField label="Address (optional)" value={address} onChangeText={setAddress} />
          <Button title="Create branch" loading={saving} onPress={handleCreate} />
        </Card>
      ) : null}

      <Text style={styles.section}>All sites</Text>
      {branches.map((b) => (
          <Card key={b.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{b.name}</Text>
                <Text style={styles.meta}>
                  {b.code} · {b.active ? 'Active' : 'Inactive'}
                </Text>
                {b.address ? <Text style={styles.meta}>{b.address}</Text> : null}
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => toggleActive(b)}>
                <Text style={styles.link}>{b.active ? 'Deactivate' : 'Activate'}</Text>
              </Pressable>
              <Pressable onPress={() => removeBranch(b)}>
                <Text style={styles.danger}>Delete</Text>
              </Pressable>
            </View>
          </Card>
      ))}

      <Text style={styles.section}>Provision Branch Admin</Text>
      <Card>
        <Text style={styles.meta}>Select branch, then create login for the branch owner.</Text>
        {branches.map((b) => (
          <Pressable key={b.id} onPress={() => setProvisionBranchId(b.id)} style={styles.pickRow}>
            <Text style={provisionBranchId === b.id ? styles.pickActive : styles.pick}>
              {provisionBranchId === b.id ? '✓ ' : ''}
              {b.name} ({b.code})
            </Text>
          </Pressable>
        ))}
        <FormField label="Admin name" value={adminName} onChangeText={setAdminName} />
        <FormField
          label="Admin email"
          value={adminEmail}
          onChangeText={setAdminEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Button title="Create Branch Admin" loading={saving} onPress={provision} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 12 },
  formTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8, color: AppTheme.text },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginVertical: 12,
  },
  row: { flexDirection: 'row' },
  flex: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  meta: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 20, marginTop: 8 },
  link: { color: AppTheme.accent, fontWeight: '600' },
  danger: { color: AppTheme.danger, fontWeight: '600' },
  pickRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: AppTheme.border },
  pick: { fontSize: 14, color: AppTheme.textMuted },
  pickActive: { fontSize: 14, color: AppTheme.mainAdmin, fontWeight: '600' },
});
