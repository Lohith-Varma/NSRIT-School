import { mockStore, nextBranchId, nextUserId } from '@/data/mock/store';
import type {
  Branch,
  BranchAdminProvisionInput,
  BranchCreateInput,
  NetworkInsights,
  User,
} from '@/types';
import { ApiError, mockRequest } from './client';
import { assertPermission, assertRole } from './rbac';

/** GET /network/branches */
export async function listBranches(actor: User): Promise<Branch[]> {
  assertPermission(actor, 'branches:read');
  assertRole(actor, 'main_admin');
  return mockRequest(mockStore.branches.map((b) => ({ ...b, settings: { ...b.settings } })));
}

/** POST /network/branches */
export async function createBranch(actor: User, input: BranchCreateInput): Promise<Branch> {
  assertPermission(actor, 'branches:write');
  assertRole(actor, 'main_admin');

  const code = input.code.trim().toUpperCase();
  if (mockStore.branches.some((b) => b.code.toUpperCase() === code)) {
    throw new ApiError('Branch code already exists', 409);
  }

  const branch: Branch = {
    id: nextBranchId(),
    name: input.name.trim(),
    code,
    address: input.address?.trim(),
    active: true,
    settings: {
      academicYear: '',
      currentTermLabel: '',
    },
  };
  mockStore.branches.push(branch);
  return mockRequest({ ...branch, settings: { ...branch.settings } });
}

/** PATCH /network/branches/:id */
export async function updateBranch(
  actor: User,
  branchId: string,
  patch: Partial<Pick<Branch, 'name' | 'code' | 'address' | 'active'>> & {
    settings?: Branch['settings'];
  },
): Promise<Branch> {
  assertPermission(actor, 'branches:write');
  assertRole(actor, 'main_admin');

  const idx = mockStore.branches.findIndex((b) => b.id === branchId);
  if (idx < 0) throw new ApiError('Branch not found', 404);

  const current = mockStore.branches[idx];
  const next: Branch = {
    ...current,
    name: patch.name?.trim() ?? current.name,
    code: patch.code?.trim().toUpperCase() ?? current.code,
    address: patch.address !== undefined ? patch.address?.trim() : current.address,
    active: patch.active !== undefined ? patch.active : current.active,
    settings: patch.settings ? { ...current.settings, ...patch.settings } : current.settings,
  };
  mockStore.branches[idx] = next;
  return mockRequest({ ...next, settings: { ...next.settings } });
}

/** DELETE /network/branches/:id */
export async function deleteBranch(actor: User, branchId: string): Promise<void> {
  assertPermission(actor, 'branches:write');
  assertRole(actor, 'main_admin');

  const hasClasses = mockStore.classes.some((c) => c.branchId === branchId);
  const hasUsers = mockStore.users.some((u) => u.branchId === branchId);
  if (hasClasses || hasUsers) {
    throw new ApiError('Cannot delete branch with existing classes or users', 400);
  }

  const idx = mockStore.branches.findIndex((b) => b.id === branchId);
  if (idx < 0) throw new ApiError('Branch not found', 404);
  mockStore.branches.splice(idx, 1);
  await mockRequest(undefined, 300);
}

/** POST /network/branches/:branchId/admins */
export async function provisionBranchAdmin(
  actor: User,
  input: BranchAdminProvisionInput,
): Promise<User> {
  assertPermission(actor, 'branch_admins:write');
  assertRole(actor, 'main_admin');

  const branch = mockStore.branches.find((b) => b.id === input.branchId);
  if (!branch) throw new ApiError('Branch not found', 404);

  const email = input.email.trim().toLowerCase();
  if (mockStore.users.some((u) => u.email.toLowerCase() === email)) {
    throw new ApiError('Email already registered', 409);
  }

  const admin: User = {
    id: nextUserId('branch-admin'),
    email,
    name: input.name.trim(),
    role: 'branch_admin',
    branchId: input.branchId,
  };
  mockStore.users.push(admin);
  return mockRequest({ ...admin });
}

/** GET /network/insights */
export async function getNetworkInsights(actor: User): Promise<NetworkInsights> {
  assertPermission(actor, 'network:read');
  assertRole(actor, 'main_admin');

  function branchStudentIds(bid: string): string[] {
    return mockStore.users.filter((u) => u.role === 'student' && u.branchId === bid).map((u) => u.id);
  }

  function attendanceRate(studentIds: string[]): number {
    if (studentIds.length === 0) return 0;
    const records = mockStore.attendance.filter((r) => studentIds.includes(r.studentId));
    if (records.length === 0) return 0;
    const present = records.filter((r) => r.status === 'present').length;
    return Math.round((present / records.length) * 100);
  }

  function feeTotals(studentIds: string[]) {
    const fees = mockStore.fees.filter((f) => studentIds.includes(f.studentId));
    return {
      collected: fees.reduce((s, f) => s + f.paidAmount, 0),
      outstanding: fees.reduce((s, f) => s + f.dueAmount, 0),
    };
  }

  const byBranch = mockStore.branches.map((b) => {
    const students = branchStudentIds(b.id);
    const teachers = mockStore.users.filter((u) => u.role === 'teacher' && u.branchId === b.id);
    const classes = mockStore.classes.filter((c) => c.branchId === b.id);
    const ft = feeTotals(students);

    return {
      branchId: b.id,
      branchName: b.name,
      active: b.active,
      studentCount: students.length,
      teacherCount: teachers.length,
      classCount: classes.length,
      attendanceRate: attendanceRate(students),
      feesCollected: ft.collected,
      feesOutstanding: ft.outstanding,
    };
  });

  const allStudentIds = mockStore.users.filter((u) => u.role === 'student').map((u) => u.id);
  const allFees = mockStore.fees;

  const insight: NetworkInsights = {
    totalBranches: mockStore.branches.length,
    activeBranches: mockStore.branches.filter((b) => b.active).length,
    totalStudents: mockStore.users.filter((u) => u.role === 'student').length,
    totalTeachers: mockStore.users.filter((u) => u.role === 'teacher').length,
    totalClasses: mockStore.classes.length,
    overallAttendanceRate: attendanceRate(allStudentIds),
    totalFeesCollected: allFees.reduce((s, f) => s + f.paidAmount, 0),
    totalFeesOutstanding: allFees.reduce((s, f) => s + f.dueAmount, 0),
    byBranch,
  };

  return mockRequest(insight);
}
