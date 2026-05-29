import { mockStore, nextExamId, nextResultId, nextNotificationId } from '@/data/mock/store';
import type { Exam, ExamResult, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertParentChildAccess } from './parent';
import { assertRole, requireBranchId } from './rbac';

/** GET /results/:studentId */
export async function getStudentResults(actor: User, studentId: string): Promise<ExamResult[]> {
  // Access check: Parents can only view their own child's results
  if (actor.role === 'parent') {
    assertParentChildAccess(actor, studentId);
  } else {
    assertRole(actor, 'teacher', 'coordinator', 'principal', 'branch_admin');
  }

  const results = mockStore.results.filter((r) => r.studentId === studentId);
  return mockRequest(results.map((r) => ({ ...r })));
}

/** POST /exams */
export async function scheduleExam(
  actor: User,
  classId: string,
  subject: string,
  name: string,
  date: string,
  maxMarks: number,
): Promise<Exam> {
  assertRole(actor, 'teacher', 'coordinator', 'principal');
  const branchId = requireBranchId(actor);

  const cls = mockStore.classes.find((c) => c.id === classId && c.branchId === branchId);
  if (!cls) throw new ApiError('Class not found', 404);

  const newExam: Exam = {
    id: nextExamId(),
    branchId,
    classId,
    className: `${cls.name} (${cls.section})`,
    subject,
    name: name.trim(),
    date,
    maxMarks,
    status: 'scheduled',
  };

  mockStore.exams.push(newExam);
  return mockRequest(newExam);
}

/** GET /exams/:classId */
export async function listExams(actor: User, classId: string): Promise<Exam[]> {
  const branchId = requireBranchId(actor);
  const exams = mockStore.exams.filter((e) => e.classId === classId && e.branchId === branchId);
  return mockRequest(exams.sort((a, b) => b.date.localeCompare(a.date)));
}

/** POST /exams/:examId/marks */
export async function enterMarks(
  actor: User,
  examId: string,
  studentId: string,
  marksObtained: number,
  remarks?: string,
): Promise<ExamResult> {
  assertRole(actor, 'teacher');
  const branchId = requireBranchId(actor);

  const exam = mockStore.exams.find((e) => e.id === examId && e.branchId === branchId);
  if (!exam) throw new ApiError('Exam not found', 404);

  const student = mockStore.users.find((u) => u.id === studentId && u.role === 'student' && u.branchId === branchId);
  if (!student) throw new ApiError('Student not found', 404);

  if (marksObtained > exam.maxMarks) {
    throw new ApiError(`Marks obtained (${marksObtained}) cannot exceed Max Marks (${exam.maxMarks})`, 400);
  }

  // Calculate standard grade
  const pct = (marksObtained / exam.maxMarks) * 100;
  let grade = 'F';
  if (pct >= 90) grade = 'A+';
  else if (pct >= 80) grade = 'A';
  else if (pct >= 70) grade = 'B';
  else if (pct >= 60) grade = 'C';
  else if (pct >= 50) grade = 'D';

  const dateStr = new Date().toISOString().split('T')[0];

  // Upsert result record
  const existingIdx = mockStore.results.findIndex(
    (r) => r.studentId === studentId && r.examName === exam.name && r.subject === exam.subject
  );

  const newResult: ExamResult = {
    id: existingIdx >= 0 ? mockStore.results[existingIdx].id : nextResultId(),
    studentId,
    subject: exam.subject,
    examName: exam.name,
    marksObtained,
    maxMarks: exam.maxMarks,
    grade,
    remarks: remarks?.trim() || 'Good attempt.',
    date: dateStr,
  };

  if (existingIdx >= 0) {
    mockStore.results[existingIdx] = newResult;
  } else {
    mockStore.results.push(newResult);
  }

  exam.status = 'grading';
  return mockRequest(newResult);
}

/** POST /exams/:examId/publish */
export async function publishExamResults(actor: User, examId: string): Promise<Exam> {
  assertRole(actor, 'coordinator', 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);

  const exam = mockStore.exams.find((e) => e.id === examId && e.branchId === branchId);
  if (!exam) throw new ApiError('Exam not found', 404);

  exam.status = 'published';

  // Notify students and parents in the class
  const students = mockStore.users.filter((u) => u.role === 'student' && u.classId === exam.classId);
  const dateStr = new Date().toISOString().split('T')[0];

  students.forEach((s) => {
    // Notify student
    mockStore.notifications.push({
      id: nextNotificationId(),
      userId: s.id,
      branchId,
      title: 'Exam Results Published',
      message: `Results for "${exam.name}" (${exam.subject}) have been declared! Check your results tab.`,
      createdAt: dateStr,
      read: false,
    });

    // Notify parent
    if (s.parentId) {
      mockStore.notifications.push({
        id: nextNotificationId(),
        userId: s.parentId,
        branchId,
        title: 'Exam Results Published',
        message: `Exam results for your child Arjun's "${exam.name}" (${exam.subject}) are now published.`,
        createdAt: dateStr,
        read: false,
      });
    }
  });

  return mockRequest(exam);
}
