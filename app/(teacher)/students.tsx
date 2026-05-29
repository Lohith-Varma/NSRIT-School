import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { getClassesForTeacher, getStudentsInClass } from '@/services/api';
import type { Class, User } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function TeacherStudentsScreen() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClasses = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const cls = await getClassesForTeacher(user, user.id);
      setClasses(cls);
      setSelectedClassId((current) => current ?? cls[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadStudents = useCallback(
    async (classId: string) => {
      if (!user) return;
      setLoading(true);
      try {
        const roster = await getStudentsInClass(user, classId);
        setStudents(roster);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (!selectedClassId) return;
    loadStudents(selectedClassId);
  }, [loadStudents, selectedClassId]);

  const selectedClass = classes.find((cls) => cls.id === selectedClassId);

  return (
    <Screen title="Students" loading={loading} scroll>
      {classes.length > 1 ? (
        <View style={styles.chipRow}>
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
      ) : null}

      {selectedClass ? (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Grade {selectedClass.grade} — {selectedClass.name} ({selectedClass.section})</Text>
          <Text style={styles.summaryMeta}>{selectedClass.studentIds.length} students enrolled</Text>
        </Card>
      ) : null}

      {students.map((student) => (
        <Card key={student.id} style={styles.studentCard}>
          <View style={styles.studentRow}>
            <View>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentMeta}>ID: {student.id}</Text>
            </View>
            <Text style={styles.studentEmail}>{student.email}</Text>
          </View>
        </Card>
      ))}

      {!loading && students.length === 0 ? (
        <Text style={styles.empty}>No students found for this class.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 6,
  },
  summaryMeta: {
    fontSize: 14,
    color: AppTheme.textMuted,
  },
  studentCard: {
    marginBottom: 12,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  studentMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  studentEmail: {
    fontSize: 12,
    color: AppTheme.textMuted,
    maxWidth: '45%',
    textAlign: 'right',
  },
  empty: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    marginTop: 24,
  },
});