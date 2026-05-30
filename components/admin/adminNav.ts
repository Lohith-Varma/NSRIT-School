import type { UserRole } from '@/types';

export type AdminNavItem = {
  href: string;
  label: string;
  icon:
    | 'dashboard'
    | 'bell'
    | 'line-chart'
    | 'history'
    | 'credit-card'
    | 'shield'
    | 'users'
    | 'building'
    | 'book'
    | 'user'
    | 'home'
    | 'graduation-cap'
    | 'calendar-check-o'
    | 'bank'
    | 'lock'
    | 'group';
  segment: string;
  roles: UserRole[];
};

export const MAIN_ADMIN_NAV: AdminNavItem[] = [
  { href: '/(main-admin)', label: 'Audit Dashboard', icon: 'dashboard', segment: 'index', roles: ['main_admin'] },
  { href: '/(main-admin)/notifications', label: 'Notification Center', icon: 'bell', segment: 'notifications', roles: ['main_admin'] },
  { href: '/(main-admin)/insights', label: 'Global Analytics', icon: 'line-chart', segment: 'insights', roles: ['main_admin'] },
  { href: '/(main-admin)/audit-logs', label: 'Audit Logs', icon: 'history', segment: 'audit-logs', roles: ['main_admin'] },
  { href: '/(main-admin)/fees', label: 'Fee Tracking', icon: 'credit-card', segment: 'fees', roles: ['main_admin'] },
  { href: '/(main-admin)/branches', label: 'Branch Management', icon: 'building', segment: 'branches', roles: ['main_admin'] },
  { href: '/(main-admin)/users', label: 'User & Roles', icon: 'users', segment: 'users', roles: ['main_admin'] },
  { href: '/(main-admin)/security', label: 'Security Center', icon: 'shield', segment: 'security', roles: ['main_admin'] },
  { href: '/(main-admin)/profile', label: 'Profile', icon: 'user', segment: 'profile', roles: ['main_admin'] },
];

export const BRANCH_ADMIN_NAV: AdminNavItem[] = [
  { href: '/(branch-admin)', label: 'Dashboard', icon: 'home', segment: 'index', roles: ['branch_admin'] },
  { href: '/(branch-admin)/staff', label: 'Staff Management', icon: 'group', segment: 'staff', roles: ['branch_admin'] },
  { href: '/(branch-admin)/students', label: 'Student Registry', icon: 'graduation-cap', segment: 'students', roles: ['branch_admin'] },
  { href: '/(branch-admin)/classes', label: 'Courses', icon: 'book', segment: 'classes', roles: ['branch_admin'] },
  { href: '/(branch-admin)/teachers', label: 'Teachers', icon: 'users', segment: 'teachers', roles: ['branch_admin'] },
  { href: '/(branch-admin)/attendance-correction', label: 'Attendance Correction', icon: 'calendar-check-o', segment: 'attendance-correction', roles: ['branch_admin'] },
  { href: '/(branch-admin)/financial-monitoring', label: 'Finance', icon: 'bank', segment: 'financial-monitoring', roles: ['branch_admin'] },
  { href: '/(branch-admin)/fees', label: 'Fee Tracking', icon: 'credit-card', segment: 'fees', roles: ['branch_admin'] },
  { href: '/(branch-admin)/analytics', label: 'Analytics', icon: 'line-chart', segment: 'analytics', roles: ['branch_admin'] },
  { href: '/(branch-admin)/notifications', label: 'Notifications', icon: 'bell', segment: 'notifications', roles: ['branch_admin'] },
  { href: '/(branch-admin)/reset-password', label: 'Reset Password', icon: 'lock', segment: 'reset-password', roles: ['branch_admin'] },
  { href: '/(branch-admin)/profile', label: 'Profile', icon: 'user', segment: 'profile', roles: ['branch_admin'] },
  { href: '/(branch-admin)/branch', label: 'Branch Settings', icon: 'building', segment: 'branch', roles: ['branch_admin'] },
];

export function navForRole(role: UserRole): AdminNavItem[] {
  if (role === 'main_admin') return MAIN_ADMIN_NAV;
  if (role === 'branch_admin') return BRANCH_ADMIN_NAV;
  return [];
}
