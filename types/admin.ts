export type AdminNotificationCategory =
  | 'urgent'
  | 'academic'
  | 'event'
  | 'general'
  | 'system'
  | 'administrative';

export type AdminNotificationDelivery = 'push' | 'email' | 'sms';

export interface AdminBroadcast {
  id: string;
  title: string;
  summary: string;
  category: string;
  sentAt: string;
  deliveryRate: number;
  sent: number;
  delivered: number;
  read: number;
}

export interface AdminInboxNotification {
  id: string;
  type: 'system' | 'academic' | 'administrative' | 'security' | 'fees';
  title: string;
  body: string;
  timeAgo: string;
  priority: 'critical' | 'normal' | 'low';
}

export interface AdminAuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  module: 'Finance' | 'Academics' | 'System';
  action: string;
  target: string;
  detailBefore?: string;
  detailAfter?: string;
  reason?: string;
  ipAddress?: string;
}

export interface AdminSecuritySession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastSeen: string;
  isCurrent?: boolean;
}

export interface AdminAccessLog {
  id: string;
  type: 'login' | 'failed' | 'permission';
  label: string;
  detail: string;
  time: string;
}

export interface AdminSecurityPosture {
  activeSessions: number;
  authDevices: number;
  failedLogins24h: number;
  threatLevel: 'Low' | 'Medium' | 'High';
  adminsWithout2fa: number;
}

export interface AdminDirectoryUser {
  id: string;
  name: string;
  email: string;
  role: 'Main Admin' | 'Branch Admin' | 'Principal' | 'Teacher' | 'Admin';
  department: string;
  status: 'active' | 'pending';
  avatarUrl?: string;
}

export interface AdminRoleConfig {
  id: string;
  name: string;
  description: string;
  tags: string[];
  selected?: boolean;
}

export interface AdminBranchCard {
  id: string;
  name: string;
  location: string;
  students: number;
  revenue: number;
  status: 'active' | 'review';
}

export interface AdminFeeStudentSummary {
  studentId: string;
  name: string;
  grade: string;
  rollNo: string;
  status: 'active' | 'inactive';
  totalFee: number;
  paid: number;
  due: number;
  breakdown: AdminFeeLineItem[];
}

export interface AdminFeeLineItem {
  id: string;
  label: string;
  amount: number;
  dueDate?: string;
  status: 'paid' | 'pending';
  icon: 'tuition' | 'transport' | 'admission' | 'other';
}

export interface AdminComposeDraft {
  title: string;
  category: AdminNotificationCategory;
  audience: string[];
  body: string;
  delivery: AdminNotificationDelivery[];
  schedule: 'now' | 'later';
  scheduledAt?: string;
}

export interface StaffCreateRole {
  id: 'principal' | 'admin' | 'teacher';
  label: string;
  description: string;
}
