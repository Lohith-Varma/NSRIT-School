import {
  mockStore,
  nextVisitorId,
  nextEnquiryId,
  nextDocRequestId,
  nextTcRequestId,
  nextAnnouncementId,
  nextUserId,
  nextFeeId,
} from '@/data/mock/store';
import type {
  VisitorLog,
  ParentEnquiry,
  DocumentRequest,
  TransferCertificateRequest,
  Announcement,
  User,
} from '@/types';
import { ApiError, mockRequest } from './client';
import { generateAdmissionNumber } from './studentManagement';
import { assertRole, requireBranchId } from './rbac';

/** VISITORS **/
export async function checkInVisitor(
  actor: User,
  name: string,
  purpose: string,
  contactNumber: string,
): Promise<VisitorLog> {
  assertRole(actor, 'branch_admin', 'coordinator');
  const branchId = requireBranchId(actor);

  const log: VisitorLog = {
    id: nextVisitorId(),
    branchId,
    name: name.trim(),
    purpose: purpose.trim(),
    contactNumber: contactNumber.trim(),
    checkInTime: new Date().toISOString(),
  };

  mockStore.visitorLogs.push(log);
  return mockRequest(log);
}

export async function checkOutVisitor(actor: User, visitorId: string): Promise<VisitorLog> {
  assertRole(actor, 'branch_admin', 'coordinator');
  const branchId = requireBranchId(actor);

  const index = mockStore.visitorLogs.findIndex((v) => v.id === visitorId && v.branchId === branchId);
  if (index < 0) throw new ApiError('Visitor log not found', 404);

  const log = mockStore.visitorLogs[index];
  log.checkOutTime = new Date().toISOString();
  mockStore.visitorLogs[index] = log;

  return mockRequest(log);
}

export async function listVisitorLogs(actor: User): Promise<VisitorLog[]> {
  assertRole(actor, 'front_desk');
  const branchId = requireBranchId(actor);
  return mockRequest(mockStore.visitorLogs.filter((v) => v.branchId === branchId));
}

/** ENQUIRIES **/
export async function recordEnquiry(
  actor: User,
  parentName: string,
  contactNumber: string,
  email: string,
  grade: string,
  comments: string,
): Promise<ParentEnquiry> {
  assertRole(actor, 'branch_admin', 'coordinator');
  const branchId = requireBranchId(actor);

  const enq: ParentEnquiry = {
    id: nextEnquiryId(),
    branchId,
    parentName: parentName.trim(),
    contactNumber: contactNumber.trim(),
    email: email.trim(),
    studentGrade: grade.trim(),
    comments: comments.trim(),
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
  };

  mockStore.parentEnquiries.push(enq);
  return mockRequest(enq);
}

export async function listEnquiries(actor: User): Promise<ParentEnquiry[]> {
  assertRole(actor, 'front_desk');
  const branchId = requireBranchId(actor);
  return mockRequest(mockStore.parentEnquiries.filter((e) => e.branchId === branchId));
}

/** DOCUMENTS & TC **/
export async function listDocumentRequests(actor: User): Promise<DocumentRequest[]> {
  const branchId = requireBranchId(actor);
  // Front Desk or Parents can list them
  if (actor.role === 'parent') {
    const students = mockStore.users.filter((u) => u.parentId === actor.id);
    const sIds = students.map((s) => s.id);
    return mockRequest(mockStore.documentRequests.filter((d) => sIds.includes(d.studentId) && d.branchId === branchId));
  }
  return mockRequest(mockStore.documentRequests.filter((d) => d.branchId === branchId));
}

export async function createDocumentRequest(
  actor: User,
  studentId: string,
  documentType: DocumentRequest['documentType'],
): Promise<DocumentRequest> {
  assertRole(actor, 'parent');
  const branchId = requireBranchId(actor);

  const student = mockStore.users.find((u) => u.id === studentId);
  if (!student) throw new ApiError('Student not found', 404);

  const req: DocumentRequest = {
    id: nextDocRequestId(),
    branchId,
    studentId,
    studentName: student.name,
    documentType,
    status: 'Requested',
    requestedAt: new Date().toISOString().split('T')[0],
  };

  mockStore.documentRequests.push(req);
  return mockRequest(req);
}

export async function updateDocumentRequestStatus(
  actor: User,
  requestId: string,
  status: DocumentRequest['status'],
): Promise<DocumentRequest> {
  assertRole(actor, 'branch_admin', 'principal');
  const branchId = requireBranchId(actor);

  const index = mockStore.documentRequests.findIndex((d) => d.id === requestId && d.branchId === branchId);
  if (index < 0) throw new ApiError('Request not found', 404);

  mockStore.documentRequests[index].status = status;
  return mockRequest(mockStore.documentRequests[index]);
}

