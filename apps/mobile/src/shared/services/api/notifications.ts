import { mockStore } from '@/data/mock/store';
import type { AppNotification, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { requireBranchId } from './rbac';

/** GET /notifications */
export async function listNotifications(actor: User): Promise<AppNotification[]> {
  const branchId = requireBranchId(actor);
  const list = mockStore.notifications.filter(
    (n) => n.userId === actor.id && n.branchId === branchId
  );
  return mockRequest(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

/** PATCH /notifications/:id/read */
export async function markNotificationAsRead(actor: User, notificationId: string): Promise<void> {
  const index = mockStore.notifications.findIndex((n) => n.id === notificationId && n.userId === actor.id);
  if (index >= 0) {
    mockStore.notifications[index].read = true;
  }
  return mockRequest(undefined);
}
