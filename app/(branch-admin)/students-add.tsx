import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listAllClasses } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AddStudentScreen() {
  const router = useRouter();
  const actor = useActor();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState<{ id: string; label: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listAllClasses(actor).then((cls) =>
      setClasses(cls.map((c) => ({ id: c.id, label: `Grade ${c.grade} ${c.name} (${c.section})` }))),
    );
  }, [actor]);

  const save = async () => {
    if (!name.trim() || !email.trim() || !classId) {
      Alert.alert('Missing fields', 'Name, email, and class are required.');
      return;
    }
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      Alert.alert('Registered', 'Student enrollment recorded (demo).', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll embedded>
      <AdminPageHeader title="New Student" subtitle="Register a student for NSRIT – Connect." />
      <Pressable style={styles.photo}>
        <MaterialIcons name="person" size={40} color={AppTheme.admin.outline} />
        <Text style={styles.photoLabel}>Upload Student Photo</Text>
      </Pressable>
      <AdminCard>
        <View style={styles.sectionHead}>
          <MaterialIcons name="person" size={20} color={AppTheme.admin.primary} />
          <Text style={styles.sectionTitle}>Personal Information</Text>
        </View>
        <FormField label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" />
        <FormField label="Student Email" value={email} onChangeText={setEmail} placeholder="student@nsrit.edu.in" />
      </AdminCard>
      <AdminCard>
        <View style={styles.sectionHead}>
          <MaterialIcons name="school" size={20} color={AppTheme.admin.primary} />
          <Text style={styles.sectionTitle}>Academic Details</Text>
        </View>
        <Text style={styles.label}>Admission Number (Auto)</Text>
        <Text style={styles.disabled}>NSRIT-2024-0892</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>Class / Grade</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {classes.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.chip, classId === c.id && styles.chipActive]}
              onPress={() => setClassId(c.id)}>
              <Text style={[styles.chipText, classId === c.id && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </AdminCard>
      <Button title="Finalize Registration" onPress={save} loading={saving} />
      <Text style={styles.footer}>
        By adding this student, they will be enrolled in the LMS and assigned a campus ID.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  photoLabel: { marginTop: 8, fontSize: 12, fontWeight: '600', color: AppTheme.admin.secondary },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: AppTheme.admin.primary },
  label: { fontSize: 12, fontWeight: '600', color: AppTheme.admin.onSurfaceVariant, marginBottom: 6 },
  disabled: {
    padding: 12,
    backgroundColor: AppTheme.admin.surfaceContainer,
    borderRadius: 8,
    color: AppTheme.admin.secondary,
    fontWeight: '700',
  },
  chips: { flexDirection: 'row', marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.admin.outline,
    marginRight: 8,
  },
  chipActive: { backgroundColor: AppTheme.admin.primary, borderColor: AppTheme.admin.primary },
  chipText: { fontSize: 12, color: AppTheme.admin.onSurface },
  chipTextActive: { color: AppTheme.admin.onPrimary },
  footer: { textAlign: 'center', fontSize: 13, color: AppTheme.admin.onSurfaceVariant, marginTop: 16, paddingHorizontal: 16 },
});
