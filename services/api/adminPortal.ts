import {
  MOCK_ACCESS_LOGS,
  MOCK_AUDIT_LOGS,
  MOCK_BRANCH_CARDS,
  MOCK_BROADCASTS,
  MOCK_DIRECTORY_USERS,
  MOCK_FEE_STUDENT,
  MOCK_INBOX_NOTIFICATIONS,
  MOCK_ROLE_CONFIGS,
  MOCK_SECURITY_POSTURE,
  MOCK_SECURITY_SESSIONS,
} from '@/data/mock/admin';
import type { User } from '@/types';
import type {
  AdminAuditLogEntry,
  AdminBranchCard,
  AdminBroadcast,
  AdminComposeDraft,
  AdminDirectoryUser,
  AdminFeeStudentSummary,
  AdminInboxNotification,
  AdminRoleConfig,
  AdminSecurityPosture,
  AdminSecuritySession,
  AdminAccessLog,
} from '@/types/admin';

function delay(ms = 280): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getSecurityPosture(_actor: User): Promise<AdminSecurityPosture> {
  await delay();
  return { ...MOCK_SECURITY_POSTURE };
}

export async function listSecuritySessions(_actor: User): Promise<AdminSecuritySession[]> {
  await delay();
  return [...MOCK_SECURITY_SESSIONS];
}

export async function listAccessLogs(_actor: User): Promise<AdminAccessLog[]> {
  await delay();
  return [...MOCK_ACCESS_LOGS];
}

export async function listAuditLogs(_actor: User): Promise<AdminAuditLogEntry[]> {
  await delay();
  return [...MOCK_AUDIT_LOGS];
}

export async function listBroadcasts(_actor: User): Promise<AdminBroadcast[]> {
  await delay();
  return [...MOCK_BROADCASTS];
}

export async function listAdminInbox(_actor: User): Promise<AdminInboxNotification[]> {
  await delay();
  return [...MOCK_INBOX_NOTIFICATIONS];
}

export async function listDirectoryUsers(_actor: User): Promise<AdminDirectoryUser[]> {
  await delay();
  return [...MOCK_DIRECTORY_USERS];
}

export async function listRoleConfigs(_actor: User): Promise<AdminRoleConfig[]> {
  await delay();
  return [...MOCK_ROLE_CONFIGS];
}

export async function listBranchCards(_actor: User): Promise<AdminBranchCard[]> {
  await delay();
  return [...MOCK_BRANCH_CARDS];
}

export async function lookupStudentFees(
  _actor: User,
  studentId: string,
): Promise<AdminFeeStudentSummary | null> {
  await delay();
  if (!studentId.trim()) return null;
  return { ...MOCK_FEE_STUDENT, studentId: studentId.trim() || MOCK_FEE_STUDENT.studentId };
}

export async function sendBroadcast(_actor: User, _draft: AdminComposeDraft): Promise<void> {
  await delay(400);
}

export async function revokeSecuritySession(_actor: User, sessionId: string): Promise<void> {
  await delay();
  void sessionId;
}

export async function terminateAllSessions(_actor: User): Promise<void> {
  await delay(400);
}
