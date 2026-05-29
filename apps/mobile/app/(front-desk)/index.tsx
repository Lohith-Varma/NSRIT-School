import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useAuth } from '@/context/AuthContext';
import type { User, Class, Timetable, Announcement, Branch } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView } from 'react-native';
import { mockStore } from '@/data/mock/store';

type DashboardTab = 'students' | 'parents' | 'teachers' | 'timetables' | 'notices' | 'school';

export default function FrontDeskDashboardScreen() {
  const actor = useActor();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('students');
  const [loading, setLoading] = useState(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');

  // Domain states loaded from mockStore
  const [students, setStudents] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);

  // Selected sub-items
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    // Load from local store
    const branchId = actor.branchId;

    const bStudents = mockStore.users.filter((u) => u.branchId === branchId && u.role === 'student');
    const bParents = mockStore.users.filter((u) => u.branchId === branchId && u.role === 'parent');
    const bTeachers = mockStore.users.filter((u) => u.branchId === branchId && u.role === 'teacher');
    const bClasses = mockStore.classes.filter((c) => c.branchId === branchId);
    const bTimetables = mockStore.timetables.filter((t) => t.branchId === branchId);
    const bAnnouncements = mockStore.announcements.filter((a) => a.branchId === branchId);
    const bBranch = mockStore.branches.find((br) => br.id === branchId) || null;

    setStudents(bStudents);
    setParents(bParents);
    setTeachers(bTeachers);
    setClasses(bClasses);
    setTimetables(bTimetables);
    setAnnouncements(bAnnouncements);
    setBranch(bBranch);

    if (bClasses.length > 0) {
      setSelectedClassId(bClasses[0].id);
    }
    setLoading(false);
  }, [actor]);

  // Reset search query when switching tabs
  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedStudent(null);
  };

  // Filters
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.admissionNumber || '').toLowerCase().includes(q);
  });

  const filteredParents = parents.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesChild = mockStore.users.some(
      (u) => u.parentId === p.id && u.name.toLowerCase().includes(q)
    );
    return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || matchesChild;
  });

  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSubject = (t.subjects || []).some((s) => s.toLowerCase().includes(q));
    return t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || matchesSubject;
  });

  const filteredNotices = announcements.filter((a) => {
    const q = searchQuery.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
  });

  // Fetch children mapped under parent
  const getParentChildren = (parentId: string) => {
    return mockStore.users.filter((u) => u.parentId === parentId && u.role === 'student');
  };

  // Fetch class details helper
  const getStudentClassDetails = (classId?: string) => {
    if (!classId) return 'Unassigned';
    const cls = classes.find((c) => c.id === classId);
    return cls ? `${cls.name} (${cls.section})` : 'Unknown Class';
  };

  // Fetch teacher details helper
  const getTeacherName = (tid: string) => {
    const t = teachers.find((u) => u.id === tid);
    return t ? t.name : 'Unknown';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return AppTheme.success;
      case 'Inactive':
        return AppTheme.danger;
      case 'Graduated':
        return AppTheme.primary;
      case 'Transferred':
        return AppTheme.warning;
      case 'Dropped':
      default:
        return AppTheme.textMuted;
    }
  };

  const activeTimetable = timetables.find((t) => t.classId === selectedClassId);

  const initials = actor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <Screen title="Front Desk Information Deck" subtitle="CAMPUS INQUIRY PORTAL — VIEW ONLY ACCESS" loading={loading} scroll>
      {/* 1. Profile Hero Card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.name}>{actor.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Role: Front Desk Manager</Text>
            </View>
          </View>
          <Pressable onPress={signOut} style={styles.logoutBtn} hitSlop={8}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </Pressable>
        </View>
      </Card>
      {/* Navigation tabs row */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {([
            { id: 'students', label: 'Students', icon: 'graduation-cap' },
            { id: 'parents', label: 'Parents', icon: 'users' },
            { id: 'teachers', label: 'Teachers', icon: 'user' },
            { id: 'timetables', label: 'Timetables', icon: 'calendar' },
            { id: 'notices', label: 'Notices', icon: 'bullhorn' },
            { id: 'school', label: 'School Info', icon: 'university' },
          ] as const).map((t) => (
            <Pressable
              key={t.id}
              style={[styles.tabBtn, activeTab === t.id ? styles.tabBtnActive : null]}
              onPress={() => handleTabChange(t.id)}>
              <Text style={[styles.tabBtnText, activeTab === t.id ? styles.tabBtnTextActive : null]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Main Search Panel for searchable tabs */}
      {['students', 'parents', 'teachers', 'notices'].includes(activeTab) ? (
        <Card style={styles.searchCard}>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor={AppTheme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Card>
      ) : null}

      <View style={styles.layoutContainer}>
        {/* Tab 1: STUDENTS INFORMATION */}
        {activeTab === 'students' ? (
          <View style={styles.flexLayout}>
            <View style={styles.listCol}>
              <Text style={styles.colTitle}>Student Directory</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.listScroll}>
                {filteredStudents.map((st) => (
                  <Pressable
                    key={st.id}
                    style={[styles.itemCard, selectedStudent?.id === st.id ? styles.itemCardActive : null]}
                    onPress={() => setSelectedStudent(st)}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{st.name}</Text>
                      <Badge label={st.status || 'Active'} color={getStatusColor(st.status)} />
                    </View>
                    <Text style={styles.itemMeta}>Admission: {st.admissionNumber || '—'}</Text>
                    <Text style={styles.itemMeta}>Class: {getStudentClassDetails(st.classId)}</Text>
                  </Pressable>
                ))}
                {filteredStudents.length === 0 ? (
                  <Text style={styles.emptyText}>No matching students found.</Text>
                ) : null}
              </ScrollView>
            </View>

            <View style={styles.detailCol}>
              {selectedStudent ? (
                <Card style={styles.profileDetailCard}>
                  <Text style={styles.detailTitle}>Student Profile</Text>
                  
                  {/* Virtual ID Card */}
                  <Card style={styles.idCard}>
                    <View style={styles.idCardHeader}>
                      <View>
                        <Text style={styles.idCardTitle}>{selectedStudent.name}</Text>
                        <Text style={styles.idCardAdm}>ADM NO: {selectedStudent.admissionNumber || '—'}</Text>
                      </View>
                      <Badge label={selectedStudent.status || 'Active'} color={getStatusColor(selectedStudent.status)} />
                    </View>
                    
                    <View style={styles.idCardBody}>
                      <Text style={styles.idLabel}>WING: <Text style={styles.idVal}>{(selectedStudent.wing || '—').toUpperCase()}</Text></Text>
                      <Text style={styles.idLabel}>CLASS: <Text style={styles.idVal}>{getStudentClassDetails(selectedStudent.classId)}</Text></Text>
                      {selectedStudent.parentId ? (
                        <Text style={styles.idLabel}>PARENT ACCOUNT: <Text style={styles.idVal}>{selectedStudent.parentId}</Text></Text>
                      ) : null}
                    </View>

                    <View style={styles.barcodeBlock}>
                      <Text style={styles.barcodeText}>||||| | || |||| | ||||| | ||</Text>
                      <Text style={styles.schoolName}>NSRIT ACADEMY</Text>
                    </View>
                  </Card>
                </Card>
              ) : (
                <Card style={[styles.profileDetailCard, styles.centeredCard]}>
                  <Text style={styles.emptyText}>Select a student from the directory to view details.</Text>
                </Card>
              )}
            </View>
          </View>
        ) : null}

        {/* Tab 2: PARENTS INFORMATION */}
        {activeTab === 'parents' ? (
          <View style={styles.timeline}>
            {filteredParents.map((pt) => {
              const childrenList = getParentChildren(pt.id);
              return (
                <Card key={pt.id} style={styles.parentCard}>
                  <View style={styles.parentHeader}>
                    <View>
                      <Text style={styles.parentName}>{pt.name}</Text>
                      <Text style={styles.parentEmail}>Email: {pt.email}</Text>
                    </View>
                    <Badge label="Parent User" color={AppTheme.coordinator} />
                  </View>

                  <Text style={styles.parentChildrenTitle}>Linked Sibling Accounts:</Text>
                  <View style={styles.childrenGrid}>
                    {childrenList.map((ch) => (
                      <View key={ch.id} style={styles.childBadge}>
                        <Text style={styles.childName}>{ch.name}</Text>
                        <Text style={styles.childClass}>{getStudentClassDetails(ch.classId)}</Text>
                      </View>
                    ))}
                    {childrenList.length === 0 ? (
                      <Text style={styles.emptyText}>No linked student accounts.</Text>
                    ) : null}
                  </View>
                </Card>
              );
            })}
            {filteredParents.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No matching parents found.</Text>
              </Card>
            ) : null}
          </View>
        ) : null}

        {/* Tab 3: TEACHERS INFORMATION */}
        {activeTab === 'teachers' ? (
          <View style={styles.timeline}>
            {filteredTeachers.map((tc) => (
              <Card key={tc.id} style={styles.teacherCard}>
                <View style={styles.teacherHeader}>
                  <View>
                    <Text style={styles.teacherName}>{tc.name}</Text>
                    <Text style={styles.teacherEmail}>Email: {tc.email}</Text>
                  </View>
                  <Badge label={(tc.wing || 'teacher').toUpperCase()} color={AppTheme.accent} />
                </View>

                <View style={styles.teacherMetaRow}>
                  <Text style={styles.teacherMetaTitle}>Assigned Subjects:</Text>
                  <View style={styles.subjectTags}>
                    {(tc.subjects || []).map((sub, i) => (
                      <Badge key={i} label={sub} color="#3b82f6" />
                    ))}
                    {(tc.subjects || []).length === 0 ? (
                      <Text style={styles.emptyText}>No assigned subjects.</Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            ))}
            {filteredTeachers.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No matching teachers found.</Text>
              </Card>
            ) : null}
          </View>
        ) : null}

        {/* Tab 4: TIMETABLES VIEW */}
        {activeTab === 'timetables' ? (
          <View style={styles.timetableLayout}>
            <View style={styles.classSelector}>
              <Text style={styles.colTitle}>Select Class Timetable</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classTabs}>
                {classes.map((cls) => (
                  <Pressable
                    key={cls.id}
                    style={[styles.classTab, selectedClassId === cls.id ? styles.classTabActive : null]}
                    onPress={() => setSelectedClassId(cls.id)}>
                    <Text style={[styles.classTabText, selectedClassId === cls.id ? styles.classTabTextActive : null]}>
                      {cls.name} ({cls.section})
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {activeTimetable ? (
              <Card style={styles.timetableCard}>
                <Text style={styles.timetableTitle}>Weekly Timetable: {activeTimetable.className} ({activeTimetable.section})</Text>
                
                <ScrollView showsVerticalScrollIndicator={false} style={styles.tableScroll}>
                  {activeTimetable.slots.map((slot, index) => (
                    <View key={index} style={styles.slotRow}>
                      <View style={styles.dayCol}>
                        <Text style={styles.slotDay}>{slot.day}</Text>
                        <Text style={styles.slotPeriod}>Period {slot.period}</Text>
                      </View>
                      <View style={styles.slotDetails}>
                        <Text style={styles.slotSubject}>{slot.subject}</Text>
                        <Text style={styles.slotTeacher}>Teacher: {getTeacherName(slot.teacherId)}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </Card>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No timetable posted for this class.</Text>
              </Card>
            )}
          </View>
        ) : null}

        {/* Tab 5: NOTICES READ-ONLY BOARD */}
        {activeTab === 'notices' ? (
          <View style={styles.timeline}>
            {filteredNotices.map((ann) => (
              <Card key={ann.id} style={styles.noticeItemCard}>
                <View style={styles.noticeHeader}>
                  <Text style={styles.noticeTitle}>{ann.title}</Text>
                  <Badge label={`Audience: ${ann.targetAudience}`} color={AppTheme.primary} />
                </View>
                <Text style={styles.noticeContent}>{ann.content}</Text>
                <Text style={styles.noticeDate}>Date: {formatDate(ann.createdAt)}</Text>
              </Card>
            ))}
            {filteredNotices.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No announcements posted matching filters.</Text>
              </Card>
            ) : null}
          </View>
        ) : null}

        {/* Tab 6: SCHOOL BRANCH INFORMATION */}
        {activeTab === 'school' && branch ? (
          <View style={styles.timeline}>
            <Card style={styles.branchCard}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <Text style={styles.branchMeta}>Branch Code: <Text style={styles.bold}>{branch.code}</Text></Text>
              {branch.address ? (
                <Text style={styles.branchMeta}>Address: <Text style={styles.bold}>{branch.address}</Text></Text>
              ) : null}

              <View style={styles.sysMetaBlock}>
                <Text style={styles.sysMetaTitle}>Active ERP Parameters</Text>
                <View style={styles.sysMetaRow}>
                  <Text style={styles.sysMetaLabel}>Academic Year:</Text>
                  <Text style={styles.sysMetaVal}>{branch.settings?.academicYear || '2025-2026'}</Text>
                </View>
                <View style={styles.sysMetaRow}>
                  <Text style={styles.sysMetaLabel}>Current Active Term:</Text>
                  <Text style={styles.sysMetaVal}>{branch.settings?.currentTermLabel || 'Term 1'}</Text>
                </View>
                <View style={styles.sysMetaRow}>
                  <Text style={styles.sysMetaLabel}>Branch Timezone:</Text>
                  <Text style={styles.sysMetaVal}>{branch.settings?.timezone || 'IST (UTC+05:30)'}</Text>
                </View>
              </View>

              {branch.settings?.notes ? (
                <View style={styles.notesBlock}>
                  <Text style={styles.notesTitle}>School Notes / Instructions:</Text>
                  <Text style={styles.notesText}>{branch.settings.notes}</Text>
                </View>
              ) : null}
            </Card>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabsWrapper: {
    marginBottom: 14,
  },
  tabsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: AppTheme.surface,
    borderWidth: 1.5,
    borderColor: AppTheme.border,
  },
  tabBtnActive: {
    backgroundColor: AppTheme.accent,
    borderColor: AppTheme.accent,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  tabBtnTextActive: {
    color: '#fff',
  },
  searchCard: {
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
    backgroundColor: AppTheme.background,
  },
  layoutContainer: {
    marginBottom: 20,
  },
  flexLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  listCol: {
    flex: 1,
    minWidth: 320,
  },
  detailCol: {
    flex: 1.2,
    minWidth: 340,
  },
  colTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 10,
  },
  listScroll: {
    maxHeight: 520,
  },
  itemCard: {
    backgroundColor: AppTheme.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  itemCardActive: {
    borderColor: AppTheme.accent,
    backgroundColor: `${AppTheme.accent}06`,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.text,
  },
  itemMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  profileDetailCard: {
    padding: 20,
    minHeight: 300,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 16,
  },
  idCard: {
    padding: 20,
    backgroundColor: `${AppTheme.primary}10`,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.primary,
    borderColor: AppTheme.border,
    borderWidth: 1,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  idCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppTheme.text,
  },
  idCardAdm: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  idCardBody: {
    gap: 8,
    marginBottom: 16,
  },
  idLabel: {
    fontSize: 12,
    color: AppTheme.textMuted,
    fontWeight: '600',
  },
  idVal: {
    color: AppTheme.text,
    fontWeight: '700',
  },
  barcodeBlock: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppTheme.border,
  },
  barcodeText: {
    fontSize: 18,
    color: AppTheme.text,
    letterSpacing: 2,
  },
  schoolName: {
    fontSize: 10,
    fontWeight: '700',
    color: AppTheme.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  centeredCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeline: {
    gap: 12,
  },
  parentCard: {
    padding: 16,
  },
  parentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  parentEmail: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  parentChildrenTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  childBadge: {
    backgroundColor: AppTheme.background,
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  childName: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.text,
  },
  childClass: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  teacherCard: {
    padding: 16,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  teacherEmail: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  teacherMetaRow: {
    marginTop: 4,
  },
  teacherMetaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 6,
  },
  subjectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timetableLayout: {
    gap: 16,
  },
  classSelector: {
    gap: 8,
  },
  classTabs: {
    gap: 8,
  },
  classTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: AppTheme.surface,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  classTabActive: {
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  classTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.text,
  },
  classTabTextActive: {
    color: '#fff',
  },
  timetableCard: {
    padding: 18,
  },
  timetableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    paddingBottom: 8,
  },
  tableScroll: {
    maxHeight: 400,
  },
  slotRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    gap: 16,
    alignItems: 'center',
  },
  dayCol: {
    width: 90,
  },
  slotDay: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.text,
  },
  slotPeriod: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  slotDetails: {
    flex: 1,
  },
  slotSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  slotTeacher: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  noticeItemCard: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.primary,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
    flex: 1,
  },
  noticeContent: {
    fontSize: 14,
    color: AppTheme.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  noticeDate: {
    fontSize: 11,
    color: AppTheme.textMuted,
    textAlign: 'right',
  },
  branchCard: {
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.primary,
  },
  branchName: {
    fontSize: 18,
    fontWeight: '800',
    color: AppTheme.text,
    marginBottom: 10,
  },
  branchMeta: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  bold: {
    color: AppTheme.text,
    fontWeight: '600',
  },
  sysMetaBlock: {
    backgroundColor: AppTheme.background,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.border,
    marginTop: 18,
  },
  sysMetaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sysMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  sysMetaLabel: {
    fontSize: 12,
    color: AppTheme.textMuted,
  },
  sysMetaVal: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.text,
  },
  notesBlock: {
    marginTop: 16,
    backgroundColor: `${AppTheme.warning}08`,
    borderColor: AppTheme.warning,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.warning,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: AppTheme.text,
    lineHeight: 18,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: AppTheme.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  profileCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  welcome: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    marginVertical: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
