import { mockStore, nextAuditLogId } from '@/data/mock/store';
import type { AuditLog, User } from '@/types';
import { mockRequest } from './client';
import { assertRole, requireBranchId } from './rbac';

/** POST /audit-logs */
export async function logAction(actor: User, action: string, details: string): Promise<AuditLog> {
  const branchId = requireBranchId(actor);
  const newLog: AuditLog = {
    id: nextAuditLogId(),
    branchId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    details,
    timestamp: new Date().toISOString(),
  };

  mockStore.auditLogs.push(newLog);
  return mockRequest(newLog);
}

/** GET /audit-logs */
export async function listAuditLogs(actor: User): Promise<AuditLog[]> {
  assertRole(actor, 'branch_admin', 'coordinator', 'principal');
  const branchId = requireBranchId(actor);
  const logs = mockStore.auditLogs.filter((l) => l.branchId === branchId);
  return mockRequest(logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
}