export async function listTCRequests(actor: User): Promise<TransferCertificateRequest[]> {
  const branchId = requireBranchId(actor);
  return mockRequest(mockStore.tcRequests.filter((t) => t.branchId === branchId));
}

export async function submitTCRequest(
  actor: User,
  studentId: string,
  reason: string,
): Promise<TransferCertificateRequest> {
  // Can be requested by parent or front desk
  const branchId = requireBranchId(actor);
  const student = mockStore.users.find((u) => u.id === studentId);
  if (!student) throw new ApiError('Student not found', 404);

  const req: TransferCertificateRequest = {
    id: nextTcRequestId(),
    branchId,
    studentId,
    studentName: student.name,
    reason: reason.trim(),
    status: 'Submitted',
    requestedAt: new Date().toISOString().split('T')[0],
  };

  mockStore.tcRequests.push(req);
  return mockRequest(req);
}

export async function updateTCRequestStatus(
  actor: User,
  requestId: string,
  status: TransferCertificateRequest['status'],
): Promise<TransferCertificateRequest> {
  assertRole(actor, 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);

  const index = mockStore.tcRequests.findIndex((t) => t.id === requestId && t.branchId === branchId);
  if (index < 0) throw new ApiError('TC Request not found', 404);

  mockStore.tcRequests[index].status = status;
  return mockRequest(mockStore.tcRequests[index]);
}

/** ANNOUNCEMENTS **/
export async function createAnnouncement(
  actor: User,
  title: string,
  content: string,
  targetAudience: Announcement['targetAudience'],
): Promise<Announcement> {
  assertRole(actor, 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);

  const ann: Announcement = {
    id: nextAnnouncementId(),
    branchId,
    title: title.trim(),
    content: content.trim(),
    targetAudience,
    createdAt: new Date().toISOString().split('T')[0],
  };

  mockStore.announcements.push(ann);
  return mockRequest(ann);
}

export async function listAnnouncements(actor: User): Promise<Announcement[]> {
  const branchId = requireBranchId(actor);
  // Filters based on audience if necessary, but returning all for branch
  return mockRequest(mockStore.announcements.filter((a) => a.branchId === branchId));
}

/** STUDENT ADMISSION **/
export async function admitStudent(
  actor: User,
  name: string,
  email: string,
  classId: string,
  parentEmail: string,
): Promise<User> {
  assertRole(actor, 'branch_admin', 'coordinator');
  const branchId = requireBranchId(actor);

  const normEmail = email.trim().toLowerCase();
  if (mockStore.users.some((u) => u.email.toLowerCase() === normEmail)) {
    throw new ApiError('Student email already registered', 409);
  }

  const cls = mockStore.classes.find((c) => c.id === classId && c.branchId === branchId);
  if (!cls) throw new ApiError('Class not found', 404);

  // Link or create parent
  let parent = mockStore.users.find((u) => u.email.toLowerCase() === parentEmail.trim().toLowerCase() && u.role === 'parent');
  if (!parent) {
    const parentId = nextUserId('parent');
    parent = {
      id: parentId,
      email: parentEmail.trim().toLowerCase(),
      name: `Parent of ${name}`,
      role: 'parent',
      branchId,
    };
    mockStore.users.push(parent);
  }

  const studentId = nextUserId('student');
  const student: User = {
    id: studentId,
    email: normEmail,
    name: name.trim(),
    role: 'student',
    branchId,
    wing: cls.wing,
    classId: cls.id,
    parentId: parent.id,
    admissionNumber: generateAdmissionNumber(),
    status: 'Active',
  };

  mockStore.users.push(student);
  cls.studentIds.push(studentId);

  // Setup fee status
  const feeStructure =
    cls.wing === 'primary'
      ? [
          { label: 'Tuition', amount: 28000 },
          { label: 'Activity', amount: 3000 },
        ]
      : cls.wing === 'higher_secondary'
        ? [
            { label: 'Tuition', amount: 55000 },
            { label: 'Lab Fee', amount: 8000 },
            { label: 'Exam Fee', amount: 4000 },
          ]
        : [
            { label: 'Tuition', amount: 45000 },
            { label: 'Lab Fee', amount: 5000 },
            { label: 'Library', amount: 2000 },
          ];

  const totalAmount = feeStructure.reduce((s, i) => s + i.amount, 0);
  mockStore.fees.push({
    id: nextFeeId(),
    branchId,
    studentId,
    classId: cls.id,
    totalAmount,
    paidAmount: 0,
    dueAmount: totalAmount,
    status: 'pending',
    feeStructure,
  });

  return mockRequest(student);
}
