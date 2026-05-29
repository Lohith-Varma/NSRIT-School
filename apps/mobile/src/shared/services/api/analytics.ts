import { mockStore } from '@/data/mock/store';
import type { SchoolAnalytics, User, Wing, WingAnalytics, WingMonitoringSummary } from '@/types';
import { mockRequest } from './client';
import {
  assertPermission,
  assertRole,
  assertWingAccess,
  getCoordinatorWing,
  requireBranchId,
} from './rbac';

function computeAttendanceRate(studentIds: string[]): number {
  if (studentIds.length === 0) return 0;
  const records = mockStore.attendance.filter((r) => studentIds.includes(r.studentId));
  if (records.length === 0) return 0;
  const present = records.filter((r) => r.status === 'present').length;
  return Math.round((present / records.length) * 100);
}

function computeFeeTotals(studentIds: string[]) {
  const fees = mockStore.fees.filter((f) => studentIds.includes(f.studentId));
  return {
    collected: fees.reduce((s, f) => s + f.paidAmount, 0),
    outstanding: fees.reduce((s, f) => s + f.dueAmount, 0),
    paidCount: fees.filter((f) => f.status === 'paid').length,
    pendingCount: fees.filter((f) => f.status === 'pending' || f.status === 'partial').length,
  };
}

function wingStudentIds(branchId: string, wing: Wing): string[] {
  return mockStore.users
    .filter((u) => u.role === 'student' && u.branchId === branchId && u.wing === wing)
    .map((u) => u.id);
}

function buildWingAnalytics(branchId: string, wing: Wing): WingAnalytics {
  const classes = mockStore.classes.filter((c) => c.branchId === branchId && c.wing === wing);
  const studentIds = wingStudentIds(branchId, wing);
  const fees = computeFeeTotals(studentIds);

  return {
    wing,
    studentCount: studentIds.length,
    classCount: classes.length,
    attendanceRate: computeAttendanceRate(studentIds),
    feesCollected: fees.collected,
    feesOutstanding: fees.outstanding,
  };
}

/** GET /admin/analytics — Principal / Branch Admin (single branch) */
export async function getSchoolAnalytics(actor: User): Promise<SchoolAnalytics> {
  assertPermission(actor, 'analytics:read');
  assertRole(actor, 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);

  const students = mockStore.users.filter((u) => u.role === 'student' && u.branchId === branchId);
  const teachers = mockStore.users.filter((u) => u.role === 'teacher' && u.branchId === branchId);
  const studentIds = students.map((s) => s.id);
  const fees = computeFeeTotals(studentIds);

  const byWing: WingAnalytics[] = (
    ['primary', 'secondary', 'higher_secondary'] as Wing[]
  ).map((w) => buildWingAnalytics(branchId, w));

  return mockRequest({
    branchId,
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: mockStore.classes.filter((c) => c.branchId === branchId).length,
    overallAttendanceRate: computeAttendanceRate(studentIds),
    totalFeesCollected: fees.collected,
    totalFeesOutstanding: fees.outstanding,
    paidStudents: fees.paidCount,
    pendingStudents: fees.pendingCount,
    byWing,
  });
}

/** GET /coordinator/monitoring — Wing-scoped within branch */
export async function getWingMonitoring(actor: User): Promise<WingMonitoringSummary[]> {
  assertPermission(actor, 'monitoring:read');
  assertRole(actor, 'principal', 'branch_admin', 'coordinator');

  const branchId = requireBranchId(actor);
  const wing = actor.role === 'coordinator' ? getCoordinatorWing(actor) : undefined;

  const classes = mockStore.classes.filter(
    (c) => c.branchId === branchId && (!wing || c.wing === wing),
  );

  const summaries: WingMonitoringSummary[] = classes.map((cls) => {
    const teacher = mockStore.users.find((u) => u.id === cls.teacherId);
    const fees = computeFeeTotals(cls.studentIds);

    return {
      classId: cls.id,
      className: cls.name,
      section: cls.section,
      grade: cls.grade,
      teacherName: teacher?.name ?? 'Unassigned',
      studentCount: cls.studentIds.length,
      attendanceRate: computeAttendanceRate(cls.studentIds),
      feesCollected: fees.collected,
      feesOutstanding: fees.outstanding,
    };
  });

  return mockRequest(summaries);
}

/** GET /coordinator/analytics — Wing summary */
export async function getWingAnalytics(actor: User): Promise<WingAnalytics> {
  assertRole(actor, 'coordinator', 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);
  const wing =
    actor.role === 'coordinator'
      ? getCoordinatorWing(actor)
      : actor.role === 'principal' || actor.role === 'branch_admin'
        ? 'secondary'
        : 'secondary';
  if (actor.role === 'coordinator') {
    assertWingAccess(actor, wing);
  }
  return mockRequest(buildWingAnalytics(branchId, wing));
}
