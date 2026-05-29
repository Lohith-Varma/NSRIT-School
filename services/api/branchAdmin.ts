import {
  MOCK_BRANCH_ANNOUNCEMENTS,
  MOCK_BRANCH_ATTENDANCE,
  MOCK_BRANCH_PROFILE,
  MOCK_COURSES,
  MOCK_FEE_LOOKUP,
  MOCK_FINANCIAL,
  MOCK_GRADE_FEES,
  MOCK_STAFF_STATS,
  MOCK_STUDENTS_REGISTRY,
  MOCK_TEACHERS_ASSIGN,
  MOCK_TRANSACTIONS,
} from '@/data/mock/branchAdmin';
import type { User } from '@/types';
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

function delay(ms = 260): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function listBranchAnnouncements(_actor: User): Promise<BranchAnnouncement[]> {
  await delay();
  return [...MOCK_BRANCH_ANNOUNCEMENTS];
}

export async function listAttendanceCorrections(_actor: User): Promise<BranchAttendanceCorrectionRecord[]> {
  await delay();
  return [...MOCK_BRANCH_ATTENDANCE];
}

export async function getFinancialMonitoring(_actor: User): Promise<{
  metrics: BranchFinancialMetrics;
  gradeBars: BranchGradeFeeBar[];
  transactions: BranchFeeTransaction[];
}> {
  await delay();
  return {
    metrics: { ...MOCK_FINANCIAL },
    gradeBars: [...MOCK_GRADE_FEES],
    transactions: [...MOCK_TRANSACTIONS],
  };
}

export async function lookupBranchFees(_actor: User, roll: string): Promise<BranchFeeLookupSummary | null> {
  await delay();
  if (!roll.trim()) return null;
  return { ...MOCK_FEE_LOOKUP, rollNumber: roll.trim() };
}

export async function listTeacherCandidates(_actor: User): Promise<BranchTeacherCandidate[]> {
  await delay();
  return [...MOCK_TEACHERS_ASSIGN];
}

export async function listStudentRegistry(_actor: User): Promise<BranchStudentRegistryItem[]> {
  await delay();
  return [...MOCK_STUDENTS_REGISTRY];
}

export async function listBranchCourses(_actor: User): Promise<BranchCourseRow[]> {
  await delay();
  return [...MOCK_COURSES];
}

export async function getStaffHubStats(_actor: User): Promise<BranchStaffHubStats> {
  await delay();
  return { ...MOCK_STAFF_STATS };
}

export async function getBranchProfileDetails(_actor: User): Promise<BranchProfileDetails> {
  await delay();
  return { ...MOCK_BRANCH_PROFILE };
}

export async function resetPassword(_actor: User): Promise<void> {
  await delay(500);
}
