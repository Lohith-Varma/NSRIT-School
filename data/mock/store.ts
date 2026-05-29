import { mockAttendanceRecords } from './attendance';
import { mockBranches } from './branches';
import { mockClasses } from './classes';
import { mockFeeStatuses } from './fees';
import { mockUsers } from './users';
import type {
  Complaint,
  Feedback,
  Timetable,
  Homework,
  HomeworkSubmission,
  VisitorLog,
  ParentEnquiry,
  DocumentRequest,
  TransferCertificateRequest,
  Announcement,
  FeeReceipt,
  AppNotification,
  ExamResult,
  StudyMaterial,
  Exam,
  GalleryAlbum,
  AuditLog,
} from '@/types';

// Pre-populated mock study materials
const mockStudyMaterials: StudyMaterial[] = [
  {
    id: 'mat-1',
    branchId: 'branch-main',
    classId: 'class-cs-10a',
    className: '10th CS',
    subject: 'Computer Science',
    title: 'Python Loops Cheat Sheet',
    description: 'A comprehensive quick reference guide for Python for, while, and nested loops.',
    fileType: 'pdf',
    url: 'https://nsrit.edu/materials/python_loops_cheat_sheet.pdf',
    uploadedBy: 'teacher-1',
    uploadedByName: 'Dr. Priya Sharma',
    uploadedAt: '2026-05-25',
  },
  {
    id: 'mat-2',
    branchId: 'branch-main',
    classId: 'class-math-3b',
    className: '3rd Math',
    subject: 'Mathematics',
    title: 'Division Slides Presentation',
    description: 'Classroom PPT slides used for teaching introduction to basic division concepts.',
    fileType: 'ppt',
    url: 'https://nsrit.edu/materials/division_slides.ppt',
    uploadedBy: 'teacher-2',
    uploadedByName: 'Mr. Anil Desai',
    uploadedAt: '2026-05-27',
  },
];

// Pre-populated mock exams
const mockExams: Exam[] = [
  {
    id: 'exam-1',
    branchId: 'branch-main',
    classId: 'class-cs-10a',
    className: '10th CS',
    subject: 'Computer Science',
    name: 'Final Term 1 Exam',
    date: '2026-06-15',
    maxMarks: 100,
    status: 'scheduled',
  },
  {
    id: 'exam-2',
    branchId: 'branch-main',
    classId: 'class-math-3b',
    className: '3rd Math',
    subject: 'Mathematics',
    name: 'Monthly Mathematics Unit Test',
    date: '2026-06-18',
    maxMarks: 50,
    status: 'scheduled',
  },
];

// Pre-populated mock gallery albums
const mockGalleryAlbums: GalleryAlbum[] = [
  {
    id: 'album-1',
    branchId: 'branch-main',
    title: 'Annual Sports Day 2026',
    description: 'Highlights and athletic competition captures from the NSRIT Annual Sports Event.',
    coverImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop',
    ],
    createdAt: '2026-02-15',
  },
  {
    id: 'album-2',
    branchId: 'branch-main',
    title: 'Science Fair & Exhibition',
    description: 'Students presenting working models of solar plants, robotics, and biology projects.',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop',
    ],
    createdAt: '2026-03-10',
  },
];

// Pre-populated mock audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    branchId: 'branch-main',
    actorId: 'branch-admin-main',
    actorName: 'Ms. Lakshmi Verma',
    actorRole: 'branch_admin',
    action: 'System Config Modified',
    details: 'Academic Term dates shifted forward in main settings.',
    timestamp: '2026-05-28T10:30:00Z',
  },
  {
    id: 'log-2',
    branchId: 'branch-main',
    actorId: 'accountant-1',
    actorName: 'Mr. Rajesh Kumar',
    actorRole: 'accountant',
    action: 'Fee Payment Recorded',
    details: 'Recorded cash payment of ₹45,000 for student-1.',
    timestamp: '2026-05-29T14:15:00Z',
  },
];

