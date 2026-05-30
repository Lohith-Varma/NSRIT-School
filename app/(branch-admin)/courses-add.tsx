import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { createClass } from '@/services/api';
import type { Wing } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function AddCourseScreen() {
  const router = useRouter();
  const actor = useActor();
  const [courseName, setCourseName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState('3');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!courseName.trim() || !code.trim()) {
      Alert.alert('Missing fields', 'Course name and code are required.');
      return;
    }
    setSaving(true);
    try {
      await createClass(actor, {
        name: courseName.trim(),
        section: 'A',
        grade: '10',
        wing: 'secondary' as Wing,
        subject: department || courseName.trim(),
      });
      Alert.alert('Saved', 'Course submitted for academic review.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll embedded>
      <AdminPageHeader
        title="Create New Course"
        subtitle="Add a new academic offering to the NSRIT curriculum database."
      />
      <AdminCard>
        <FormField label="Course Name" value={courseName} onChangeText={setCourseName} placeholder="Advanced Macroeconomics" />
        <FormField label="Course Code" value={code} onChangeText={setCode} placeholder="ECON-402" />
        <FormField label="Credits" value={credits} onChangeText={setCredits} placeholder="3" keyboardType="numeric" />
        <FormField label="Department" value={department} onChangeText={setDepartment} placeholder="Computer Science & Engineering" />
        <FormField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Learning objectives and prerequisites..."
          multiline
        />
        <View style={styles.note}>
          <MaterialIcons name="info" size={20} color="#2e7d32" />
          <View style={styles.noteText}>
            <Text style={styles.noteTitle}>Departmental Validation</Text>
            <Text style={styles.noteBody}>
              Courses are flagged for Academic Oversight review before appearing in the student portal.
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Button title="Cancel" variant="outline" onPress={() => router.back()} />
          <Button title="Save Course" onPress={save} loading={saving} />
        </View>
      </AdminCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  noteText: { flex: 1 },
  noteTitle: { fontWeight: '600', color: '#1b5e20', fontSize: 13 },
  noteBody: { color: '#1b5e20', fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20, justifyContent: 'flex-end' },
});
