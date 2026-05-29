import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { formatWing } from '@/constants/Wings';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useActor } from '@/hooks/useActor';
import {
  createStudent,
  getWingClassesForEnrollment,
  getWingStudents,
  getStudentProfile,
  updateStudentStatus,
  transferSection,
  promoteStudent,
} from '@/services/api';
import { StudentIdCard } from '@/components/student/StudentIdCard';
import type { StudentProfile } from '@/services/api/studentManagement';
import type { Class, User } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, Modal, View, ScrollView, ActivityIndicator } from 'react-native';

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

  // Modal / Profile States
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [updatingAction, setUpdatingAction] = useState(false);

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

  const handleOpenProfile = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowProfileModal(true);
    setLoadingProfile(true);
    setSelectedProfile(null);
    try {
      const profile = await getStudentProfile(actor, studentId);
      setSelectedProfile(profile);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not fetch student profile.');
      setShowProfileModal(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleStatusChange = async (status: User['status']) => {
    if (!selectedStudentId) return;
    setUpdatingAction(true);
    try {
      const updatedStudent = await updateStudentStatus(actor, selectedStudentId, status);
      setSelectedProfile((prev) => (prev ? { ...prev, student: updatedStudent } : null));
      await load();
      Alert.alert('Success', 'Student status updated.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update status.');
    } finally {
      setUpdatingAction(false);
    }
  };

  const handleSectionTransfer = async (targetClassId: string) => {
    if (!selectedStudentId) return;
    setUpdatingAction(true);
    try {
      const updatedStudent = await transferSection(actor, selectedStudentId, targetClassId);
      const targetClass = classes.find((c) => c.id === targetClassId);
      setSelectedProfile((prev) => (prev ? { ...prev, student: updatedStudent, class: targetClass } : null));
      await load();
      Alert.alert('Success', 'Section transfer successful.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to transfer section.');
    } finally {
      setUpdatingAction(false);
    }
  };

  const handlePromotion = async (targetClassId: string) => {
    if (!selectedStudentId) return;
    setUpdatingAction(true);
    try {
      const updatedStudent = await promoteStudent(actor, selectedStudentId, targetClassId);
      const targetClass = classes.find((c) => c.id === targetClassId);
      setSelectedProfile((prev) => (prev ? { ...prev, student: updatedStudent, class: targetClass } : null));
      await load();
      Alert.alert('Success', 'Student promoted successfully.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to promote student.');
    } finally {
      setUpdatingAction(false);
    }
  };

  const classLabel = (id: string) => {
    const c = classes.find((x) => x.id === id);
    return c ? `Gr ${c.grade} ${c.name} (${c.section})` : id;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return AppTheme.success;
      case 'Inactive':
        return AppTheme.textMuted;
      case 'Graduated':
        return '#3b82f6';
      case 'Transferred':
        return AppTheme.warning;
      case 'Dropped':
        return AppTheme.danger;
      default:
        return AppTheme.success;
    }
  };

  // Compute options for section transfer & promotion based on selected student's class
  const currentGrade = selectedProfile?.class ? parseInt(selectedProfile.class.grade, 10) : NaN;
  
  const sectionTransferOptions = selectedProfile?.class
    ? classes.filter((c) => c.grade === selectedProfile.class?.grade && c.id !== selectedProfile.class?.id)
    : [];

  const promotionOptions = selectedProfile?.class && !isNaN(currentGrade)
    ? classes.filter((c) => {
        const g = parseInt(c.grade, 10);
        return !isNaN(g) && g > currentGrade;
      })
    : [];

  const statuses: User['status'][] = ['Active', 'Inactive', 'Graduated', 'Transferred', 'Dropped'];

  return (
    <Screen loading={loading} scroll>
      {user?.wing ? (
        <Text style={styles.wingBadge}>{formatWing(user.wing)} only</Text>
      ) : null}

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
        <Pressable key={s.id} onPress={() => handleOpenProfile(s.id)}>
          <Card style={styles.studentCard}>
            <View style={styles.studentCardHeader}>
              <Text style={styles.title}>{s.name}</Text>
              <View
                style={[
                  styles.listStatusBadge,
                  {
                    backgroundColor: `${getStatusColor(s.status)}15`,
                    borderColor: getStatusColor(s.status),
                  },
                ]}
              >
                <Text style={[styles.listStatusText, { color: getStatusColor(s.status) }]}>
                  {s.status || 'Active'}
                </Text>
              </View>
            </View>
            <Text style={styles.meta}>Admission No: {s.admissionNumber || '—'}</Text>
            <Text style={styles.meta}>Email: {s.email}</Text>
            <Text style={styles.meta}>Class: {s.classId ? classLabel(s.classId) : '—'}</Text>
            <Text style={styles.cardClickPrompt}>Tap to view ID Card & Actions</Text>
          </Card>
        </Pressable>
      ))}

      {/* Student Profile & Actions Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Student Profile</Text>
              <Pressable onPress={() => setShowProfileModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            {loadingProfile ? (
              <ActivityIndicator size="large" color={AppTheme.primary} style={{ marginVertical: 40 }} />
            ) : selectedProfile ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Virtual ID Card */}
                <StudentIdCard
                  student={selectedProfile.student}
                  className={selectedProfile.class ? classLabel(selectedProfile.class.id) : '—'}
                />

                {/* Parent Contact Info */}
                {selectedProfile.parent ? (
                  <View style={styles.parentBox}>
                    <Text style={styles.parentTitle}>Parent Contact Details</Text>
                    <Text style={styles.parentText}>Name: {selectedProfile.parent.name}</Text>
                    <Text style={styles.parentText}>Email: {selectedProfile.parent.email}</Text>
                  </View>
                ) : null}

                {/* Action Controls Section */}
                {updatingAction ? (
                  <ActivityIndicator size="small" color={AppTheme.primary} style={{ marginVertical: 12 }} />
                ) : (
                  <View>
                    {/* Status Management */}
                    <Text style={styles.modalSectionTitle}>Update Status</Text>
                    <View style={styles.statusBtnRow}>
                      {statuses.map((st) => {
                        const isCurrent = (selectedProfile.student.status || 'Active') === st;
                        const col = getStatusColor(st);
                        return (
                          <Pressable
                            key={st}
                            onPress={() => handleStatusChange(st)}
                            style={[
                              styles.statusBtn,
                              isCurrent && { backgroundColor: `${col}18`, borderColor: col },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBtnText,
                                { color: isCurrent ? col : AppTheme.textMuted },
                              ]}
                            >
                              {st}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* Section Transfer */}
                    <Text style={styles.modalSectionTitle}>Section Transfer (Same Grade)</Text>
                    {sectionTransferOptions.length > 0 ? (
                      sectionTransferOptions.map((c) => (
                        <Pressable
                          key={c.id}
                          onPress={() => handleSectionTransfer(c.id)}
                          style={styles.actionBtn}
                        >
                          <Text style={styles.actionBtnText}>
                            Transfer to: Gr {c.grade} {c.name} ({c.section})
                          </Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.noActionsText}>No other sections available in this grade.</Text>
                    )}

                    {/* Promotion Management */}
                    <Text style={styles.modalSectionTitle}>Student Promotion (Next Grade)</Text>
                    {promotionOptions.length > 0 ? (
                      promotionOptions.map((c) => (
                        <Pressable
                          key={c.id}
                          onPress={() => handlePromotion(c.id)}
                          style={styles.actionBtn}
                        >
                          <Text style={styles.actionBtnText}>
                            Promote to: Gr {c.grade} {c.name} ({c.section})
                          </Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.noActionsText}>No higher grade classes available in this wing.</Text>
                    )}
                  </View>
                )}
              </ScrollView>
            ) : (
              <Text style={{ textAlign: 'center', marginVertical: 20 }}>No profile loaded.</Text>
            )}
          </View>
        </View>
      </Modal>
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
  studentCard: {
    padding: 16,
    marginBottom: 12,
  },
  studentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listStatusBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  listStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardClickPrompt: {
    fontSize: 12,
    color: AppTheme.accent,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: AppTheme.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '600',
    color: AppTheme.textMuted,
    padding: 4,
  },
  parentBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  parentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 4,
  },
  parentText: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.text,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
    marginBottom: 8,
  },
  actionBtnText: {
    fontSize: 13,
    color: AppTheme.text,
    fontWeight: '500',
  },
  noActionsText: {
    fontSize: 13,
    color: AppTheme.textMuted,
    fontStyle: 'italic',
  },
});