// Pre-populated mock timetables
const mockTimetables: Timetable[] = [
  {
    id: 'tt-1',
    branchId: 'branch-main',
    classId: 'class-cs-10a',
    className: '10th CS',
    section: 'A',
    slots: [
      { day: 'Monday', period: 1, subject: 'Computer Science', teacherId: 'teacher-1', teacherName: 'Dr. Priya Sharma' },
      { day: 'Monday', period: 2, subject: 'Mathematics', teacherId: 'teacher-2', teacherName: 'Mr. Anil Desai' },
      { day: 'Tuesday', period: 1, subject: 'Physics', teacherId: 'teacher-3', teacherName: 'Dr. Kavita Menon' },
      { day: 'Wednesday', period: 3, subject: 'Computer Science', teacherId: 'teacher-1', teacherName: 'Dr. Priya Sharma' },
      { day: 'Thursday', period: 2, subject: 'Chemistry', teacherId: 'teacher-3', teacherName: 'Dr. Kavita Menon' },
      { day: 'Friday', period: 1, subject: 'Computer Science', teacherId: 'teacher-1', teacherName: 'Dr. Priya Sharma' },
    ],
  },
  {
    id: 'tt-2',
    branchId: 'branch-main',
    classId: 'class-math-3b',
    className: '3rd Math',
    section: 'B',
    slots: [
      { day: 'Monday', period: 1, subject: 'Mathematics', teacherId: 'teacher-2', teacherName: 'Mr. Anil Desai' },
      { day: 'Tuesday', period: 2, subject: 'Mathematics', teacherId: 'teacher-2', teacherName: 'Mr. Anil Desai' },
      { day: 'Wednesday', period: 1, subject: 'Mathematics', teacherId: 'teacher-2', teacherName: 'Mr. Anil Desai' },
      { day: 'Thursday', period: 3, subject: 'Science', teacherId: 'teacher-3', teacherName: 'Dr. Kavita Menon' },
      { day: 'Friday', period: 2, subject: 'Mathematics', teacherId: 'teacher-2', teacherName: 'Mr. Anil Desai' },
    ],
  },
];

// Pre-populated mock homeworks
const mockHomeworkList: Homework[] = [
  {
    id: 'hw-1',
    branchId: 'branch-main',
    classId: 'class-cs-10a',
    className: '10th CS',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Priya Sharma',
    title: 'Variables and Operations in Python',
    description: 'Complete questions 1 to 5 from chapter 2 of the textbook. Write a simple Python program using variables.',
    dueDate: '2026-06-05',
    createdAt: '2026-05-28',
  },
  {
    id: 'hw-2',
    branchId: 'branch-main',
    classId: 'class-math-3b',
    className: '3rd Math',
    teacherId: 'teacher-2',
    teacherName: 'Mr. Anil Desai',
    title: 'Addition & Subtraction Exercises',
    description: 'Solve the multiplication tables of 6 and 7 in your workbook, page 43.',
    dueDate: '2026-06-03',
    createdAt: '2026-05-29',
  },
];

const mockHomeworkSubmissionsList: HomeworkSubmission[] = [
  {
    id: 'sub-1',
    homeworkId: 'hw-1',
    studentId: 'student-1',
    studentName: 'Arjun Mehta',
    submittedAt: '2026-05-29',
    status: 'submitted',
  },
  {
    id: 'sub-2',
    homeworkId: 'hw-1',
    studentId: 'student-2',
    studentName: 'Sneha Rao',
    submittedAt: '2026-05-29',
    status: 'graded',
    grade: 'A+',
    remarks: 'Excellent code logic!',
  },
];

const mockVisitorLogsList: VisitorLog[] = [
  {
    id: 'vis-1',
    branchId: 'branch-main',
    name: 'Sanjeev Kumar',
    purpose: 'Admission Enquiry for Daughter',
    contactNumber: '9988776655',
    checkInTime: '2026-05-29 09:30 AM',
    checkOutTime: '2026-05-29 10:15 AM',
  },
  {
    id: 'vis-2',
    branchId: 'branch-main',
    name: 'Mahesh Babu',
    purpose: 'Meeting Coordinator (Meena K.)',
    contactNumber: '9988776644',
    checkInTime: '2026-05-29 10:45 AM',
  },
];

