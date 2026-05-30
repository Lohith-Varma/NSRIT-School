import type {
  BranchAnnouncement,
  BranchAttendanceCorrectionRecord,
  BranchCourseRow,
  BranchFeeLookupSummary,
  BranchFinancialMetrics,
  BranchFeeTransaction,
  BranchGradeFeeBar,
  BranchProfileDetails,
  BranchStaffHubStats,
  BranchStudentRegistryItem,
  BranchTeacherCandidate,
} from '@/types/branchAdmin';

export const MOCK_BRANCH_ANNOUNCEMENTS: BranchAnnouncement[] = [
  {
    id: 'a1',
    title: 'Annual Sports Day Schedule Update',
    summary: 'Revised schedule for Primary wing events commencing at 09:00 AM.',
    wing: 'Primary Wing',
    audience: 'Parents',
    timeAgo: '2 hours ago',
    deliveryRate: 98,
    status: 'delivered',
    icon: 'campaign',
  },
  {
    id: 'a2',
    title: 'Urgent: Early Dismissal Due to Weather',
    summary: 'School closes early today. Buses depart at 1:00 PM.',
    wing: 'All Wings',
    audience: 'Parents & Staff',
    timeAgo: 'Yesterday',
    deliveryRate: 100,
    status: 'delivered',
    icon: 'warning',
  },
  {
    id: 'a3',
    title: 'Parent-Teacher Meeting Confirmation',
    summary: 'PTM for secondary wing scheduled for Saturday.',
    wing: 'Secondary Wing',
    audience: 'Parents',
    timeAgo: 'Oct 12',
    status: 'scheduled',
    icon: 'event',
  },
];

export const MOCK_BRANCH_ATTENDANCE: BranchAttendanceCorrectionRecord[] = [
  {
    id: 'ar1',
    studentId: 'STU-2023-0142',
    studentName: 'Jane Doe',
    initials: 'JD',
    status: 'absent',
    recordedAt: '08:15 AM',
    classLabel: 'Grade 10 - Section A',
  },
  {
    id: 'ar2',
    studentId: 'STU-2023-0334',
    studentName: 'Alice Lee',
    initials: 'AL',
    status: 'present',
    recordedAt: '08:05 AM',
    classLabel: 'Grade 10 - Section A',
  },
];

export const MOCK_FINANCIAL: BranchFinancialMetrics = {
  pendingDues: 150_000,
  collectedYtd: 485_200,
  collectionGoalPercent: 76,
  collectionTarget: 635_200,
};

export const MOCK_GRADE_FEES: BranchGradeFeeBar[] = [
  { grade: 'Gr 9', collectedPercent: 85, pendingPercent: 15, collectedLabel: '$120k', pendingLabel: '$20k' },
  { grade: 'Gr 10', collectedPercent: 70, pendingPercent: 30, collectedLabel: '$100k', pendingLabel: '$45k' },
  { grade: 'Gr 11', collectedPercent: 60, pendingPercent: 40, collectedLabel: '$95k', pendingLabel: '$60k' },
  { grade: 'Gr 12', collectedPercent: 90, pendingPercent: 10, collectedLabel: '$170k', pendingLabel: '$25k' },
];

export const MOCK_TRANSACTIONS: BranchFeeTransaction[] = [
  { id: 't1', studentName: 'Aryan Kumar', initials: 'AK', amount: 1200, method: 'RazorPay', time: 'Today, 10:42 AM' },
  { id: 't2', studentName: 'Sneha Patel', initials: 'SP', amount: 850, method: 'Cash', time: 'Yesterday' },
  { id: 't3', studentName: 'Rohan Joshi', initials: 'RJ', amount: 2100, method: 'Bank Transfer', time: 'Oct 12' },
];

