import { mockStore, nextClassId, nextUserId } from '@/data/mock/store';
import type { Class, ClassInput, TeacherInput, User } from '@/types';
import { ApiError, mockRequest } from './client';
import {
  assertActorOwnsClass,
  assertPermission,
  assertRole,
  requireBranchId,
} from './rbac';

function branchScopedSchoolRoles(actor: User): void {
  assertRole(actor, 'principal', 'branch_admin');
}

/** GET /admin/classes */
export async function listAllClasses(actor: User): Promise<Class[]> {
  assertPermission(actor, 'classes:read');
  branchScopedSchoolRoles(actor);
  const bid = requireBranchId(actor);
  return mockRequest(
    mockStore.classes.filter((c) => c.branchId === bid).map((c) => ({ ...c, studentIds: [...c.studentIds] })),
  );
}

/** POST /admin/classes */
export async function createClass(actor: User, input: ClassInput): Promise<Class> {
  assertPermission(actor, 'classes:write');
  branchScopedSchoolRoles(actor);
  const branchId = requireBranchId(actor);

  if (!input.name.trim() || !input.section.trim()) {
    throw new ApiError('Name and section are required', 400);
  }

  const id = nextClassId();
  const teacherId = input.teacherId ?? '';

  const cls: Class = {
    id,
    branchId,
    name: input.name.trim(),
    section: input.section.trim(),
    grade: input.grade.trim(),
    wing: input.wing,
    subject: input.subject.trim(),
    teacherId,
    studentIds: [],
  };

  mockStore.classes.push(cls);

  if (teacherId) {
    assignTeacherToClassInternal(actor, teacherId, id);
  }

  return mockRequest({ ...cls });
}

/** PATCH /admin/classes/:id */
export async function updateClass(
  actor: User,
  classId: string,
  input: Partial<ClassInput>,
): Promise<Class> {
  assertPermission(actor, 'classes:write');
  branchScopedSchoolRoles(actor);

  const index = mockStore.classes.findIndex((c) => c.id === classId);
  if (index < 0) throw new ApiError('Class not found', 404);

  const current = mockStore.classes[index];
  assertActorOwnsClass(actor, current);

  const updated: Class = {
    ...current,
    name: input.name?.trim() ?? current.name,
    section: input.section?.trim() ?? current.section,
    grade: input.grade?.trim() ?? current.grade,
    wing: input.wing ?? current.wing,
    subject: input.subject?.trim() ?? current.subject,
  };

  if (input.teacherId !== undefined && input.teacherId !== current.teacherId) {
    if (current.teacherId) {
      unassignTeacherFromClass(current.teacherId, classId);
    }
    updated.teacherId = input.teacherId;
    if (input.teacherId) {
      assignTeacherToClassInternal(actor, input.teacherId, classId);
    }
  }

  mockStore.classes[index] = updated;
  return mockRequest({ ...updated, studentIds: [...updated.studentIds] });
}

/** DELETE /admin/classes/:id */
export async function deleteClass(actor: User, classId: string): Promise<void> {
  assertPermission(actor, 'classes:write');
  branchScopedSchoolRoles(actor);

  const index = mockStore.classes.findIndex((c) => c.id === classId);
  if (index < 0) throw new ApiError('Class not found', 404);

  const cls = mockStore.classes[index];
  assertActorOwnsClass(actor, cls);

  if (cls.studentIds.length > 0) {
    throw new ApiError('Cannot delete class with enrolled students', 400);
  }

  if (cls.teacherId) {
    unassignTeacherFromClass(cls.teacherId, classId);
  }

  mockStore.classes.splice(index, 1);
  await mockRequest(undefined, 300);
}

/** GET /admin/teachers */
export async function listAllTeachers(actor: User): Promise<User[]> {
  assertPermission(actor, 'teachers:read');
  branchScopedSchoolRoles(actor);
  const bid = requireBranchId(actor);
  const teachers = mockStore.users.filter((u) => u.role === 'teacher' && u.branchId === bid);
  return mockRequest(teachers.map((t) => ({ ...t })));
}

/** POST /admin/teachers */
export async function createTeacher(actor: User, input: TeacherInput): Promise<User> {
  assertPermission(actor, 'teachers:write');
  branchScopedSchoolRoles(actor);
  const branchId = requireBranchId(actor);

  const email = input.email.trim().toLowerCase();
  if (mockStore.users.some((u) => u.email.toLowerCase() === email)) {
    throw new ApiError('Email already registered', 409);
  }

  const id = nextUserId('teacher');
  const teacher: User = {
    id,
    email,
    name: input.name.trim(),
    role: 'teacher',
    branchId,
    wing: input.wing,
    subjects: input.subjects,
    classIds: [],
  };

  mockStore.users.push(teacher);

  for (const classId of input.classIds ?? []) {
    assignTeacherToClassInternal(actor, id, classId);
  }

  const refreshed = mockStore.users.find((u) => u.id === id)!;
  return mockRequest({ ...refreshed });
}

/** PATCH /admin/teachers/:id/assign */
export async function assignTeacherToClass(
  actor: User,
  teacherId: string,
  classId: string,
): Promise<User> {
  assertPermission(actor, 'teachers:write');
  branchScopedSchoolRoles(actor);
  assignTeacherToClassInternal(actor, teacherId, classId);
  const teacher = mockStore.users.find((u) => u.id === teacherId);
  if (!teacher) throw new ApiError('Teacher not found', 404);
  return mockRequest({ ...teacher });
}

function assignTeacherToClassInternal(actor: User, teacherId: string, classId: string): void {
  const teacher = mockStore.users.find((u) => u.id === teacherId && u.role === 'teacher');
  const clsIndex = mockStore.classes.findIndex((c) => c.id === classId);
  if (!teacher) throw new ApiError('Teacher not found', 404);
  if (clsIndex < 0) throw new ApiError('Class not found', 404);

  const cls = mockStore.classes[clsIndex];
  assertActorOwnsClass(actor, cls);

  if (teacher.branchId !== cls.branchId) {
    throw new ApiError('Teacher belongs to a different branch', 403);
  }

  mockStore.classes[clsIndex].teacherId = teacherId;
  if (!teacher.classIds?.includes(classId)) {
    teacher.classIds = [...(teacher.classIds ?? []), classId];
  }
  if (teacher.wing && cls.wing !== teacher.wing) {
    teacher.wing = cls.wing;
  }
}

function unassignTeacherFromClass(teacherId: string, classId: string): void {
  const teacher = mockStore.users.find((u) => u.id === teacherId);
  if (teacher?.classIds) {
    teacher.classIds = teacher.classIds.filter((id) => id !== classId);
  }
}
