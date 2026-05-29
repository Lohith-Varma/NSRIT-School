export type UserRole =
  | 'main_admin'
  | 'branch_admin'
  | 'principal'
  | 'coordinator'
  | 'teacher'
  | 'parent'
  | 'student'
  | 'accountant'
  | 'front_desk';

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
  classId?: string;
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
  admissionNumber?: string;
  status?: 'Active' | 'Inactive' | 'Graduated' | 'Transferred' | 'Dropped';
  phone?: string;
  address?: string;
  emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  subject: string;
  examName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
  date: string;
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

export interface Complaint {
  id: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  branchId: string;
  status: 'Submitted' | 'Under Review' | 'Verified' | 'Forwarded to Principal' | 'Resolved' | 'Rejected';
  coordinatorComments?: string;
  principalComments?: string;
  resolutionComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  rating: number;
  comments: string;
  branchId: string;
  createdAt: string;
}

export interface TimetableSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  subject: string;
  teacherId: string;
  teacherName: string;
}

export interface Timetable {
  id: string;
  branchId: string;
  classId: string;
  className: string;
  section: string;
  slots: TimetableSlot[];
}

export interface Homework {
  id: string;
  branchId: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  published?: boolean;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  remarks?: string;
}

export interface VisitorLog {
  id: string;
  branchId: string;
  name: string;
  purpose: string;
  contactNumber: string;
  checkInTime: string;
  checkOutTime?: string;
}

export interface ParentEnquiry {
  id: string;
  branchId: string;
  parentName: string;
  contactNumber: string;
  email: string;
  studentGrade: string;
  comments: string;
  status: 'pending' | 'responded';
  createdAt: string;
}

export interface DocumentRequest {
  id: string;
  branchId: string;
  studentId: string;
  studentName: string;
  documentType: 'Study Certificate' | 'Bonafide Certificate' | 'Marks Sheet';
  status: 'Requested' | 'Processing' | 'Issued' | 'Rejected';
  requestedAt: string;
}

export interface TransferCertificateRequest {
  id: string;
  branchId: string;
  studentId: string;
  studentName: string;
  reason: string;
  status: 'Submitted' | 'Approved' | 'Rejected';
  requestedAt: string;
}

export interface Announcement {
  id: string;
  branchId: string;
  title: string;
  content: string;
  targetAudience: 'All' | 'Parents' | 'Teachers';
  createdAt: string;
}

export interface FeeReceipt {
  id: string;
  branchId: string;
  feeStatusId: string;
  studentId: string;
  studentName: string;
  amountPaid: number;
  paymentMethod: 'Cash' | 'Cheque' | 'Card' | 'Online';
  transactionDate: string;
  receiptNumber: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  role?: string;
  branchId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface StudyMaterial {
  id: string;
  branchId: string;
  classId: string;
  className: string;
  subject: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'notes' | 'ppt';
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
}

export interface Exam {
  id: string;
  branchId: string;
  classId: string;
  className: string;
  subject: string;
  name: string;
  date: string;
  maxMarks: number;
  status: 'scheduled' | 'grading' | 'published';
}

export interface GalleryAlbum {
  id: string;
  branchId: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  branchId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: string;
}

