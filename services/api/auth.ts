import { mockStore } from '@/data/mock/store';
import { DEMO_ACCOUNTS_CONFIG } from '@/data/mock/users';
import type { AuthSession } from '@/types';
import { ApiError, mockRequest } from './client';
import { getChildrenForParent } from './parent';

export interface LoginCredentials {
  email: string;
  password?: string;
}

/**
 * POST /auth/login
 * Mock auth — any password works; email must match a mock user.
 * Parents receive a `children` array for sibling profile switching.
 */
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const email = credentials.email.trim().toLowerCase();
  const user = mockStore.users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }

  const session: AuthSession = { user: { ...user } };

  if (user.role === 'parent') {
    const children = getChildrenForParent(user.id);
    if (children.length === 0) {
      throw new ApiError('No linked students found for this parent account', 403);
    }
    session.children = children;
  }

  return mockRequest(session);
}

/** GET /auth/me */
export async function getUserById(userId: string): Promise<AuthSession | null> {
  const user = mockStore.users.find((u) => u.id === userId) ?? null;
  if (!user) return mockRequest(null);

  const session: AuthSession = { user: { ...user } };
  if (user.role === 'parent') {
    session.children = getChildrenForParent(user.id);
  }
  return mockRequest(session);
}

export const DEMO_ACCOUNTS = {
  mainAdmin: DEMO_ACCOUNTS_CONFIG.mainAdmin.email,
  branchAdmin: DEMO_ACCOUNTS_CONFIG.branchAdmin.email,
  principal: DEMO_ACCOUNTS_CONFIG.principal.email,
  teacher: DEMO_ACCOUNTS_CONFIG.teacher.email,
  parent: DEMO_ACCOUNTS_CONFIG.parent.email,
  parentSingle: 'amit.shah@nsrit.edu',
  accountant: DEMO_ACCOUNTS_CONFIG.accountant.email,
  frontDesk: DEMO_ACCOUNTS_CONFIG.frontDesk.email,
} as const;
