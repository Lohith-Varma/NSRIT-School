import { mockAttendanceRecords } from './attendance';
import { mockBranches } from './branches';
import { mockClasses } from './classes';
import { mockFeeStatuses } from './fees';
import { mockUsers } from './users';

/**
 * In-memory store simulating Firebase Firestore.
 * Mutations persist for the app session (resets on reload).
 */
export const mockStore = {
  branches: [...mockBranches],
  users: [...mockUsers],
  classes: [...mockClasses],
  attendance: [...mockAttendanceRecords],
  fees: [...mockFeeStatuses],
};

let attendanceIdCounter = mockAttendanceRecords.length + 1;
let userIdCounter = mockUsers.length + 1;
let classIdCounter = mockClasses.length + 1;
let feeIdCounter = mockFeeStatuses.length + 1;
let branchIdCounter = mockBranches.length + 1;

export function nextAttendanceId(): string {
  return `att-${attendanceIdCounter++}`;
}

export function nextUserId(role: string): string {
  return `${role}-${userIdCounter++}`;
}

export function nextClassId(): string {
  return `class-${classIdCounter++}`;
}

export function nextFeeId(): string {
  return `fee-${feeIdCounter++}`;
}

export function nextBranchId(): string {
  return `branch-${branchIdCounter++}`;
}
