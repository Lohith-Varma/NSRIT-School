import { mockStore } from '@/data/mock/store';
import type { User, Class, Wing } from '@/types';
import { ApiError, mockRequest } from './client';
import {
  assertPermission,
  assertBranchAccess,
  assertWingAccess,
  requireBranchId,
} from './rbac';

/**
 * Generates the next sequential admission number of format ADM-2026-XXXX.
 */
export function generateAdmissionNumber(): string {
  const currentYear = new Date().getFullYear(); // e.g. 2026
  const prefix = `ADM-${currentYear}-`;
  
  let maxSeq = 0;
  for (const user of mockStore.users) {
    if (user.role === 'student' && user.admissionNumber && user.admissionNumber.startsWith(prefix)) {
      const seqStr = user.admissionNumber.replace(prefix, '');
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  
  const nextSeq = maxSeq + 1;
  const zeroPaddedSeq = String(nextSeq).padStart(4, '0');
  return `${prefix}${zeroPaddedSeq}`;
}

export interface StudentProfile {
  student: User;
  class?: Class;
  parent?: User;
}

/**
 * Get full student profile including Class and Parent details.
 */
export async function getStudentProfile(actor: User, studentId: string): Promise<StudentProfile> {
  assertPermission(actor, 'students:read');
  
  const student = mockStore.users.find((u) => u.id === studentId && u.role === 'student');
  if (!student) {
    throw new ApiError('Student not found', 404);
  }
  
  assertBranchAccess(actor, student.branchId || '');
  if (student.wing) {
    assertWingAccess(actor, student.wing);
  }
  
  const cls = mockStore.classes.find((c) => c.id === student.classId);
  const parent = mockStore.users.find((u) => u.id === student.parentId && u.role === 'parent');
  
  return mockRequest({
    student: { ...student },
    class: cls ? { ...cls } : undefined,
    parent: parent ? { ...parent } : undefined,
  });
}

/**
 * Update student's status (Active, Inactive, Graduated, Transferred, Dropped)
 */
export async function updateStudentStatus(
  actor: User,
  studentId: string,
  status: User['status'],
): Promise<User> {
  assertPermission(actor, 'students:write');
  
  const studentIndex = mockStore.users.findIndex((u) => u.id === studentId && u.role === 'student');
  if (studentIndex < 0) {
    throw new ApiError('Student not found', 404);
  }
  
  const student = mockStore.users[studentIndex];
  assertBranchAccess(actor, student.branchId || '');
  if (student.wing) {
    assertWingAccess(actor, student.wing);
  }
  
  student.status = status;
  mockStore.users[studentIndex] = student;
  
  return mockRequest({ ...student });
}

/**
 * Transfer student to another section of the same grade.
 */
export async function transferSection(
  actor: User,
  studentId: string,
  targetClassId: string,
): Promise<User> {
  assertPermission(actor, 'students:write');
  
  const studentIndex = mockStore.users.findIndex((u) => u.id === studentId && u.role === 'student');
  if (studentIndex < 0) {
    throw new ApiError('Student not found', 404);
  }
  
  const student = mockStore.users[studentIndex];
  assertBranchAccess(actor, student.branchId || '');
  if (student.wing) {
    assertWingAccess(actor, student.wing);
  }
  
  const currentClass = mockStore.classes.find((c) => c.id === student.classId);
  const targetClassIndex = mockStore.classes.findIndex((c) => c.id === targetClassId);
  if (targetClassIndex < 0) {
    throw new ApiError('Target class not found', 404);
  }
  
  const targetClass = mockStore.classes[targetClassIndex];
  assertBranchAccess(actor, targetClass.branchId);
  assertWingAccess(actor, targetClass.wing);
  
  if (currentClass && currentClass.grade !== targetClass.grade) {
    throw new ApiError('Section transfer is only allowed within the same grade level', 400);
  }
  
  // Perform transfer
  const oldClassId = student.classId;
  student.classId = targetClassId;
  student.wing = targetClass.wing;
  mockStore.users[studentIndex] = student;
  
  if (oldClassId) {
    const oldClassIndex = mockStore.classes.findIndex((c) => c.id === oldClassId);
    if (oldClassIndex >= 0) {
      mockStore.classes[oldClassIndex].studentIds = mockStore.classes[oldClassIndex].studentIds.filter(
        (id) => id !== studentId,
      );
    }
  }
  
  if (!targetClass.studentIds.includes(studentId)) {
    targetClass.studentIds.push(studentId);
  }
  
  return mockRequest({ ...student });
}

/**
 * Promote student to another class/grade.
 */
export async function promoteStudent(
  actor: User,
  studentId: string,
  targetClassId: string,
): Promise<User> {
  assertPermission(actor, 'students:write');
  
  const studentIndex = mockStore.users.findIndex((u) => u.id === studentId && u.role === 'student');
  if (studentIndex < 0) {
    throw new ApiError('Student not found', 404);
  }
  
  const student = mockStore.users[studentIndex];
  assertBranchAccess(actor, student.branchId || '');
  if (student.wing) {
    assertWingAccess(actor, student.wing);
  }
  
  const targetClassIndex = mockStore.classes.findIndex((c) => c.id === targetClassId);
  if (targetClassIndex < 0) {
    throw new ApiError('Target class not found', 404);
  }
  
  const targetClass = mockStore.classes[targetClassIndex];
  assertBranchAccess(actor, targetClass.branchId);
  assertWingAccess(actor, targetClass.wing);
  
  const oldClassId = student.classId;
  student.classId = targetClassId;
  student.wing = targetClass.wing;
  mockStore.users[studentIndex] = student;
  
  if (oldClassId) {
    const oldClassIndex = mockStore.classes.findIndex((c) => c.id === oldClassId);
    if (oldClassIndex >= 0) {
      mockStore.classes[oldClassIndex].studentIds = mockStore.classes[oldClassIndex].studentIds.filter(
        (id) => id !== studentId,
      );
    }
  }
  
  if (!targetClass.studentIds.includes(studentId)) {
    targetClass.studentIds.push(studentId);
  }
  
  return mockRequest({ ...student });
}
