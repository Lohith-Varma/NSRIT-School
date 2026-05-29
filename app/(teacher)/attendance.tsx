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
import type { AttendanceStatus, User } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';

export default function TeacherAttendanceScreen() {
  const { user } = useAuth();
  const [classId, setClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [date, setDate] = useState(todayIso());
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setMessage(null);
    try {
      const classes = await getClassesForTeacher(user, user.id);
      const cid = classes[0]?.id;
      if (!cid) return;
      setClassId(cid);

      const roster = await getStudentsInClass(user, cid);
      setStudents(roster);

      const existing = await getClassAttendanceForDate(user, cid, date);
      const initial: Record<string, AttendanceStatus> = {};
      for (const s of roster) {
        const found = existing.find((r) => r.studentId === s.id);
        initial[s.id] = found?.status ?? 'present';
      }
      setMarks(initial);
    } finally {
      setLoading(false);
    }
  }, [user, date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    if (!user || !classId) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = students.map((s) => ({
        studentId: s.id,
        status: marks[s.id] ?? 'present',
      }));
      await postClassAttendance(user, classId, date, payload);
      setMessage('Attendance posted successfully.');
      Alert.alert('Success', 'Daily attendance has been saved.');
    } catch {
      Alert.alert('Error', 'Could not save attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen loading={loading} scroll>
      <Card>
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          onBlur={loadData}
          placeholder="2026-05-15"
          placeholderTextColor={AppTheme.textMuted}
        />
        <Text style={styles.hint}>Edit date and tap away to load records for that day.</Text>
      </Card>

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
  success: {
    color: AppTheme.success,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
});
