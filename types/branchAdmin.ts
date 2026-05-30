import type { AttendanceStatus } from '@/types';

export type BranchAnnouncementTab = 'announcements' | 'circulars';
export type BranchAnnouncementStatus = 'delivered' | 'scheduled' | 'draft';
export type AttendanceFilterTab = 'all' | 'flagged' | 'pending';
export type PasswordAccountType = 'student' | 'staff';

export interface BranchAnnouncement {
  id: string;
  title: string;
  summary: string;
  wing: string;
  audience: string;
  timeAgo: string;
  deliveryRate?: number;
  status: BranchAnnouncementStatus;
  icon: 'campaign' | 'warning' | 'event';
}

export interface BranchAttendanceCorrectionRecord {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  status: AttendanceStatus;
  recordedAt: string;
  classLabel: string;
}

export interface BranchFinancialMetrics {
  pendingDues: number;
  collectedYtd: number;
  collectionGoalPercent: number;
  collectionTarget: number;
}

export interface BranchFeeTransaction {
  id: string;
  studentName: string;
  initials: string;
  amount: number;
  method: string;
  time: string;
}

export interface BranchGradeFeeBar {
  grade: string;
  collectedPercent: number;
  pendingPercent: number;
  collectedLabel: string;
  pendingLabel: string;
}

export interface BranchTeacherCandidate {
  id: string;
  name: string;
  subject: string;
  avatarUrl?: string;
  statusLabel: string;
  selected?: boolean;
}

export interface BranchStudentRegistryItem {
  id: string;
  name: string;
  email: string;
  studentCode: string;
  joinDate: string;
  classSection: string;
  status: 'enrolled' | 'on_leave' | 'issue';
}

export interface BranchCourseRow {
  id: string;
  name: string;
  code: string;
  department: string;
  classLabel: string;
  section: string;
  status: 'active' | 'inactive' | 'archived';
  studentCount: number;
}

export interface BranchProfileDetails {
  name: string;
  role: string;
  branch: string;
  department: string;
  joinDate: string;
  employeeId: string;
  phone: string;
  email: string;
  dob: string;
  address: string;
  reportsManaged: number;
  serviceYears: number;
}

export interface BranchFeeLookupSummary {
  rollNumber: string;
  name: string;
  grade: string;
  status: 'active' | 'inactive';
  totalFee: number;
  paid: number;
  due: number;
  nextDueDate?: string;
  nextDueLabel?: string;
  breakdown: {
    id: string;
    label: string;
    amount: number;
    status: 'paid' | 'pending';
    icon: 'tuition' | 'transport' | 'admission' | 'library' | 'other';
  }[];
}

export interface BranchStaffHubStats {
  totalStudents: number;
  activeStudents: number;
  onLeave: number;
  regIssues: number;
}
