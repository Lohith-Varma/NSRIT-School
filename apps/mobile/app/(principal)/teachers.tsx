import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { WingPicker } from '@/components/ui/WingPicker';
import { formatWing } from '@/constants/Wings';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { createTeacher, listAllClasses, listAllTeachers } from '@/services/api';
import type { User, Wing } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

export default function PrincipalTeachersScreen() {
  const actor = useActor();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classOptions, setClassOptions] = useState<{ id: string; label: string; wing: Wing }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subjects, setSubjects] = useState('');
  const [wing, setWing] = useState<Wing>('secondary');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tch, cls] = await Promise.all([listAllTeachers(actor), listAllClasses(actor)]);
      setTeachers(tch);
      setClassOptions(
        cls.map((c) => ({
          id: c.id,
          wing: c.wing,
          label: `Gr ${c.grade} ${c.name} (${c.section})`,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId],
    );
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createTeacher(actor, {
        name,
        email,
        wing,
        subjects: subjects.split(',').map((s) => s.trim()).filter(Boolean),
        classIds: selectedClassIds,
      });
      setName('');
      setEmail('');
      setSubjects('');
      setSelectedClassIds([]);
      setShowForm(false);
      await load();
      Alert.alert('Success', 'Teacher account created.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not create teacher.');
    } finally {
      setSaving(false);
    }
  };

  const wingClasses = classOptions.filter((c) => c.wing === wing);

  return (
    <Screen loading={loading} scroll>
      <Button
        title={showForm ? 'Cancel' : '+ Onboard teacher'}
        variant="secondary"
        onPress={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <Card style={styles.form}>
          <Text style={styles.formTitle}>New teacher</Text>
          <FormField label="Full name" value={name} onChangeText={setName} />
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <FormField
            label="Subjects (comma-separated)"
            value={subjects}
            onChangeText={setSubjects}
            placeholder="Mathematics, Science"
          />
          <Text style={styles.wingLabel}>Wing</Text>
          <WingPicker value={wing} onChange={(w) => { setWing(w); setSelectedClassIds([]); }} />
          <Text style={styles.wingLabel}>Assign classes</Text>
          {wingClasses.map((c) => (
            <Pressable key={c.id} onPress={() => toggleClass(c.id)} style={styles.classChip}>
              <Text
                style={[
                  styles.classChipText,
                  selectedClassIds.includes(c.id) && styles.classChipActive,
                ]}>
                {selectedClassIds.includes(c.id) ? '✓ ' : ''}
                {c.label}
              </Text>
            </Pressable>
          ))}
          <Button title="Create account" loading={saving} onPress={handleCreate} />
        </Card>
      ) : null}

      <Text style={styles.section}>Teachers ({teachers.length})</Text>
      {teachers.map((t) => (
        <Card key={t.id}>
          <Text style={styles.title}>{t.name}</Text>
          <Text style={styles.meta}>{t.email}</Text>
          <Text style={styles.meta}>
            {t.wing ? formatWing(t.wing) : '—'} · {(t.subjects ?? []).join(', ') || 'No subjects'}
          </Text>
          <Text style={styles.meta}>{(t.classIds ?? []).length} class(es) assigned</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 12 },
  formTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8, color: AppTheme.text },
  wingLabel: { fontSize: 14, fontWeight: '600', color: AppTheme.text, marginTop: 8 },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginVertical: 12,
  },
  classChip: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  classChipText: { fontSize: 14, color: AppTheme.textMuted },
  classChipActive: { color: AppTheme.primary, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  meta: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
});
