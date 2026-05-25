import { mockStore } from '@/data/mock/store';
import type { FeePaymentStatus, FeeStatus } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertParentChildAccess } from './parent';
import { assertActorOwnsClass, assertPermission, assertRole } from './rbac';
import { getStudentsInClass } from './classes';

export interface ClassFeeRow extends FeeStatus {
  studentName: string;
}

/** GET /classes/:classId/fees */
export async function getClassFeeStatuses(actor: User, classId: string): Promise<ClassFeeRow[]> {
  assertPermission(actor, 'fees:read');
  assertRole(actor, 'teacher');

  const cls = mockStore.classes.find((c) => c.id === classId);
  if (!cls) throw new ApiError('Class not found', 404);
  assertActorOwnsClass(actor, cls);
  if (cls.teacherId !== actor.id) {
    throw new ApiError('You are not assigned to this class', 403);
  }

  const students = await getStudentsInClass(actor, classId);
  const nameById = Object.fromEntries(students.map((s) => [s.id, s.name]));

  const rows = mockStore.fees
    .filter((f) => f.classId === classId && f.branchId === cls.branchId)
    .map((f) => ({
      ...f,
      studentName: nameById[f.studentId] ?? 'Unknown',
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName));

  return mockRequest(rows);
}

/** GET /students/:studentId/fees */
export async function getStudentFeeStatus(actor: User, studentId: string): Promise<FeeStatus> {
  assertRole(actor, 'parent');
  assertParentChildAccess(actor, studentId);

  const student = mockStore.users.find((u) => u.id === studentId && u.role === 'student');
  if (!student?.branchId) throw new ApiError('Student not found', 404);

  const fee = mockStore.fees.find(
    (f) => f.studentId === studentId && f.branchId === student.branchId,
  );
  if (!fee) throw new ApiError('Fee record not found', 404);

  return mockRequest({ ...fee, feeStructure: [...fee.feeStructure] });
}

export function formatFeeStatus(status: FeePaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'partial':
      return 'Partial';
  }
}

export function feeStatusColor(status: FeePaymentStatus): string {
  switch (status) {
    case 'paid':
      return '#16a34a';
    case 'pending':
      return '#dc2626';
    case 'partial':
      return '#d97706';
  }
}
