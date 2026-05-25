import type { Class, User, UserRole, Wing } from '@/types';
import { ApiError } from './client';

export type Permission =
  | 'classes:read'
  | 'classes:write'
  | 'teachers:read'
  | 'teachers:write'
  | 'students:read'
  | 'students:write'
  | 'analytics:read'
  | 'monitoring:read'
  | 'attendance:write'
  | 'fees:read'
  | 'branches:read'
  | 'branches:write'
  | 'branch_admins:write'
  | 'network:read'
  | 'branch_settings:write';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  main_admin: [
    'branches:read',
    'branches:write',
    'branch_admins:write',
    'network:read',
  ],
  branch_admin: [
    'classes:read',
    'classes:write',
    'teachers:read',
    'teachers:write',
    'students:read',
    'analytics:read',
    'monitoring:read',
    'fees:read',
    'branch_settings:write',
  ],
  principal: [
    'classes:read',
    'classes:write',
    'teachers:read',
    'teachers:write',
    'students:read',
    'analytics:read',
    'monitoring:read',
    'fees:read',
  ],
  coordinator: [
    'classes:read',
    'teachers:read',
    'students:read',
    'students:write',
    'monitoring:read',
    'fees:read',
  ],
  teacher: ['classes:read', 'attendance:write', 'fees:read'],
  parent: ['fees:read'],
  student: [],
};

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function assertAuthenticated(actor: User | null): asserts actor is User {
  if (!actor) throw new ApiError('Authentication required', 401);
}

export function assertRole(actor: User, ...roles: UserRole[]): void {
  if (!roles.includes(actor.role)) {
    throw new ApiError('Forbidden: insufficient role', 403);
  }
}

export function assertPermission(actor: User, permission: Permission): void {
  if (!getPermissions(actor.role).includes(permission)) {
    throw new ApiError(`Forbidden: missing permission ${permission}`, 403);
  }
}

/** Branch scope required for all roles except main_admin */
export function requireBranchId(actor: User): string {
  if (actor.role === 'main_admin') {
    throw new ApiError('Branch context required for this operation', 400);
  }
  if (!actor.branchId) {
    throw new ApiError('User has no branch assignment', 403);
  }
  return actor.branchId;
}

/**
 * Ensures `branchId` belongs to the actor's tenant.
 * Main Admin may access any branch when `allowMainAdminCrossBranch` is true.
 */
export function assertBranchAccess(
  actor: User,
  branchId: string,
  allowMainAdminCrossBranch = false,
): void {
  if (actor.role === 'main_admin' && allowMainAdminCrossBranch) return;
  const scope = actor.branchId;
  if (!scope || scope !== branchId) {
    throw new ApiError('Forbidden: outside your branch', 403);
  }
}

export function assertActorOwnsClass(actor: User, cls: Class): void {
  assertBranchAccess(actor, cls.branchId);
}

/** Coordinators may only access resources in their assigned wing (within branch) */
export function assertWingAccess(actor: User, resourceWing: Wing): void {
  if (actor.role === 'principal' || actor.role === 'branch_admin') return;
  if (actor.role === 'main_admin') return;
  if (actor.role === 'coordinator' && actor.wing === resourceWing) return;
  throw new ApiError('Forbidden: outside your wing', 403);
}

export function getCoordinatorWing(actor: User): Wing {
  assertRole(actor, 'coordinator');
  if (!actor.wing) throw new ApiError('Coordinator has no wing assigned', 500);
  return actor.wing;
}