const mockAnnouncementsList: Announcement[] = [
  {
    id: 'ann-1',
    branchId: 'branch-main',
    title: 'Summer Vacation Declaration',
    content: 'School will remain closed for summer holidays from June 20th to July 15th. Have a great vacation!',
    targetAudience: 'All',
    createdAt: '2026-05-25',
  },
  {
    id: 'ann-2',
    branchId: 'branch-main',
    title: 'Primary Wing Parent Teacher Meeting',
    content: 'A PTM for Grades 1 to 5 is scheduled this Saturday, June 6th, to review monthly progress.',
    targetAudience: 'Parents',
    createdAt: '2026-05-28',
  },
];

const mockNotificationsList: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'parent-1',
    branchId: 'branch-main',
    title: 'Attendance Alert',
    message: 'Arjun Mehta was marked Present today.',
    createdAt: '2026-05-29',
    read: false,
  },
];

const mockComplaintsList: Complaint[] = [
  {
    id: 'comp-1',
    parentId: 'parent-1',
    parentName: 'Rajesh Mehta',
    studentId: 'student-1',
    studentName: 'Arjun Mehta',
    title: 'Drinking Water Cooler Unclean',
    description: 'The drinking water cooler near Class 10A has not been cleaned for a week. Students are complaining of a strange smell.',
    branchId: 'branch-main',
    status: 'Forwarded to Principal',
    coordinatorComments: 'Verified with school cleaning staff. Water filter replacement is overdue. Forwarding to Principal for budget approval.',
    createdAt: '2026-05-28',
    updatedAt: '2026-05-29',
  },
  {
    id: 'comp-2',
    parentId: 'parent-2',
    parentName: 'Amit Shah',
    studentId: 'student-2',
    studentName: 'Sneha Rao',
    title: 'School Bus Delay',
    description: 'Route 14 bus is constantly late by 30-40 minutes in the morning. This causes students to miss their morning assembly.',
    branchId: 'branch-main',
    status: 'Under Review',
    createdAt: '2026-05-29',
    updatedAt: '2026-05-29',
  },
];

/** Persisted state collections.
 * Mutations persist for the app session (resets on reload).
 */
// Pre-populated mock exam results
const mockExamResultsList: ExamResult[] = [
  {
    id: 'res-1',
    studentId: 'student-1',
    subject: 'Computer Science',
    examName: 'Midterm Exam',
    marksObtained: 94,
    maxMarks: 100,
    grade: 'A+',
    remarks: 'Excellent programming logic and code structure.',
    date: '2026-04-15',
  },
  {
    id: 'res-2',
    studentId: 'student-1',
    subject: 'Mathematics',
    examName: 'Midterm Exam',
    marksObtained: 88,
    maxMarks: 100,
    grade: 'A',
    remarks: 'Strong performance. Keep solving word problems.',
    date: '2026-04-16',
  },
  {
    id: 'res-3',
    studentId: 'student-2',
    subject: 'Computer Science',
    examName: 'Midterm Exam',
    marksObtained: 92,
    maxMarks: 100,
    grade: 'A',
    remarks: 'Very active in class, great coding exercises.',
    date: '2026-04-15',
  },
  {
    id: 'res-4',
    studentId: 'student-5',
    subject: 'Mathematics',
    examName: 'Midterm Exam',
    marksObtained: 76,
    maxMarks: 100,
    grade: 'B',
    remarks: 'Focus on geometry and basic algebra exercises.',
    date: '2026-04-18',
  },
];

