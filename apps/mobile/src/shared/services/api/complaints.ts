import { mockStore, nextComplaintId, nextNotificationId } from '@/data/mock/store';
import type { Complaint, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertRole, assertBranchAccess, requireBranchId } from './rbac';
import { assertParentChildAccess } from './parent';

/** POST /complaints */
export async function submitComplaint(
  actor: User,
  studentId: string,
  title: string,
  description: string,
): Promise<Complaint> {
  assertRole(actor, 'parent');
  assertParentChildAccess(actor, studentId);
  const branchId = requireBranchId(actor);

  const student = mockStore.users.find((u) => u.id === studentId);
  if (!student) throw new ApiError('Student not found', 404);

  const date = new Date().toISOString().split('T')[0];
  const newComplaint: Complaint = {
    id: nextComplaintId(),
    parentId: actor.id,
    parentName: actor.name,
    studentId,
    studentName: student.name,
    title: title.trim(),
    description: description.trim(),
    branchId,
    status: 'Submitted',
    createdAt: date,
    updatedAt: date,
  };

  mockStore.complaints.push(newComplaint);

  // Notify coordinators
  const coordinators = mockStore.users.filter(
    (u) => u.role === 'coordinator' && u.branchId === branchId && u.wing === student.wing
  );
  coordinators.forEach((c) => {
    mockStore.notifications.push({
      id: nextNotificationId(),
      userId: c.id,
      branchId,
      title: 'New Complaint Submitted',
      message: `A new complaint has been submitted for ${student.name} in your wing.`,
      createdAt: date,
      read: false,
    });
  });

  return mockRequest(newComplaint);
}

/** GET /complaints */
export async function listComplaints(actor: User): Promise<Complaint[]> {
  const branchId = requireBranchId(actor);

  if (actor.role === 'parent') {
    const list = mockStore.complaints.filter((c) => c.parentId === actor.id && c.branchId === branchId);
    return mockRequest(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  if (actor.role === 'coordinator') {
    // Coordinators can only see complaints from their wing
    const list = mockStore.complaints.filter((c) => {
      const student = mockStore.users.find((u) => u.id === c.studentId);
      return c.branchId === branchId && student?.wing === actor.wing;
    });
    return mockRequest(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  if (actor.role === 'principal' || actor.role === 'branch_admin') {
    // Principal and Branch Admin can see all complaints of their branch
    const list = mockStore.complaints.filter((c) => c.branchId === branchId);
    return mockRequest(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  throw new ApiError('Forbidden: unauthorized to view complaints', 403);
}

/** PATCH /complaints/:id */
export async function updateComplaintStatus(
  actor: User,
  complaintId: string,
  status: Complaint['status'],
  comments?: string,
): Promise<Complaint> {
  const branchId = requireBranchId(actor);
  const index = mockStore.complaints.findIndex((c) => c.id === complaintId);
  if (index < 0) throw new ApiError('Complaint not found', 404);

  const complaint = mockStore.complaints[index];
  assertBranchAccess(actor, complaint.branchId);

  const date = new Date().toISOString().split('T')[0];
  const updated: Complaint = {
    ...complaint,
    status,
    updatedAt: date,
  };

  if (actor.role === 'coordinator') {
    updated.coordinatorComments = comments;
    if (status === 'Forwarded to Principal') {
      // Notify Principal
      const principals = mockStore.users.filter((u) => u.role === 'principal' && u.branchId === branchId);
      principals.forEach((p) => {
        mockStore.notifications.push({
          id: nextNotificationId(),
          userId: p.id,
          branchId,
          title: 'Complaint Forwarded',
          message: `Complaint "${complaint.title}" has been forwarded to you for action.`,
          createdAt: date,
          read: false,
        });
      });
    }
  } else if (actor.role === 'principal' || actor.role === 'branch_admin') {
    updated.principalComments = comments;
    updated.resolutionComments = comments;
  } else {
    throw new ApiError('Forbidden: insufficient permissions to update complaints', 403);
  }

  mockStore.complaints[index] = updated;

  // Notify parent
  mockStore.notifications.push({
    id: nextNotificationId(),
    userId: complaint.parentId,
    branchId,
    title: 'Complaint Status Update',
    message: `Your complaint "${complaint.title}" status has changed to "${status}".`,
    createdAt: date,
    read: false,
  });

  return mockRequest(updated);
}
