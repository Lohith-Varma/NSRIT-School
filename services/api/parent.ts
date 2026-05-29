import { mockStore } from '@/data/mock/store';
import type { EmergencyContact, ParentChildSummary, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertRole } from './rbac';

/** Build child summaries for a parent from linked student records */
export function getChildrenForParent(parentId: string): ParentChildSummary[] {
  const students = mockStore.users.filter(
    (u) => u.role === 'student' && u.parentId === parentId,
  );

  return students.map((s) => {
    const cls = mockStore.classes.find((c) => c.id === s.classId);
    return {
      id: s.id,
      name: s.name,
      grade: cls?.grade ?? '—',
      wing: s.wing!,
      branchId: s.branchId!,
      className: cls?.name,
      section: cls?.section,
    };
  });
}

/** GET /parents/:id/children */
export async function listParentChildren(actor: User): Promise<ParentChildSummary[]> {
  assertRole(actor, 'parent');
  return mockRequest(getChildrenForParent(actor.id));
}

/** Ensures the student is linked to this parent */
export function assertParentChildAccess(parent: User, studentId: string): void {
  assertRole(parent, 'parent');
  const children = getChildrenForParent(parent.id);
  if (!children.some((c) => c.id === studentId)) {
    throw new ApiError('Forbidden: not your child', 403);
  }
}

/** POST /parents/profile */
export async function updateParentProfile(
  actor: User,
  phone: string,
  address: string,
  emergencyContacts: EmergencyContact[],
): Promise<User> {
  assertRole(actor, 'parent');
  
  const parentIndex = mockStore.users.findIndex((u) => u.id === actor.id && u.role === 'parent');
  if (parentIndex < 0) {
    throw new ApiError('Parent not found', 404);
  }
  
  const parent = mockStore.users[parentIndex];
  parent.phone = phone.trim();
  parent.address = address.trim();
  parent.emergencyContacts = emergencyContacts;
  
  mockStore.users[parentIndex] = parent;
  
  return mockRequest({ ...parent });
}

