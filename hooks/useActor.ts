import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';
import { ApiError } from '@/services/api';

/** Returns the signed-in user for RBAC-protected API calls */
export function useActor(): User {
  const { user } = useAuth();
  if (!user) {
    throw new ApiError('Not authenticated', 401);
  }
  return user;
}
