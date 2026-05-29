import type {
  AdminAccessLog,
  AdminAuditLogEntry,
  AdminBranchCard,
  AdminBroadcast,
  AdminDirectoryUser,
  AdminFeeStudentSummary,
  AdminInboxNotification,
  AdminRoleConfig,
  AdminSecurityPosture,
  AdminSecuritySession,
} from '@/types/admin';

export const MOCK_SECURITY_POSTURE: AdminSecurityPosture = {
  activeSessions: 12,
  authDevices: 5,
  failedLogins24h: 3,
  threatLevel: 'Low',
  adminsWithout2fa: 2,
};

export const MOCK_SECURITY_SESSIONS: AdminSecuritySession[] = [
  {
    id: 's1',
    device: 'MacBook Pro - Safari',
    location: 'Seattle, WA',
    ip: '192.168.1.45',
    lastSeen: 'Current Session',
    isCurrent: true,
  },
  {
    id: 's2',
    device: 'iPhone 13 - NSRIT App',
    location: 'Portland, OR',
    ip: '10.0.0.22',
    lastSeen: 'Last seen 2h ago',
  },
];

export const MOCK_ACCESS_LOGS: AdminAccessLog[] = [
  { id: 'a1', type: 'login', label: 'Successful Login', detail: 'Admin J.Doe • 10:42 AM • IP: 192.168.1.10', time: '10:42 AM' },
  { id: 'a2', type: 'failed', label: 'Failed Authentication', detail: 'Unknown User • 09:15 AM • IP: 45.33.12.99', time: '09:15 AM' },
  { id: 'a3', type: 'permission', label: 'Permission Escalation', detail: 'System • 08:00 AM • Role: Auditor updated', time: '08:00 AM' },
];

export const MOCK_AUDIT_LOGS: AdminAuditLogEntry[] = [
  {
    id: 'log1',
    timestamp: 'Oct 24, 2023 • 14:32',
    userName: 'J. Doe',
    userRole: 'Admin',
    module: 'Finance',
    action: 'Modified Tuition Fee',
    target: 'Std_1042 (A. Smith)',
    detailBefore: '$5,000.00',
    detailAfter: '$4,500.00',
    reason: 'Applied academic scholarship discount for fall semester.',
    ipAddress: '192.168.1.45',
  },
  {
    id: 'log2',
    timestamp: 'Oct 24, 2023 • 10:15',
    userName: 'M. Johnson',
    userRole: 'Faculty',
    module: 'Academics',
    action: 'Overrode Attendance',
    target: 'CS-101 (Section B)',
    detailBefore: 'Absent',
    detailAfter: 'Present',
  },
  {
    id: 'log3',
    timestamp: 'Oct 23, 2023 • 16:45',
    userName: 'System Admin',
    userRole: 'System',
    module: 'System',
    action: 'Modified User Role',
    target: 'E. Wong (Staff)',
    detailBefore: 'Standard User',
    detailAfter: 'Department Head',
  },
];

export const MOCK_BROADCASTS: AdminBroadcast[] = [
  {
    id: 'b1',
    title: 'End of Semester Schedule Update',
    summary: 'Please review the revised examination schedule for all undergraduate courses.',
    category: 'Academic',
    sentAt: 'Oct 24, 10:00 AM',
    deliveryRate: 92,
    sent: 4200,
    delivered: 3800,
    read: 2100,
  },
  {
    id: 'b2',
    title: 'Campus Maintenance Notification',
    summary: 'Network downtime expected in the West Wing library on Saturday from 2 AM to 5 AM.',
    category: 'IT Dept',
    sentAt: 'Oct 22, 09:15 AM',
    deliveryRate: 99,
    sent: 850,
    delivered: 845,
    read: 600,
  },
];

export const MOCK_INBOX_NOTIFICATIONS: AdminInboxNotification[] = [
  {
    id: 'n1',
    type: 'system',
    title: 'Critical System Maintenance',
    body: 'Servers will be down for emergency maintenance starting at 12:00 AM.',
    timeAgo: '2 mins ago',
    priority: 'critical',
  },
  {
    id: 'n2',
    type: 'academic',
    title: 'New Course Accreditation',
    body: 'The Data Science program has received international accreditation for 2024-2025.',
    timeAgo: '45 mins ago',
    priority: 'normal',
  },
  {
    id: 'n3',
    type: 'administrative',
    title: 'Budget Review Document',
    body: 'Q3 budget review documents are now available for faculty review.',
    timeAgo: '3 hours ago',
    priority: 'normal',
  },
];

export const MOCK_DIRECTORY_USERS: AdminDirectoryUser[] = [
  {
    id: 'u1',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@nsrit.edu',
    role: 'Main Admin',
    department: 'Administration',
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Marcus Rhodes',
    email: 'm.rhodes@nsrit.edu',
    role: 'Branch Admin',
    department: 'Engineering',
    status: 'active',
  },
];

export const MOCK_ROLE_CONFIGS: AdminRoleConfig[] = [
  {
    id: 'main',
    name: 'Main Admin',
    description: 'Full system access including billing, user management, and global settings.',
    tags: ['All Modules'],
    selected: true,
  },
  {
    id: 'branch',
    name: 'Branch Admin',
    description: 'Manage specific departments, local users, and branch-level reporting.',
    tags: ['Dept Mgmt', 'Local Reports'],
  },
];

export const MOCK_BRANCH_CARDS: AdminBranchCard[] = [
  { id: 'br1', name: 'North Campus', location: 'Seattle, WA', students: 1240, revenue: 2_400_000, status: 'active' },
  { id: 'br2', name: 'Downtown Hub', location: 'Portland, OR', students: 850, revenue: 1_800_000, status: 'active' },
  { id: 'br3', name: 'East Valley', location: 'Boise, ID', students: 420, revenue: 800_000, status: 'review' },
];

export const MOCK_FEE_STUDENT: AdminFeeStudentSummary = {
  studentId: 'STU-1024',
  name: 'Arjun Sharma',
  grade: '12-A',
  rollNo: '42',
  status: 'active',
  totalFee: 45_000,
  paid: 32_000,
  due: 13_000,
  breakdown: [
    { id: 'f1', label: 'Tuition Fee', amount: 25_000, dueDate: '15 Oct', status: 'paid', icon: 'tuition' },
    { id: 'f2', label: 'Transport Fee', amount: 8_000, dueDate: '01 Nov', status: 'pending', icon: 'transport' },
    { id: 'f3', label: 'Admission Fee', amount: 12_000, status: 'paid', icon: 'admission' },
  ],
};
