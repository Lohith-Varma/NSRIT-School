import { AttendanceMarkRow } from '@/components/attendance/AttendanceMarkRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme, todayIso } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import {
    getClassAttendanceForDate,
    getClassesForTeacher,
    getStudentsInClass,
    postClassAttendance,
} from '@/services/api';
import type { AttendanceStatus, Class, User } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function TeacherAttendanceScreen() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [date, setDate] = useState(todayIso());
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadClassList = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const classList = await getClassesForTeacher(user, user.id);
      setClasses(classList);
      setSelectedClassId((current) => current ?? classList[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadAttendance = useCallback(async () => {
    if (!user || !selectedClassId) return;
    setLoading(true);
    setMessage(null);

    try {
      const roster = await getStudentsInClass(user, selectedClassId);
      setStudents(roster);

      const existing = await getClassAttendanceForDate(user, selectedClassId, date);
      const initial: Record<string, AttendanceStatus> = {};
      for (const s of roster) {
        const found = existing.find((r) => r.studentId === s.id);
        initial[s.id] = found?.status ?? 'present';
      }
      setMarks(initial);
    } finally {
      setLoading(false);
    }
  }, [user, selectedClassId, date]);

  useEffect(() => {
    loadClassList();
  }, [loadClassList]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleSubmit = async () => {
    if (!user || !selectedClassId) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = students.map((s) => ({
        studentId: s.id,
        status: marks[s.id] ?? 'present',
      }));
      await postClassAttendance(user, selectedClassId, date, payload);
      setMessage('Attendance posted successfully.');
      Alert.alert('Success', 'Daily attendance has been saved.');
    } catch {
      Alert.alert('Error', 'Could not save attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClass = classes.find((cls) => cls.id === selectedClassId);

  return (
    <Screen loading={loading} scroll>
      <Card>
        <Text style={styles.label}>Select class</Text>
        <View style={styles.classRow}>
          {classes.map((cls) => (
            <Pressable
              key={cls.id}
              style={[
                styles.classChip,
                selectedClassId === cls.id && styles.classChipActive,
              ]}
              onPress={() => setSelectedClassId(cls.id)}>
              <Text
                style={[
                  styles.classChipText,
                  selectedClassId === cls.id && styles.classChipTextActive,
                ]}>
                {cls.name} {cls.section}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>Update the class and date before posting attendance.</Text>
      </Card>

      <Card>
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2026-05-15"
          placeholderTextColor={AppTheme.textMuted}
        />
      </Card>

      {selectedClass ? (
        <Card style={styles.summaryCard}>
          <Text style={styles.className}>
            Grade {selectedClass.grade} — {selectedClass.name} ({selectedClass.section})
          </Text>
          <Text style={styles.meta}>{selectedClass.studentIds.length} students</Text>
        </Card>
      ) : null}

      <Text style={styles.section}>Students</Text>
      <Card>
        {students.map((s) => (
          <AttendanceMarkRow
            key={s.id}
            studentName={s.name}
            status={marks[s.id] ?? 'present'}
            onChange={(status) => setMarks((prev) => ({ ...prev, [s.id]: status }))}
          />
        ))}
      </Card>

      {message ? <Text style={styles.success}>{message}</Text> : null}

      <Button title="Post Attendance" loading={submitting} onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: AppTheme.text,
  },
  hint: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 8,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  classRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  classChip: {
    backgroundColor: AppTheme.surface,
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  classChipActive: {
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  classChipText: {
    color: AppTheme.text,
    fontWeight: '600',
  },
  classChipTextActive: {
    color: '#fff',
  },
  summaryCard: {
    marginBottom: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  meta: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 6,
  },
  success: {
    color: AppTheme.success,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
});
