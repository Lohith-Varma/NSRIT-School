import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { WingPicker } from '@/components/ui/WingPicker';
import { formatWing } from '@/constants/Wings';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import {
  createClass,
  deleteClass,
  listAllClasses,
  listAllTeachers,
  updateClass,
} from '@/services/api';
import type { Class, Wing } from '@/types';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function BranchAdminClassesScreen() {
  const router = useRouter();
  const actor = useActor();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [wing, setWing] = useState<Wing>('secondary');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, tch] = await Promise.all([listAllClasses(actor), listAllTeachers(actor)]);
      setClasses(cls);
      setTeachers(tch.map((t) => ({ id: t.id, name: t.name })));
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setName('');
    setSection('');
    setGrade('');
    setSubject('');
    setWing('secondary');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (cls: Class) => {
    setEditingId(cls.id);
    setName(cls.name);
    setSection(cls.section);
    setGrade(cls.grade);
    setSubject(cls.subject);
    setWing(cls.wing);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await updateClass(actor, editingId, { name, section, grade, subject, wing });
      } else {
        await createClass(actor, { name, section, grade, subject, wing });
      }
      resetForm();
      await load();
      Alert.alert('Success', editingId ? 'Class updated.' : 'Class created.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save class.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cls: Class) => {
    Alert.alert('Delete class', `Remove ${cls.name} (${cls.section})?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteClass(actor, cls.id);
            await load();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete.');
          }
        },
      },
    ]);
  };

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="Academic Course Management"
        subtitle="Manage classes, sections, and assigned teachers."
      />
      <View style={styles.topActions}>
        <Button
          title="Full course table"
          variant="outline"
          onPress={() => router.push('/(branch-admin)/courses-manage' as never)}
        />
        <Button
          title="Create course"
          variant="secondary"
          onPress={() => router.push('/(branch-admin)/courses-add' as never)}
        />
      </View>
      <Button
        title={showForm ? 'Cancel' : '+ Add class'}
        variant="secondary"
        onPress={() => setShowForm((v) => !v)}
      />

      {showForm ? (
        <Card style={styles.form}>
          <Text style={styles.formTitle}>{editingId ? 'Edit class' : 'New class'}</Text>
          <FormField label="Name" value={name} onChangeText={setName} placeholder="Computer Science" />
          <FormField label="Section" value={section} onChangeText={setSection} placeholder="A" />
          <FormField label="Grade" value={grade} onChangeText={setGrade} placeholder="10" />
          <FormField label="Subject" value={subject} onChangeText={setSubject} placeholder="CS" />
          <Text style={styles.wingLabel}>Wing</Text>
          <WingPicker value={wing} onChange={setWing} />
          <Button title={editingId ? 'Update' : 'Create'} loading={saving} onPress={handleSave} />
        </Card>
      ) : null}

      <Text style={styles.section}>Classes ({classes.length})</Text>
      {classes.map((cls) => {
        const teacher = teachers.find((t) => t.id === cls.teacherId);
        return (
          <Card key={cls.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>
                  Grade {cls.grade} — {cls.name} ({cls.section})
                </Text>
                <Text style={styles.meta}>
                  {formatWing(cls.wing)} · {cls.subject} · {cls.studentIds.length} students
                </Text>
                <Text style={styles.meta}>Teacher: {teacher?.name ?? 'Unassigned'}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => startEdit(cls)}>
                <Text style={styles.edit}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(cls)}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topActions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
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
  row: { flexDirection: 'row' },
  flex: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  meta: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 20, marginTop: 12 },
  edit: { color: AppTheme.branchAdmin, fontWeight: '600' },
  delete: { color: AppTheme.danger, fontWeight: '600' },
});
