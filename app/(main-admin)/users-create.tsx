import { AdminCard } from '@/components/admin/AdminCard';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { AppTheme } from '@/constants/Theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

const ROLES = [
  { id: 'principal', label: 'Principal', desc: 'Full administrative authority and institutional oversight.', icon: 'university' as const },
  { id: 'admin', label: 'Admin', desc: 'Manage student records, fees, and daily operations.', icon: 'shield' as const },
  { id: 'teacher', label: 'Teacher', desc: 'Academic management, grading, and student engagement.', icon: 'graduation-cap' as const },
];

export default function CreateUserScreen() {
  const router = useRouter();
  const [role, setRole] = useState('admin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Administration Office');
  const [forceReset, setForceReset] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Required', 'Full name and official email are required.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('User created', 'Credentials will be sent to the official email.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 600);
  };

  return (
    <Screen scroll embedded>
      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={16} color={AppTheme.textMuted} />
        <Text style={styles.backText}>Back to User Management</Text>
      </Pressable>

      <Text style={styles.pageTitle}>Register New Staff Member</Text>
      <Text style={styles.pageSub}>Onboard new faculty or administrative personnel to the Connect ecosystem.</Text>

      <AdminCard>
        <Text style={styles.sectionLabel}>USER ACCESS ROLE</Text>
        <View style={styles.roleGrid}>
          {ROLES.map((r) => (
            <Pressable
              key={r.id}
              style={[styles.roleCard, role === r.id && styles.roleCardActive]}
              onPress={() => setRole(r.id)}>
              <FontAwesome name={r.icon} size={22} color={AppTheme.primary} />
              <Text style={styles.roleLabel}>{r.label}</Text>
              <Text style={styles.roleDesc}>{r.desc}</Text>
            </Pressable>
          ))}
        </View>
      </AdminCard>

      <View style={styles.twoCol}>
        <AdminCard style={styles.col}>
          <Text style={styles.blockTitle}>Personal Details</Text>
          <FormField label="FULL NAME" value={fullName} onChangeText={setFullName} placeholder="e.g. Dr. Satish Kumar" />
          <FormField label="OFFICIAL EMAIL" value={email} onChangeText={setEmail} placeholder="s.kumar@nsrit.edu" />
          <FormField label="CONTACT NUMBER" value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" />
        </AdminCard>
        <AdminCard style={styles.col}>
          <Text style={styles.blockTitle}>Professional Details</Text>
          <FormField label="EMPLOYEE ID" value={employeeId} onChangeText={setEmployeeId} placeholder="NSRIT-STF-2024-08" />
          <FormField label="DEPARTMENT" value={department} onChangeText={setDepartment} />
        </AdminCard>
      </View>

      <AdminCard>
        <Text style={styles.blockTitle}>Account Security</Text>
        <FormField label="SET PASSWORD" value="••••••••••••" onChangeText={() => {}} secureTextEntry />
        <View style={styles.resetRow}>
          <Switch value={forceReset} onValueChange={setForceReset} />
          <Text style={styles.resetLabel}>Force password reset on login</Text>
        </View>
      </AdminCard>

      <View style={styles.footer}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel Registration</Text>
        </Pressable>
        <Button title="Create User" onPress={handleCreate} loading={saving} />
      </View>

      <View style={styles.tips}>
        {[
          { title: 'Audit Compliant', desc: 'Every user creation is logged in the permanent audit trail.' },
          { title: 'Auto-Notification', desc: 'Credentials sent to official email after creation.' },
          { title: 'Access Control', desc: 'Permissions restricted by selected institutional role.' },
        ].map((tip) => (
          <AdminCard key={tip.title} style={styles.tipCard}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDesc}>{tip.desc}</Text>
          </AdminCard>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  backText: { fontSize: 12, fontWeight: '600', color: AppTheme.textMuted, textTransform: 'uppercase' },
  pageTitle: { fontSize: 24, fontWeight: '600', color: AppTheme.primary },
  pageSub: { fontSize: 14, color: AppTheme.textMuted, marginTop: 4, marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: AppTheme.textMuted, marginBottom: 12 },
  roleGrid: { gap: 12 },
  roleCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: AppTheme.radius.lg,
  },
  roleCardActive: { borderColor: AppTheme.primary, backgroundColor: '#e0e0ff22' },
  roleLabel: { fontSize: 18, fontWeight: '700', color: AppTheme.primary, marginTop: 8 },
  roleDesc: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
  twoCol: { gap: 12, marginTop: 12 },
  col: {},
  blockTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.primary, marginBottom: 12 },
  resetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  resetLabel: { fontSize: 13, color: AppTheme.textMuted },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  cancel: { fontSize: 14, color: AppTheme.textMuted },
  tips: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tipCard: { flex: 1, minWidth: 160, backgroundColor: `${AppTheme.admin.primaryContainer}18` },
  tipTitle: { fontSize: 12, fontWeight: '700', color: AppTheme.primary },
  tipDesc: { fontSize: 12, color: AppTheme.textMuted, marginTop: 4 },
});
