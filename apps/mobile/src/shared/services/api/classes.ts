import { mockStore } from '@/data/mock/store';
import type { Class, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertActorOwnsClass, assertPermission, assertRole, requireBranchId } from './rbac';

/** GET /classes/:id */
export async function getClassById(actor: User, classId: string): Promise<Class> {
  const cls = mockStore.classes.find((c) => c.id === classId);
  if (!cls) throw new ApiError('Class not found', 404);
  assertActorOwnsClass(actor, cls);
  return mockRequest({ ...cls });
}

/** GET /classes?teacherId= — caller must be that teacher */
export async function getClassesForTeacher(actor: User, teacherId: string): Promise<Class[]> {
  assertPermission(actor, 'classes:read');
  assertRole(actor, 'teacher');
  if (actor.id !== teacherId) throw new ApiError('Forbidden', 403);
  const bid = requireBranchId(actor);
  const classes = mockStore.classes.filter(
    (c) => c.branchId === bid && c.teacherId === teacherId,
  );
  return mockRequest(classes.map((c) => ({ ...c })));
}

/** GET /classes?wing= */
export async function getClassesByWing(actor: User, wing: string): Promise<Class[]> {
  assertPermission(actor, 'classes:read');
  const bid = requireBranchId(actor);
  const classes = mockStore.classes.filter((c) => c.branchId === bid && c.wing === wing);
  return mockRequest(classes.map((c) => ({ ...c })));
}

/** GET /classes/:id/students — teacher assigned to class */
export async function getStudentsInClass(actor: User, classId: string): Promise<User[]> {
  assertPermission(actor, 'classes:read');
  assertRole(actor, 'teacher');

  const cls = mockStore.classes.find((c) => c.id === classId);
  if (!cls) throw new ApiError('Class not found', 404);
  assertActorOwnsClass(actor, cls);

  if (cls.teacherId !== actor.id) {
    throw new ApiError('You are not assigned to this class', 403);
  }

  const students = mockStore.users.filter(
    (u) => u.role === 'student' && cls.studentIds.includes(u.id),
  );
  return mockRequest(students.map((s) => ({ ...s })));
}
