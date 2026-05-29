import { mockStore } from '@/data/mock/store';
import type { Branch, BranchSettings, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertBranchAccess, assertPermission, assertRole, requireBranchId } from './rbac';

/** PATCH /branch/settings — Branch Admin only, own branch */
export async function updateBranchSettings(
  actor: User,
  patch: Partial<BranchSettings>,
): Promise<Branch> {
  assertPermission(actor, 'branch_settings:write');
  assertRole(actor, 'branch_admin', 'principal');
  const branchId = requireBranchId(actor);

  const idx = mockStore.branches.findIndex((b) => b.id === branchId);
  if (idx < 0) throw new ApiError('Branch not found', 404);

  assertBranchAccess(actor, branchId);

  const current = mockStore.branches[idx];
  const next: Branch = {
    ...current,
    settings: {
      ...current.settings,
      ...patch,
    },
  };
  mockStore.branches[idx] = next;
  return mockRequest({ ...next, settings: { ...next.settings } });
}

/** GET /branch/me — Branch metadata for admins */
export async function getBranchForActor(actor: User): Promise<Branch> {
  assertRole(actor, 'branch_admin', 'principal', 'coordinator');
  const branchId = requireBranchId(actor);
  const b = mockStore.branches.find((x) => x.id === branchId);
  if (!b) throw new ApiError('Branch not found', 404);
  return mockRequest({ ...b, settings: { ...b.settings } });
}
