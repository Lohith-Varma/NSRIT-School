import { mockStore, nextFeedbackId } from '@/data/mock/store';
import type { Feedback, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertRole, requireBranchId } from './rbac';
import { assertParentChildAccess } from './parent';

/** POST /feedback */
export async function submitFeedback(
  actor: User,
  studentId: string,
  rating: number,
  comments: string,
): Promise<Feedback> {
  assertRole(actor, 'parent');
  assertParentChildAccess(actor, studentId);
  const branchId = requireBranchId(actor);

  if (rating < 1 || rating > 5) {
    throw new ApiError('Rating must be between 1 and 5', 400);
  }

  const student = mockStore.users.find((u) => u.id === studentId);
  if (!student) throw new ApiError('Student not found', 404);

  const date = new Date().toISOString().split('T')[0];
  const newFeedback: Feedback = {
    id: nextFeedbackId(),
    parentId: actor.id,
    parentName: actor.name,
    studentId,
    studentName: student.name,
    rating,
    comments: comments.trim(),
    branchId,
    createdAt: date,
  };

  mockStore.feedback.push(newFeedback);
  return mockRequest(newFeedback);
}

/** GET /feedback */
export async function listFeedback(actor: User): Promise<Feedback[]> {
  const branchId = requireBranchId(actor);

  if (actor.role === 'parent') {
    const list = mockStore.feedback.filter((f) => f.parentId === actor.id && f.branchId === branchId);
    return mockRequest(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  if (actor.role === 'principal' || actor.role === 'branch_admin' || actor.role === 'coordinator') {
    const list = mockStore.feedback.filter((f) => f.branchId === branchId);
    return mockRequest(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  throw new ApiError('Forbidden', 403);
}
