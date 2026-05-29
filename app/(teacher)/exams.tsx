import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import {
  getClassesForTeacher,
  scheduleExam,
  listExams,
  enterMarks,
  getStudentResults,
} from '@/services/api';
import type { Class, Exam, ExamResult, User } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { mockStore } from '@/data/mock/store';

export default function TeacherExamsScreen() {
  const actor = useActor();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [examsList, setExamsList] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [gradesMap, setGradesMap] = useState<Record<string, { marks: string; remarks: string }>>({});
  const [loading, setLoading] = useState(true);

  // Scheduling Form
  const [examName, setExamName] = useState('');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [scheduling, setScheduling] = useState(false);
  const [schedErr, setSchedErr] = useState<string | null>(null);

  const loadClasses = async () => {
    try {
      const data = await getClassesForTeacher(actor, actor.id);
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(data[0].id);
        setSubject(data[0].subject || 'General');
      }
    } catch (e) {
      console.warn('Failed to load teacher classes', e);
    }
  };

  const loadExams = async (classId: string) => {
    if (!classId) return;
    try {
      const data = await listExams(actor, classId);
      setExamsList(data);
      if (data.length > 0) {
        setSelectedExam(data[0]);
      } else {
        setSelectedExam(null);
      }
    } catch (e) {
      console.warn('Failed to load exams', e);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadClasses();
      setLoading(false);
    })();
  }, [actor]);

  useEffect(() => {
    if (selectedClassId) {
      loadExams(selectedClassId);
      const cls = classes.find((c) => c.id === selectedClassId);
      if (cls) setSubject(cls.subject || 'General');
    }
  }, [selectedClassId, classes]);

  useEffect(() => {
    if (selectedExam) {
      // Find students in class
      const clsStudents = mockStore.users.filter(
        (u) => u.role === 'student' && u.classId === selectedExam.classId
      );
      setStudents(clsStudents);

      // Load existing grades if any
      const initialGrades: Record<string, { marks: string; remarks: string }> = {};
      clsStudents.forEach((s) => {
        const existing = mockStore.results.find(
          (r) => r.studentId === s.id && r.examName === selectedExam.name && r.subject === selectedExam.subject
        );
        initialGrades[s.id] = {
          marks: existing ? String(existing.marksObtained) : '',
          remarks: existing?.remarks || '',
        };
      });
      setGradesMap(initialGrades);
    } else {
      setStudents([]);
      setGradesMap({});
    }
  }, [selectedExam]);

  const handleSchedule = async () => {
    const marksNum = parseInt(maxMarks, 10);
    if (!examName.trim() || !examDate.trim() || isNaN(marksNum)) {
      setSchedErr('Please fill out all fields correctly');
      return;
    }
    setScheduling(true);
    setSchedErr(null);
    try {
      await scheduleExam(actor, selectedClassId, subject, examName, examDate, marksNum);
      setExamName('');
      setExamDate('');
      loadExams(selectedClassId);
      Alert.alert('Success', 'Exam has been scheduled in the academic calendar!');
    } catch (e: any) {
      setSchedErr(e.message || 'Failed to schedule exam');
    } finally {
      setScheduling(false);
    }
  };

  const handleSaveMarks = async (studentId: string) => {
    if (!selectedExam) return;
    const info = gradesMap[studentId];
    const marksNum = parseInt(info?.marks, 10);

    if (isNaN(marksNum)) {
      Alert.alert('Validation Error', 'Please enter a valid number for marks.');
      return;
    }

    try {
      await enterMarks(actor, selectedExam.id, studentId, marksNum, info.remarks);
      Alert.alert('Saved', 'Marks updated successfully!');
      // Reload exam status from store
      loadExams(selectedClassId);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save marks');
    }
  };

  const getStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'published':
        return AppTheme.success;
      case 'grading':
        return AppTheme.warning;
      case 'scheduled':
      default:
        return '#3b82f6';
    }
  };

  return (
    <Screen title="Exam Center" subtitle="Schedule examinations and record marks" loading={loading} scroll>
      {classes.length > 0 ? (
        <View style={styles.classSelector}>
          <Text style={styles.selectorLabel}>Select Class:</Text>
          <View style={styles.tabsRow}>
            {classes.map((cls) => (
              <Pressable
                key={cls.id}
                style={[styles.tabButton, selectedClassId === cls.id ? styles.tabButtonActive : null]}
                onPress={() => setSelectedClassId(cls.id)}>
                <Text style={[styles.tabLabel, selectedClassId === cls.id ? styles.tabLabelActive : null]}>
                  {cls.name} ({cls.section})
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.layoutContainer}>
        <View style={styles.formCol}>
          {/* Schedule Exam Card */}
          <Card style={styles.cardPadding}>
            <Text style={styles.sectionTitle}>Schedule New Exam</Text>

            <FormField label="Subject">
              <TextInput style={styles.input} value={subject} onChangeText={setSubject} />
            </FormField>

            <FormField label="Exam/Topic Name">
              <TextInput
                style={styles.input}
                placeholder="e.g. Unit Test 2, Quarterly Examination"
                placeholderTextColor={AppTheme.textMuted}
                value={examName}
                onChangeText={setExamName}
              />
            </FormField>

            <FormField label="Exam Date (YYYY-MM-DD)">
              <TextInput
                style={styles.input}
                placeholder="e.g. 2026-06-15"
                placeholderTextColor={AppTheme.textMuted}
                value={examDate}
                onChangeText={setExamDate}
              />
            </FormField>

            <FormField label="Maximum Marks">
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={maxMarks}
                onChangeText={setMaxMarks}
              />
            </FormField>

            {schedErr ? <Text style={styles.errorText}>{schedErr}</Text> : null}

            <Button
              title="Post Exam Schedule"
              loading={scheduling}
              onPress={handleSchedule}
              style={styles.btnMargin}
            />
          </Card>

          {/* List of Exams */}
          <View style={styles.examList}>
            <Text style={styles.sectionTitle}>Scheduled Examinations</Text>
            {examsList.map((ex) => {
              const isActive = selectedExam?.id === ex.id;
              return (
                <Pressable
                  key={ex.id}
                  style={[styles.examItemCard, isActive ? styles.examItemCardActive : null]}
                  onPress={() => setSelectedExam(ex)}>
                  <View style={styles.examItemHeader}>
                    <Text style={styles.examItemName}>{ex.name}</Text>
                    <Badge label={ex.status.toUpperCase()} color={getStatusColor(ex.status)} />
                  </View>
                  <Text style={styles.examItemMeta}>
                    Subject: {ex.subject} • Max Marks: {ex.maxMarks}
                  </Text>
                  <Text style={styles.examItemDate}>Date: {formatDate(ex.date)}</Text>
                </Pressable>
              );
            })}

            {examsList.length === 0 ? (
              <Text style={styles.emptyText}>No exams scheduled yet.</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.markCol}>
          {selectedExam ? (
            <Card style={styles.cardPadding}>
              <Text style={styles.sectionTitle}>Marks Entry Sheet</Text>
              <Text style={styles.sheetSubtitle}>
                {selectedExam.name} • Max Marks: {selectedExam.maxMarks}
              </Text>
              
              <View style={styles.sheetBadge}>
                <Badge
                  label={selectedExam.status === 'published' ? 'Declared' : 'Draft / Grading'}
                  color={getStatusColor(selectedExam.status)}
                />
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                {students.map((st) => {
                  const data = gradesMap[st.id] || { marks: '', remarks: '' };
                  return (
                    <View key={st.id} style={styles.studentMarkRow}>
                      <View style={styles.studentDetails}>
                        <Text style={styles.studentName}>{st.name}</Text>
                        <Text style={styles.studentAdm}>No: {st.admissionNumber || '—'}</Text>
                      </View>

                      <View style={styles.marksEntryBlock}>
                        <TextInput
                          style={styles.markInput}
                          placeholder="Score"
                          placeholderTextColor={AppTheme.textMuted}
                          keyboardType="numeric"
                          value={data.marks}
                          onChangeText={(text) =>
                            setGradesMap((prev) => ({
                              ...prev,
                              [st.id]: { ...prev[st.id], marks: text },
                            }))
                          }
                        />
                        <TextInput
                          style={styles.remarksInput}
                          placeholder="Teacher Remarks"
                          placeholderTextColor={AppTheme.textMuted}
                          value={data.remarks}
                          onChangeText={(text) =>
                            setGradesMap((prev) => ({
                              ...prev,
                              [st.id]: { ...prev[st.id], remarks: text },
                            }))
                          }
                        />
                        <Pressable style={styles.saveMarkBtn} onPress={() => handleSaveMarks(st.id)}>
                          <Text style={styles.saveMarkBtnText}>Save</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}

                {students.length === 0 ? (
                  <Text style={styles.emptyText}>No registered students found.</Text>
                ) : null}
              </ScrollView>
            </Card>
          ) : (
            <Card style={[styles.cardPadding, styles.centeredCard]}>
              <Text style={styles.emptyText}>Please select an exam schedule on the left to record marks.</Text>
            </Card>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  classSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.textMuted,
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: AppTheme.surface,
    borderWidth: 1.5,
    borderColor: AppTheme.border,
  },
  tabButtonActive: {
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  tabLabelActive: {
    color: '#fff',
  },
  layoutContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  formCol: {
    flex: 1,
    minWidth: 320,
  },
  markCol: {
    flex: 1.4,
    minWidth: 360,
  },
  cardPadding: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 12,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: AppTheme.textMuted,
    fontWeight: '600',
  },
  sheetBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
  },
  errorText: {
    color: AppTheme.danger,
    fontSize: 14,
    marginTop: 6,
  },
  btnMargin: {
    marginTop: 12,
  },
  examList: {
    marginTop: 20,
  },
  examItemCard: {
    backgroundColor: AppTheme.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  examItemCardActive: {
    borderColor: AppTheme.primary,
    backgroundColor: `${AppTheme.primary}06`,
  },
  examItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
  },
  examItemMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  examItemDate: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  scroll: {
    maxHeight: 520,
  },
  studentMarkRow: {
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    paddingVertical: 14,
    gap: 8,
  },
  studentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
  },
  studentAdm: {
    fontSize: 12,
    color: AppTheme.textMuted,
  },
  marksEntryBlock: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  markInput: {
    width: 60,
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
    color: AppTheme.text,
    fontSize: 14,
  },
  remarksInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: AppTheme.text,
    fontSize: 14,
  },
  saveMarkBtn: {
    backgroundColor: AppTheme.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveMarkBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  centeredCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    fontSize: 14,
    paddingVertical: 20,
  },
});