export const MOCK_TEACHERS_ASSIGN: BranchTeacherCandidate[] = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    subject: 'Mathematics & Algebra',
    statusLabel: 'Managing 1 Class',
  },
  {
    id: 't2',
    name: 'Marcus Vane',
    subject: 'English Literature',
    statusLabel: 'Selected',
    selected: true,
  },
  {
    id: 't3',
    name: 'Dr. Elena Rossi',
    subject: 'Advanced Physics',
    statusLabel: 'Unassigned',
  },
  {
    id: 't4',
    name: 'Julian Hart',
    subject: 'World History',
    statusLabel: 'Managing 2 Classes',
  },
];

export const MOCK_STUDENTS_REGISTRY: BranchStudentRegistryItem[] = [
  {
    id: 's1',
    name: 'Elena Rodriguez',
    email: 'elena.r@nsrit.edu',
    studentCode: 'NSR-2024-001',
    joinDate: 'Aug 15, 2023',
    classSection: 'CS - Section A',
    status: 'enrolled',
  },
  {
    id: 's2',
    name: 'Julian Thorne',
    email: 'j.thorne@nsrit.edu',
    studentCode: 'NSR-2024-042',
    joinDate: 'Sep 01, 2023',
    classSection: 'ME - Section B',
    status: 'on_leave',
  },
  {
    id: 's3',
    name: 'Sarah Jenkins',
    email: 's.jenkins@nsrit.edu',
    studentCode: 'NSR-2024-105',
    joinDate: 'Jan 12, 2024',
    classSection: 'EE - Section C',
    status: 'issue',
  },
];

export const MOCK_COURSES: BranchCourseRow[] = [
  {
    id: 'c1',
    name: 'Advanced Quantum Mechanics',
    code: 'PHY-402',
    department: 'Physics & Applied Science',
    classLabel: 'Grade 10',
    section: 'A, B',
    status: 'active',
    studentCount: 43,
  },
  {
    id: 'c2',
    name: 'Data Structures & Algorithms',
    code: 'CSE-201',
    department: 'Computer Science',
    classLabel: 'Grade 10',
    section: 'A',
    status: 'active',
    studentCount: 124,
  },
  {
    id: 'c3',
    name: 'English Literature',
    code: 'ENGL-09-LIT',
    department: 'Humanities',
    classLabel: 'Grade 9',
    section: 'A, B, C',
    status: 'inactive',
    studentCount: 0,
  },
];

export const MOCK_FEE_LOOKUP: BranchFeeLookupSummary = {
  rollNumber: 'ADM-2024-089',
  name: 'Arjun Sharma',
  grade: '12-A',
  status: 'active',
  totalFee: 130_000,
  paid: 85_000,
  due: 45_000,
  nextDueDate: '15 Oct 2024',
  nextDueLabel: 'Term 2 Fees',
  breakdown: [
    { id: 'f1', label: 'Tuition Fee (Term 1)', amount: 50_000, status: 'paid', icon: 'tuition' },
    { id: 'f2', label: 'Library & Resources', amount: 10_000, status: 'paid', icon: 'library' },
    { id: 'f3', label: 'Transport Fee (Q3)', amount: 15_000, status: 'pending', icon: 'transport' },
  ],
};

export const MOCK_STAFF_STATS: BranchStaffHubStats = {
  totalStudents: 2482,
  activeStudents: 2105,
  onLeave: 124,
  regIssues: 42,
};

export const MOCK_BRANCH_PROFILE: BranchProfileDetails = {
  name: 'Arjun Sharma',
  role: 'Senior Branch Administrator',
  branch: 'North Campus - Delhi',
  department: 'Administration & Planning',
  joinDate: 'August 12, 2018',
  employeeId: 'NSRIT-ADM-994',
  phone: '+91 98765 43210',
  email: 'arjun.sharma@nsrit.edu',
  dob: 'March 15, 1985',
  address: 'H-24, 3rd Floor, Safdarjung Enclave, New Delhi - 110029',
  reportsManaged: 124,
  serviceYears: 6,
};
