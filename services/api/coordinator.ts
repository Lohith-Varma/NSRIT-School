import { mockStore, nextFeeId, nextUserId } from '@/data/mock/store';
import type {
  Class,
  CoordinatorApprovalRequest,
  CoordinatorCircularReview,
  CoordinatorDiaryEntry,
  StudentInput,
  User,
  Wing,
} from '@/types';
import { ApiError, mockRequest } from './client';
import {
  assertActorOwnsClass,
  assertPermission,
  assertRole,
  assertWingAccess,
  getCoordinatorWing,
  requireBranchId,
} from './rbac';

function getWingForActor(actor: User): Wing {
  return actor.role === 'principal' || actor.role === 'branch_admin'
    ? 'secondary'
    : getCoordinatorWing(actor);
}

/** GET /coordinator/classes */
export async function getWingClasses(actor: User): Promise<Class[]> {
  assertPermission(actor, 'classes:read');
  assertRole(actor, 'coordinator', 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);
  const wing = getWingForActor(actor);
  if (actor.role === 'coordinator') assertWingAccess(actor, wing);

  const classes = mockStore.classes
    .filter((c) => c.branchId === branchId && c.wing === wing)
    .map((c) => ({ ...c, studentIds: [...c.studentIds] }));
  return mockRequest(classes);
}

/** GET /coordinator/teachers */
export async function getWingTeachers(actor: User): Promise<User[]> {
  assertPermission(actor, 'teachers:read');
  assertRole(actor, 'coordinator', 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);
  const wing = getWingForActor(actor);
  if (actor.role === 'coordinator') assertWingAccess(actor, wing);

  const teachers = mockStore.users.filter(
    (u) => u.role === 'teacher' && u.branchId === branchId && u.wing === wing,
  );
  return mockRequest(teachers.map((t) => ({ ...t })));
}

/** GET /coordinator/students */
export async function getWingStudents(actor: User): Promise<User[]> {
  assertPermission(actor, 'students:read');
  assertRole(actor, 'coordinator', 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);
  const wing = getWingForActor(actor);
  if (actor.role === 'coordinator') assertWingAccess(actor, wing);

  const students = mockStore.users.filter(
    (u) => u.role === 'student' && u.branchId === branchId && u.wing === wing,
  );
  return mockRequest(students.map((s) => ({ ...s })));
}

/** POST /coordinator/students */
export async function createStudent(actor: User, input: StudentInput): Promise<User> {
  assertPermission(actor, 'students:write');
  assertRole(actor, 'coordinator');

  const branchId = requireBranchId(actor);
  const wing = getCoordinatorWing(actor);
  const email = input.email.trim().toLowerCase();

  if (mockStore.users.some((u) => u.email.toLowerCase() === email)) {
    throw new ApiError('Email already registered', 409);
  }

  const clsIndex = mockStore.classes.findIndex((c) => c.id === input.classId);
  if (clsIndex < 0) throw new ApiError('Class not found', 404);

  const cls = mockStore.classes[clsIndex];
  assertActorOwnsClass(actor, cls);
  assertWingAccess(actor, cls.wing);

  const id = nextUserId('student');
  const student: User = {
    id,
    email,
    name: input.name.trim(),
    role: 'student',
    branchId,
    wing: cls.wing,
    classId: cls.id,
  };

  mockStore.users.push(student);
  cls.studentIds.push(id);

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
    studentId: id,
    classId: cls.id,
    totalAmount,
    paidAmount: 0,
    dueAmount: totalAmount,
    status: 'pending',
    feeStructure,
  });

  return mockRequest({ ...student }, 500);
}

/** Classes available for student onboarding in coordinator's wing */
export async function getWingClassesForEnrollment(actor: User): Promise<Class[]> {
  return getWingClasses(actor);
}

const approvalRequests: CoordinatorApprovalRequest[] = [
  {
    id: 'approval-1',
    studentName: 'Aditya Sharma',
    classLabel: 'CSE - 3rd Year',
    reason: 'Medical',
    duration: '2 Days',
    urgency: 'urgent',
  },
  {
    id: 'approval-2',
    studentName: 'Priya Verma',
    classLabel: 'ECE - 2nd Year',
    reason: 'Family Event',
    duration: '1 Day',
    urgency: 'normal',
  },
  {
    id: 'approval-3',
    studentName: 'Sahil Patel',
    classLabel: 'MECH - 1st Year',
    reason: 'Conference',
    duration: '3 Days',
    urgency: 'normal',
  },
];

const diaryEntries: CoordinatorDiaryEntry[] = [
  {
    id: 'diary-1',
    teacherName: 'Prof. Rajesh Kumar',
    subject: 'Advanced Algorithms',
    details: 'Review pending lesson journal for unit 4.',
    date: 'Oct 24',
  },
  {
    id: 'diary-2',
    teacherName: 'Dr. Sunita Rao',
    subject: 'Digital Electronics',
    details: 'Submit laboratory observation notes.',
    date: 'Oct 24',
  },
  {
    id: 'diary-3',
    teacherName: 'Mr. Amit Singh',
    subject: 'Microprocessors',
    details: 'Share syllabus update for module 2.',
    date: 'Oct 23',
  },
  {
    id: 'diary-4',
    teacherName: 'Ms. Sneha Das',
    subject: 'Database Systems',
    details: 'Approve final term exam plan.',
    date: 'Oct 22',
  },
  {
    id: 'diary-5',
    teacherName: 'Mr. Karan Mehta',
    subject: 'Operating Systems',
    details: 'Confirm lab attendance summary.',
    date: 'Oct 22',
  },
];

const circularReviews: CoordinatorCircularReview[] = [
  {
    id: 'circular-1',
    title: 'Revised Examination Policy 2024-B',
    subtitle: 'Uploaded by Registrar Office',
    category: 'Draft',
    status: 'draft',
  },
  {
    id: 'circular-2',
    title: 'Annual Cultural Fest Schedule',
    subtitle: 'Uploaded by SAC Coordinator',
    category: 'Review',
    status: 'review',
  },
  {
    id: 'circular-3',
    title: 'Sports Day Guidelines',
    subtitle: 'Uploaded by Sports Coordinator',
    category: 'Review',
    status: 'review',
  },
  {
    id: 'circular-4',
    title: 'Parent-Teacher Meeting Notice',
    subtitle: 'Uploaded by Principal Office',
    category: 'Draft',
    status: 'draft',
  },
];

export async function getCoordinatorApprovalRequests(actor: User): Promise<CoordinatorApprovalRequest[]> {
  return mockRequest(approvalRequests);
}

export async function getCoordinatorDiaryEntries(actor: User): Promise<CoordinatorDiaryEntry[]> {
  return mockRequest(diaryEntries);
}

export async function getCoordinatorCircularReviews(actor: User): Promise<CoordinatorCircularReview[]> {
  return mockRequest(circularReviews);
}
