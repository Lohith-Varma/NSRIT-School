import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api';

/** Active child profile for parent-scoped API calls and UI */
export function useActiveStudent() {
  const { user, activeStudentId, activeChild, children } = useAuth();

  if (!user || user.role !== 'parent') {
    throw new ApiError('Parent session required', 401);
  }
  if (!activeStudentId || !activeChild) {
    throw new ApiError('No child profile selected', 400);
  }

  return {
    parent: user,
    studentId: activeStudentId,
    child: activeChild,
    siblings: children,
  };
}