export const mockStore = {
  branches: [...mockBranches],
  users: [...mockUsers],
  classes: [...mockClasses],
  attendance: [...mockAttendanceRecords],
  fees: [...mockFeeStatuses],
  complaints: [...mockComplaintsList] as Complaint[],
  feedback: [] as Feedback[],
  timetables: [...mockTimetables] as Timetable[],
  homework: [...mockHomeworkList] as Homework[],
  homeworkSubmissions: [...mockHomeworkSubmissionsList] as HomeworkSubmission[],
  visitorLogs: [...mockVisitorLogsList] as VisitorLog[],
  parentEnquiries: [] as ParentEnquiry[],
  documentRequests: [] as DocumentRequest[],
  tcRequests: [] as TransferCertificateRequest[],
  announcements: [...mockAnnouncementsList] as Announcement[],
  receipts: [] as FeeReceipt[],
  notifications: [...mockNotificationsList] as AppNotification[],
  results: [...mockExamResultsList] as ExamResult[],
  studyMaterials: [...mockStudyMaterials] as StudyMaterial[],
  exams: [...mockExams] as Exam[],
  galleryAlbums: [...mockGalleryAlbums] as GalleryAlbum[],
  auditLogs: [...mockAuditLogs] as AuditLog[],
};

let attendanceIdCounter = mockAttendanceRecords.length + 1;
let userIdCounter = mockUsers.length + 1;
let classIdCounter = mockClasses.length + 1;
let feeIdCounter = mockFeeStatuses.length + 1;
let branchIdCounter = mockBranches.length + 1;
let complaintIdCounter = mockComplaintsList.length + 1;
let feedbackIdCounter = 1;
let timetableIdCounter = mockTimetables.length + 1;
let homeworkIdCounter = mockHomeworkList.length + 1;
let submissionIdCounter = mockHomeworkSubmissionsList.length + 1;
let visitorIdCounter = mockVisitorLogsList.length + 1;
let enquiryIdCounter = 1;
let docRequestIdCounter = 1;
let tcRequestIdCounter = 1;
let announcementIdCounter = mockAnnouncementsList.length + 1;
let receiptIdCounter = 1;
let notificationIdCounter = mockNotificationsList.length + 1;
let resultIdCounter = mockExamResultsList.length + 1;
let studyMaterialIdCounter = mockStudyMaterials.length + 1;
let examIdCounter = mockExams.length + 1;
let galleryAlbumIdCounter = mockGalleryAlbums.length + 1;
let auditLogIdCounter = mockAuditLogs.length + 1;

export function nextStudyMaterialId(): string {
  return `mat-${studyMaterialIdCounter++}`;
}

export function nextExamId(): string {
  return `exam-${examIdCounter++}`;
}

export function nextGalleryAlbumId(): string {
  return `album-${galleryAlbumIdCounter++}`;
}

export function nextAuditLogId(): string {
  return `log-${auditLogIdCounter++}`;
}

export function nextAttendanceId(): string {
  return `att-${attendanceIdCounter++}`;
}

export function nextResultId(): string {
  return `res-${resultIdCounter++}`;
}

export function nextUserId(role: string): string {
  return `${role}-${userIdCounter++}`;
}

export function nextClassId(): string {
  return `class-${classIdCounter++}`;
}

export function nextFeeId(): string {
  return `fee-${feeIdCounter++}`;
}

export function nextBranchId(): string {
  return `branch-${branchIdCounter++}`;
}

export function nextComplaintId(): string {
  return `comp-${complaintIdCounter++}`;
}

export function nextFeedbackId(): string {
  return `fb-${feedbackIdCounter++}`;
}

export function nextTimetableId(): string {
  return `tt-${timetableIdCounter++}`;
}

export function nextHomeworkId(): string {
  return `hw-${homeworkIdCounter++}`;
}

export function nextSubmissionId(): string {
  return `sub-${submissionIdCounter++}`;
}

export function nextVisitorId(): string {
  return `vis-${visitorIdCounter++}`;
}

export function nextEnquiryId(): string {
  return `enq-${enquiryIdCounter++}`;
}

export function nextDocRequestId(): string {
  return `doc-${docRequestIdCounter++}`;
}

export function nextTcRequestId(): string {
  return `tc-${tcRequestIdCounter++}`;
}

export function nextAnnouncementId(): string {
  return `ann-${announcementIdCounter++}`;
}

export function nextReceiptId(): string {
  return `rcpt-${receiptIdCounter++}`;
}

export function nextNotificationId(): string {
  return `notif-${notificationIdCounter++}`;
}
