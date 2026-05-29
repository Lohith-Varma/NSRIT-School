import { login as apiLogin, type LoginCredentials } from '@/services/api';
import type { ParentChildSummary, User } from '@/types';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  /** Linked children when logged in as parent */
  children: ParentChildSummary[];
  activeStudentId: string | null;
  activeChild: ParentChildSummary | null;
  setActiveStudentId: (studentId: string) => void;
  /** Main Admin: optional branch filter for insights / drill-down */
  selectedBranchFocusId: string | null;
  setSelectedBranchFocusId: (branchId: string | null) => void;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children: reactChildren }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [linkedChildren, setLinkedChildren] = useState<ParentChildSummary[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBranchFocusId, setSelectedBranchFocusId] = useState<string | null>(null);

  const activeChild = useMemo(
    () => linkedChildren.find((c) => c.id === activeStudentId) ?? null,
    [linkedChildren, activeStudentId],
  );

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const session = await apiLogin(credentials);
      setUser(session.user);
      setSelectedBranchFocusId(null);

      if (session.user.role === 'parent' && session.children?.length) {
        setLinkedChildren(session.children);
        setActiveStudentId(session.children[0].id);
      } else {
        setLinkedChildren([]);
        setActiveStudentId(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setLinkedChildren([]);
    setActiveStudentId(null);
    setSelectedBranchFocusId(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      children: linkedChildren,
      activeStudentId,
      activeChild,
      setActiveStudentId,
      selectedBranchFocusId,
      setSelectedBranchFocusId,
      signIn,
      signOut,
      updateUser,
    }),
    [
      user,
      isLoading,
      linkedChildren,
      activeStudentId,
      activeChild,
      selectedBranchFocusId,
      signIn,
      signOut,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{reactChildren}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
