import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import {
  createBranch,
  deleteBranch,
  listBranchCards,
  listBranches,
  provisionBranchAdmin,
  updateBranch,
} from '@/services/api';
import type { AdminBranchCard } from '@/types/admin';
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
  const [cards, setCards] = useState<AdminBranchCard[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, cardList] = await Promise.all([listBranches(actor), listBranchCards(actor)]);
      setBranches(list);
      setCards(cardList);
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

  const filteredCards = cards.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="Branch Management"
        subtitle="Overview and control of all institution branches."
        action={
          <Button
            title="+ New"
            variant="secondary"
            onPress={() => setShowCreate((v) => !v)}
          />
        }
      />
      <AdminSearchBar value={search} onChangeText={setSearch} placeholder="Search branches..." />

      <View style={styles.bento}>
        {filteredCards.map((card) => (
          <AdminCard key={card.id} style={styles.branchCard}>
            <View style={styles.branchCardHeader}>
              <View>
                <Text style={styles.branchName}>{card.name}</Text>
                <Text style={styles.branchLoc}>{card.location}</Text>
              </View>
              <Text
                style={[
                  styles.statusPill,
                  card.status === 'review' ? styles.statusReview : styles.statusActive,
                ]}>
                {card.status === 'review' ? 'Review' : 'Active'}
              </Text>
            </View>
            <View style={styles.branchStats}>
              <View style={styles.miniStat}>
                <Text style={styles.miniLabel}>Students</Text>
                <Text style={styles.miniValue}>{card.students.toLocaleString()}</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniLabel}>Revenue</Text>
                <Text style={[styles.miniValue, { color: AppTheme.accent }]}>
                  ${(card.revenue / 1_000_000).toFixed(1)}M
                </Text>
              </View>
            </View>
          </AdminCard>
        ))}
      </View>

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
  bento: { gap: 12, marginBottom: 16 },
  branchCard: { marginBottom: 0 },
  branchCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  branchName: { fontSize: 18, fontWeight: '600', color: AppTheme.text },
  branchLoc: { fontSize: 12, color: AppTheme.textMuted, marginTop: 2 },
  statusPill: { fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusActive: { backgroundColor: `${AppTheme.accent}22`, color: AppTheme.accent },
  statusReview: { backgroundColor: AppTheme.admin.errorContainer, color: AppTheme.admin.onErrorContainer },
  branchStats: { flexDirection: 'row', gap: 12 },
  miniStat: {
    flex: 1,
    backgroundColor: AppTheme.admin.surfaceContainerLow,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.admin.surfaceContainerHigh,
  },
  miniLabel: { fontSize: 11, color: AppTheme.textMuted },
  miniValue: { fontSize: 18, fontWeight: '700', color: AppTheme.admin.primaryContainer, marginTop: 4 },
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
