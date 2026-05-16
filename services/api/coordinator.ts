import { mockStore, nextFeeId, nextUserId } from '@/data/mock/store';
import type { Class, StudentInput, User, Wing } from '@/types';
import { ApiError, mockRequest } from './client';
import {
  assertActorOwnsClass,
  assertPermission,
  assertRole,
  assertWingAccess,
  getCoordinatorWing,
  requireBranchId,
} from './rbac';

function getWingForActor(actor: User): Wing {
  return actor.role === 'principal' || actor.role === 'branch_admin'
    ? 'secondary'
    : getCoordinatorWing(actor);
}

/** GET /coordinator/classes */
export async function getWingClasses(actor: User): Promise<Class[]> {
  assertPermission(actor, 'classes:read');
  assertRole(actor, 'coordinator', 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);
  const wing = getWingForActor(actor);
  if (actor.role === 'coordinator') assertWingAccess(actor, wing);

  const classes = mockStore.classes
    .filter((c) => c.branchId === branchId && c.wing === wing)
    .map((c) => ({ ...c, studentIds: [...c.studentIds] }));
  return mockRequest(classes);
}

/** GET /coordinator/teachers */
export async function getWingTeachers(actor: User): Promise<User[]> {
  assertPermission(actor, 'teachers:read');
  assertRole(actor, 'coordinator', 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);
  const wing = getWingForActor(actor);
  if (actor.role === 'coordinator') assertWingAccess(actor, wing);

  const teachers = mockStore.users.filter(
    (u) => u.role === 'teacher' && u.branchId === branchId && u.wing === wing,
  );
  return mockRequest(teachers.map((t) => ({ ...t })));
}

/** GET /coordinator/students */
export async function getWingStudents(actor: User): Promise<User[]> {
  assertPermission(actor, 'students:read');
  assertRole(actor, 'coordinator', 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);
  const wing = getWingForActor(actor);
  if (actor.role === 'coordinator') assertWingAccess(actor, wing);

  const students = mockStore.users.filter(
    (u) => u.role === 'student' && u.branchId === branchId && u.wing === wing,
  );
  return mockRequest(students.map((s) => ({ ...s })));
}

/** POST /coordinator/students */
export async function createStudent(actor: User, input: StudentInput): Promise<User> {
  assertPermission(actor, 'students:write');
  assertRole(actor, 'coordinator');

  const branchId = requireBranchId(actor);
  const wing = getCoordinatorWing(actor);
  const email = input.email.trim().toLowerCase();

  if (mockStore.users.some((u) => u.email.toLowerCase() === email)) {
    throw new ApiError('Email already registered', 409);
  }

  const clsIndex = mockStore.classes.findIndex((c) => c.id === input.classId);
  if (clsIndex < 0) throw new ApiError('Class not found', 404);

  const cls = mockStore.classes[clsIndex];
  assertActorOwnsClass(actor, cls);
  assertWingAccess(actor, cls.wing);

  const id = nextUserId('student');
  const student: User = {
    id,
    email,
    name: input.name.trim(),
    role: 'student',
    branchId,
    wing: cls.wing,
    classId: cls.id,
  };

  mockStore.users.push(student);
  cls.studentIds.push(id);

  const feeStructure =
    cls.wing === 'primary'
      ? [
          { label: 'Tuition', amount: 28000 },
          { label: 'Activity', amount: 3000 },
        ]
      : cls.wing === 'higher_secondary'
        ? [
            { label: 'Tuition', amount: 55000 },
            { label: 'Lab Fee', amount: 8000 },
            { label: 'Exam Fee', amount: 4000 },
          ]
        : [
            { label: 'Tuition', amount: 45000 },
            { label: 'Lab Fee', amount: 5000 },
            { label: 'Library', amount: 2000 },
          ];

  const totalAmount = feeStructure.reduce((s, i) => s + i.amount, 0);
  mockStore.fees.push({
    id: nextFeeId(),
    branchId,
    studentId: id,
    classId: cls.id,
    totalAmount,
    paidAmount: 0,
    dueAmount: totalAmount,
    status: 'pending',
    feeStructure,
  });

  return mockRequest({ ...student }, 500);
}

/** Classes available for student onboarding in coordinator's wing */
export async function getWingClassesForEnrollment(actor: User): Promise<Class[]> {
  return getWingClasses(actor);
}
