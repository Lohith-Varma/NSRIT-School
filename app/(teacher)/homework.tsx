import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import {
  getClassesForTeacher,
  createHomework,
  editHomework,
  listHomeworkForClass,
  listSubmissions,
  gradeSubmission,
} from '@/services/api';
import type { Class, Homework, HomeworkSubmission } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView } from 'react-native';

export default function TeacherHomeworkScreen() {
  const actor = useActor();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submittingHw, setSubmittingHw] = useState(false);
  const [hwErr, setHwErr] = useState<string | null>(null);

  // Edit Mode State
  const [editingHwId, setEditingHwId] = useState<string | null>(null);

  // Grading Form State
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [grade, setGrade] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [gradeErr, setGradeErr] = useState<string | null>(null);

  const loadClasses = async () => {
    try {
      const data = await getClassesForTeacher(actor, actor.id);
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(data[0].id);
      }
    } catch (e) {
      console.warn('Failed to load teacher classes', e);
    }
  };

  const loadHomework = async (classId: string) => {
    if (!classId) return;
    try {
      const data = await listHomeworkForClass(actor, classId);
      setHomeworkList(data);
      if (data.length > 0) {
        setSelectedHomework(data[0]);
      } else {
        setSelectedHomework(null);
        setSubmissions([]);
      }
    } catch (e) {
      console.warn('Failed to load homework', e);
    }
  };

  const loadSubmissions = async (hwId: string) => {
    try {
      const data = await listSubmissions(actor, hwId);
      setSubmissions(data);
    } catch (e) {
      console.warn('Failed to load submissions', e);
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
      loadHomework(selectedClassId);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedHomework) {
      loadSubmissions(selectedHomework.id);
    }
  }, [selectedHomework]);

  const handleCreateHw = async (publish = true) => {
    if (!title.trim() || !desc.trim() || !dueDate.trim()) {
      setHwErr('Please fill out all fields');
      return;
    }
    setSubmittingHw(true);
    setHwErr(null);
    try {
      if (editingHwId) {
        await editHomework(actor, editingHwId, title, desc, dueDate, publish);
      } else {
        await createHomework(actor, selectedClassId, title, desc, dueDate, publish);
      }
      resetForm();
      loadHomework(selectedClassId);
    } catch (e: any) {
      setHwErr(e.message || 'Failed to save homework');
    } finally {
      setSubmittingHw(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setDueDate('');
    setEditingHwId(null);
    setHwErr(null);
  };

  const handleEditClick = (hw: Homework) => {
    setTitle(hw.title);
    setDesc(hw.description);
    setDueDate(hw.dueDate);
    setEditingHwId(hw.id);
  };

  const handleGrade = async () => {
    if (!grade.trim()) {
      setGradeErr('Please provide a grade');
      return;
    }
    setSubmittingGrade(true);
    setGradeErr(null);
    try {
      await gradeSubmission(actor, selectedSubId, 'graded', grade, remarks);
      setGrade('');
      setRemarks('');
      setSelectedSubId('');
      if (selectedHomework) {
        loadSubmissions(selectedHomework.id);
      }
    } catch (e: any) {
      setGradeErr(e.message || 'Failed to grade submission');
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <Screen title="Homework Hub" subtitle="Assign and review student work" loading={loading} scroll>
      {classes.length > 0 ? (
        <View style={styles.classSelector}>
          <Text style={styles.selectorLabel}>Select Class:</Text>
          <View style={styles.tabsRow}>
            {classes.map((cls) => (
              <Pressable
                key={cls.id}
                style={[styles.tabButton, selectedClassId === cls.id ? styles.tabButtonActive : null]}
                onPress={() => {
                  setSelectedClassId(cls.id);
                  resetForm();
                }}>
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
          {/* Create / Edit Homework Card */}
          <Card style={styles.cardPadding}>
            <View style={styles.formHeader}>
              <Text style={styles.sectionTitle}>
                {editingHwId ? 'Edit Homework' : 'Assign New Homework'}
              </Text>
              {editingHwId ? (
                <Pressable onPress={resetForm}>
                  <Text style={styles.cancelLink}>Cancel Edit</Text>
                </Pressable>
              ) : null}
            </View>
            
            <FormField label="Homework Title">
              <TextInput
                style={styles.input}
                placeholder="e.g. Fractions Exercise, Python Basics"
                placeholderTextColor={AppTheme.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </FormField>

            <FormField label="Homework Description">
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Details of the homework, pages to complete..."
                placeholderTextColor={AppTheme.textMuted}
                multiline
                numberOfLines={4}
                value={desc}
                onChangeText={setDesc}
              />
            </FormField>

            <FormField label="Due Date (YYYY-MM-DD)">
              <TextInput
                style={styles.input}
                placeholder="e.g. 2026-06-05"
                placeholderTextColor={AppTheme.textMuted}
                value={dueDate}
                onChangeText={setDueDate}
              />
            </FormField>

            {hwErr ? <Text style={styles.errorText}>{hwErr}</Text> : null}

            <View style={styles.formActions}>
              <Button
                title={editingHwId ? 'Save Draft' : 'Save as Draft'}
                loading={submittingHw}
                variant="outline"
                onPress={() => handleCreateHw(false)}
                style={styles.flexBtn}
              />
              <Button
                title={editingHwId ? 'Publish Changes' : 'Publish Now'}
                loading={submittingHw}
                onPress={() => handleCreateHw(true)}
                style={[styles.flexBtn, { marginLeft: 8 }]}
              />
            </View>
          </Card>

          {/* List of Assigned Homeworks */}
          <View style={styles.hwListContainer}>
            <Text style={styles.sectionTitle}>Assigned Homeworks</Text>
            {homeworkList.map((hw) => {
              const isHwActive = selectedHomework?.id === hw.id;
              return (
                <Pressable
                  key={hw.id}
                  style={[styles.hwItemCard, isHwActive ? styles.hwItemCardActive : null]}
                  onPress={() => setSelectedHomework(hw)}>
                  <View style={styles.hwItemHeader}>
                    <Text style={styles.hwItemTitle}>{hw.title}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: hw.published ? `${AppTheme.success}15` : `${AppTheme.warning}15`,
                          borderColor: hw.published ? AppTheme.success : AppTheme.warning,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: hw.published ? AppTheme.success : AppTheme.warning },
                        ]}>
                        {hw.published ? 'Published' : 'Draft'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.hwItemDate}>Due: {formatDate(hw.dueDate)}</Text>
                  
                  <View style={styles.hwItemActions}>
                    <Pressable
                      style={styles.editBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEditClick(hw);
                      }}>
                      <Text style={styles.editBtnText}>Edit Details</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
            {homeworkList.length === 0 ? (
              <Text style={styles.emptyText}>No homework assigned to this class yet.</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.submissionsCol}>
          {/* Submissions list */}
          {selectedHomework ? (
            <Card style={styles.cardPadding}>
              <Text style={styles.sectionTitle}>Submissions: {selectedHomework.title}</Text>
              <Text style={styles.subMeta}>
                Due Date: {formatDate(selectedHomework.dueDate)}
                {!selectedHomework.published ? ' • DRAFT (No submissions created yet)' : ''}
              </Text>

              {selectedSubId ? (
                // Grading Form
                <View style={styles.gradingForm}>
                  <View style={styles.gradingHeader}>
                    <Text style={styles.gradingTitle}>
                      Grading: {submissions.find((s) => s.id === selectedSubId)?.studentName}
                    </Text>
                    <Pressable onPress={() => setSelectedSubId('')}>
                      <Text style={styles.cancelLink}>Cancel</Text>
                    </Pressable>
                  </View>

                  <FormField label="Grade / Score (e.g. A, B+, 9/10)">
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. A+, 85%"
                      placeholderTextColor={AppTheme.textMuted}
                      value={grade}
                      onChangeText={setGrade}
                    />
                  </FormField>

                  <FormField label="Remarks / Feedback">
                    <TextInput
                      style={styles.input}
                      placeholder="Feedback comments for student..."
                      placeholderTextColor={AppTheme.textMuted}
                      value={remarks}
                      onChangeText={setRemarks}
                    />
                  </FormField>

                  {gradeErr ? <Text style={styles.errorText}>{gradeErr}</Text> : null}

                  <Button
                    title="Submit Grade"
                    loading={submittingGrade}
                    onPress={handleGrade}
                    style={styles.btnMargin}
                  />
                </View>
              ) : (
                // Submissions Table/List
                <ScrollView showsVerticalScrollIndicator={false} style={styles.subScroll}>
                  {submissions.map((sub) => (
                    <View key={sub.id} style={styles.subRow}>
                      <View style={styles.subStudentInfo}>
                        <Text style={styles.subStudentName}>{sub.studentName}</Text>
                        <Text style={styles.subStatusText}>
                          Status:{' '}
                          <Text style={[styles.boldText, sub.status === 'graded' ? styles.greenText : sub.status === 'submitted' ? styles.blueText : styles.redText]}>
                            {sub.status === 'graded' ? 'Graded' : sub.status === 'submitted' ? 'Submitted' : 'Pending'}
                          </Text>
                        </Text>
                        {sub.grade ? <Text style={styles.subGradeText}>Grade: {sub.grade}</Text> : null}
                      </View>
                      
                      {sub.status === 'submitted' || sub.status === 'graded' ? (
                        <Pressable
                          onPress={() => {
                            setSelectedSubId(sub.id);
                            setGrade(sub.grade || '');
                            setRemarks(sub.remarks || '');
                          }}
                          style={styles.gradeBtn}>
                          <Text style={styles.gradeBtnText}>{sub.status === 'graded' ? 'Edit Grade' : 'Grade Now'}</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                  {selectedHomework.published && submissions.length === 0 ? (
                    <Text style={styles.emptyText}>No students registered in this class.</Text>
                  ) : null}
                  {!selectedHomework.published ? (
                    <Text style={styles.emptyText}>
                      This homework is a draft. Publish it to create student submissions.
                    </Text>
                  ) : null}
                </ScrollView>
              )}
            </Card>
          ) : (
            <Card style={[styles.cardPadding, styles.centeredCard]}>
              <Text style={styles.emptyText}>Please select a homework assignment on the left to view submissions.</Text>
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
  submissionsCol: {
    flex: 1.2,
    minWidth: 340,
  },
  cardPadding: {
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 12,
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
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  flexBtn: {
    flex: 1,
  },
  errorText: {
    color: AppTheme.danger,
    fontSize: 14,
    marginTop: 6,
  },
  hwListContainer: {
    marginTop: 20,
  },
  hwItemCard: {
    backgroundColor: AppTheme.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  hwItemCardActive: {
    borderColor: AppTheme.primary,
    backgroundColor: `${AppTheme.primary}06`,
  },
  hwItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hwItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.text,
    flex: 1,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  hwItemDate: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  hwItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editBtn: {
    borderColor: AppTheme.primary,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editBtnText: {
    fontSize: 11,
    color: AppTheme.primary,
    fontWeight: '600',
  },
  subMeta: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginBottom: 16,
  },
  subScroll: {
    maxHeight: 460,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    gap: 12,
  },
  subStudentInfo: {
    flex: 1,
  },
  subStudentName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.text,
  },
  subStatusText: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  subGradeText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.success,
    marginTop: 2,
  },
  boldText: {
    fontWeight: '700',
  },
  greenText: { color: AppTheme.success },
  blueText: { color: '#3b82f6' },
  redText: { color: AppTheme.danger },
  gradeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AppTheme.primary,
    backgroundColor: 'transparent',
  },
  gradeBtnText: {
    fontSize: 12,
    color: AppTheme.primary,
    fontWeight: '600',
  },
  gradingForm: {
    backgroundColor: AppTheme.background,
    borderRadius: 8,
    padding: 14,
  },
  gradingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gradingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
  },
  cancelLink: {
    fontSize: 13,
    color: AppTheme.danger,
    fontWeight: '600',
  },
  centeredCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    fontSize: 14,
  },
  btnMargin: {
    marginTop: 12,
  },
});
