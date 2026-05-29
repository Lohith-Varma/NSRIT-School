/**
 * Firestore collection schema — multi-branch NSRIT School network.
 *
 * collections/
 *   branches/{branchId}
 *     - name, code, address?, active, settings { academicYear?, currentTermLabel?, timezone?, notes? }
 *
 *   users/{userId}
 *     - email, name, role, branchId? (omit for main_admin), wing?, parentId? (students), classId?, classIds?, subjects?
 *
 *   classes/{classId}
 *     - branchId, name, section, grade, wing, subject, teacherId, studentIds[]
 *
 *   attendance/{recordId}
 *     - branchId, classId, studentId, date, status, markedBy
 *
 *   fees/{feeId}
 *     - branchId, studentId, classId, totalAmount, paidAmount, dueAmount, status, feeStructure[]
 *
 * Composite indexes (recommended):
 *   - attendance: (branchId, classId, date)
 *   - attendance: (branchId, studentId, date desc)
 *   - classes: (branchId, wing, grade)
 *   - users: (branchId, role)
 *   - fees: (branchId, classId, status)
 */

import type { AttendanceRecord, Branch, Class, FeeStatus, User, Wing } from '@/types';

export type BranchesDocument = Branch;
export type UsersDocument = User;
export type ClassesDocument = Class;
export type AttendanceDocument = AttendanceRecord;
export type FeesDocument = FeeStatus;

export const COLLECTIONS = {
  branches: 'branches',
  users: 'users',
  classes: 'classes',
  attendance: 'attendance',
  fees: 'fees',
} as const;

/** Security rules sketch — tenant isolation by branchId */
export const RBAC_RULES = {
  main_admin: ['branches:*', 'branch_admins:*', 'network:read'],
  branch_admin: ['branch:*:*'], // principal-equivalent scope within branchId + branch_settings
  principal: ['branch:*:*'],
  coordinator: ['branch:wing:*'],
  teacher: ['branch:class:*'],
  parent: ['branch:children:read'],
  student: ['branch:self:*'],
} as const;

export const WINGS: Wing[] = ['primary', 'secondary', 'higher_secondary'];
