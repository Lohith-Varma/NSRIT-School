import { StudentSearchPanel } from '@/components/students/StudentSearchPanel';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { formatWing } from '@/constants/Wings';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useActor } from '@/hooks/useActor';
import { createStudent, getWingClassesForEnrollment, getWingStudents } from '@/services/api';
import type { Class, User } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

export default function CoordinatorStudentsScreen() {
  const { user } = useAuth();
  const actor = useActor();
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stu, cls] = await Promise.all([
        getWingStudents(actor),
        getWingClassesForEnrollment(actor),
      ]);
      setStudents(stu);
      setClasses(cls);
      if (cls.length && !classId) setClassId(cls[0].id);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!classId) {
      Alert.alert('Error', 'Select a class first.');
      return;
    }
    setSaving(true);
    try {
      await createStudent(actor, { name, email, classId });
      setName('');
      setEmail('');
      setShowForm(false);
      await load();
      Alert.alert('Success', 'Student onboarded successfully.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not create student.');
    } finally {
      setSaving(false);
    }
  };

  const classLabel = (id: string) => {
    const c = classes.find((x) => x.id === id);
    return c ? `Gr ${c.grade} ${c.name} (${c.section})` : id;
  };

  return (
    <Screen loading={loading} scroll>
      {user?.wing ? (
        <Text style={styles.wingBadge}>{formatWing(user.wing)} only</Text>
      ) : null}

      <StudentSearchPanel
        accentColor={AppTheme.coordinator}
        scopeHint={
          user?.wing
            ? `Search students in the ${formatWing(user.wing)} wing only.`
            : undefined
        }
      />

      <Button
        title={showForm ? 'Cancel' : '+ Onboard student'}
        variant="secondary"
        onPress={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <Card style={styles.form}>
          <Text style={styles.formTitle}>New student</Text>
          <FormField label="Full name" value={name} onChangeText={setName} />
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Class</Text>
          {classes.map((c) => (
            <Pressable key={c.id} onPress={() => setClassId(c.id)} style={styles.classRow}>
              <Text style={[styles.classText, classId === c.id && styles.classActive]}>
                {classId === c.id ? '✓ ' : ''}
                Gr {c.grade} {c.name} ({c.section})
              </Text>
            </Pressable>
          ))}
          <Button title="Create account" loading={saving} onPress={handleCreate} />
        </Card>
      ) : null}

      <Text style={styles.section}>Students in wing ({students.length})</Text>
      {students.map((s) => (
        <Card key={s.id}>
          <Text style={styles.title}>{s.name}</Text>
          <Text style={styles.meta}>{s.email}</Text>
          <Text style={styles.meta}>Class: {s.classId ? classLabel(s.classId) : '—'}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wingBadge: {
    fontSize: 13,
    color: AppTheme.coordinator,
    fontWeight: '600',
    marginBottom: 8,
  },
  form: { marginTop: 12 },
  formTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8, color: AppTheme.text },
  label: { fontSize: 14, fontWeight: '600', color: AppTheme.text, marginTop: 10 },
  classRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: AppTheme.border },
  classText: { fontSize: 14, color: AppTheme.textMuted },
  classActive: { color: AppTheme.coordinator, fontWeight: '600' },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginVertical: 12,
  },
  title: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  meta: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
});
