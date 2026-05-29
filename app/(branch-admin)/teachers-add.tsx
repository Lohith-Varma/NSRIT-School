import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { WingPicker } from '@/components/ui/WingPicker';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { createTeacher } from '@/services/api';
import type { Wing } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function AddTeacherScreen() {
  const router = useRouter();
  const actor = useActor();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [wing, setWing] = useState<Wing>('secondary');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing fields', 'Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      await createTeacher(actor, {
        name: name.trim(),
        email: email.trim(),
        wing,
        subjects: department ? [department] : [],
      });
      Alert.alert('Registered', 'Teacher account created.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Registration failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll embedded>
      <AdminPageHeader title="Teacher Registration" subtitle="Register a new faculty member for NSRIT – Connect." />
      <AdminCard>
        <Section icon="person" title="Personal Information" />
        <View style={styles.photo}>
          <MaterialIcons name="add-a-photo" size={32} color={AppTheme.admin.outline} />
          <Text style={styles.photoLabel}>Upload Profile Photo</Text>
        </View>
        <FormField label="Full Name" value={name} onChangeText={setName} />
        <WingPicker value={wing} onChange={setWing} />
      </AdminCard>
      <AdminCard>
        <Section icon="badge" title="Professional Details" />
        <Text style={styles.label}>Employee ID (Auto)</Text>
        <Text style={styles.disabled}>NSR-TEC-2024-089</Text>
        <FormField label="Department" value={department} onChangeText={setDepartment} placeholder="Computer Science" />
        <FormField label="Designation" value={designation} onChangeText={setDesignation} placeholder="Assistant Professor" />
      </AdminCard>
      <AdminCard>
        <Section icon="alternate-email" title="Contact Information" />
        <FormField label="Official Email" value={email} onChangeText={setEmail} placeholder="teacher@nsrit.edu.in" />
        <FormField label="Phone Number" value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" />
      </AdminCard>
      <Button title="Register Teacher" onPress={submit} loading={saving} />
    </Screen>
  );
}

function Section({ icon, title }: { icon: keyof typeof MaterialIcons.glyphMap; title: string }) {
  return (
    <View style={styles.sectionHead}>
      <MaterialIcons name={icon} size={20} color="#2e7d32" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: AppTheme.admin.onSurface },
  photo: { alignItems: 'center', padding: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: AppTheme.admin.outlineVariant, borderRadius: 12, marginBottom: 16 },
  photoLabel: { marginTop: 8, fontSize: 11, fontWeight: '600', color: AppTheme.admin.secondary, textTransform: 'uppercase' },
  label: { fontSize: 12, fontWeight: '600', color: AppTheme.admin.onSurfaceVariant, marginBottom: 6 },
  disabled: { padding: 12, backgroundColor: AppTheme.admin.surfaceContainerHigh, borderRadius: 8, fontWeight: '700', color: AppTheme.admin.secondary },
});
