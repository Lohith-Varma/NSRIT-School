export type UserRole =
  | 'main_admin'
  | 'branch_admin'
  | 'principal'
  | 'coordinator'
  | 'teacher'
  | 'parent'
  | 'student';

export type Wing = 'primary' | 'secondary' | 'higher_secondary';

export type AttendanceStatus = 'present' | 'absent';

export type FeePaymentStatus = 'paid' | 'pending' | 'partial';

/** Branch-specific configuration (terms, metadata) */
export interface BranchSettings {
  academicYear?: string;
  currentTermLabel?: string;
  timezone?: string;
  notes?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  active: boolean;
  settings: BranchSettings;
}

/** Child profile returned to parent clients after login */
export interface ParentChildSummary {
  id: string;
  name: string;
  grade: string;
  wing: Wing;
  branchId: string;
  className?: string;
  section?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  /** Required for every role except main_admin */
  branchId?: string;
  /** School wing — required for coordinator; set on teachers/students */
  wing?: Wing;
  /** Linked parent account (students only) */
  parentId?: string;
  /** Assigned class for students */
  classId?: string;
  /** Classes this teacher manages */
  classIds?: string[];
  /** Subjects taught (teachers) */
  subjects?: string[];
}

export interface Class {
  id: string;
  branchId: string;
  name: string;
  section: string;
  grade: string;
  wing: Wing;
  subject: string;
  teacherId: string;
  studentIds: string[];
}

export interface AttendanceRecord {
  id: string;
  branchId: string;
  classId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
}

export interface FeeLineItem {
  label: string;
  amount: number;
}

export interface FeeStatus {
  id: string;
  branchId: string;
  studentId: string;
  classId: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: FeePaymentStatus;
  lastPaymentDate?: string;
  feeStructure: FeeLineItem[];
}

export interface AttendanceMarkInput {
  studentId: string;
  status: AttendanceStatus;
}

export interface StudentAttendanceSummary {
  records: AttendanceRecord[];
  presentCount: number;
  absentCount: number;
  totalDays: number;
  percentage: number;
}

/** Principal / Branch Admin: create / update class */
export interface ClassInput {
  name: string;
  section: string;
  grade: string;
  wing: Wing;
  subject: string;
  teacherId?: string;
}

/** Principal / Branch Admin: onboard teacher */
export interface TeacherInput {
  name: string;
  email: string;
  wing: Wing;
  subjects: string[];
  classIds?: string[];
}

/** Coordinator: onboard student */
export interface StudentInput {
  name: string;
  email: string;
  classId: string;
}

export interface CoordinatorApprovalRequest {
  id: string;
  studentName: string;
  classLabel: string;
  reason: string;
  duration: string;
  urgency: 'urgent' | 'normal';
}

export interface CoordinatorDiaryEntry {
  id: string;
  teacherName: string;
  subject: string;
  details: string;
  date: string;
}

export interface CoordinatorCircularReview {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: 'draft' | 'review' | 'published';
}

export interface WingAnalytics {
  wing: Wing;
  studentCount: number;
  classCount: number;
  attendanceRate: number;
  feesCollected: number;
  feesOutstanding: number;
}

/** Analytics for one branch (school site) */
export interface SchoolAnalytics {
  branchId: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  overallAttendanceRate: number;
  totalFeesCollected: number;
  totalFeesOutstanding: number;
  paidStudents: number;
  pendingStudents: number;
  byWing: WingAnalytics[];
}

export interface WingMonitoringSummary {
  classId: string;
  className: string;
  section: string;
  grade: string;
  teacherName: string;
  studentCount: number;
  attendanceRate: number;
  feesCollected: number;
  feesOutstanding: number;
}

/** Cross-branch network summary (Main Admin) */
export interface BranchSummaryStats {
  branchId: string;
  branchName: string;
  active: boolean;
  studentCount: number;
  teacherCount: number;
  classCount: number;
  attendanceRate: number;
  feesCollected: number;
  feesOutstanding: number;
}

export interface NetworkInsights {
  totalBranches: number;
  activeBranches: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  overallAttendanceRate: number;
  totalFeesCollected: number;
  totalFeesOutstanding: number;
  byBranch: BranchSummaryStats[];
}

/** Main Admin: create branch */
export interface BranchCreateInput {
  name: string;
  code: string;
  address?: string;
}

/** Main Admin: provision Branch Admin */
export interface BranchAdminProvisionInput {
  branchId: string;
  name: string;
  email: string;
}

/** POST /auth/login response */
export interface AuthSession {
  user: User;
  /** Populated when role is parent — linked children for profile switchers */
  children?: ParentChildSummary[];
}
