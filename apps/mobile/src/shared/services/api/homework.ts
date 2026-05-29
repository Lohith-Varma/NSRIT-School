import { mockStore, nextHomeworkId, nextSubmissionId, nextNotificationId } from '@/data/mock/store';
import type { Homework, HomeworkSubmission, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertRole, requireBranchId } from './rbac';

/** GET /classes/:classId/homework */
export async function listHomeworkForClass(actor: User, classId: string): Promise<Homework[]> {
  const branchId = requireBranchId(actor);
  const list = mockStore.homework.filter((h) => h.classId === classId && h.branchId === branchId);
  return mockRequest(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

/** POST /homework */
export async function createHomework(
  actor: User,
  classId: string,
  title: string,
  description: string,
  dueDate: string,
  publish = true,
): Promise<Homework> {
  assertRole(actor, 'teacher');
  const branchId = requireBranchId(actor);

  const cls = mockStore.classes.find((c) => c.id === classId && c.branchId === branchId);
  if (!cls) throw new ApiError('Class not found', 404);
  if (cls.teacherId !== actor.id) {
    throw new ApiError('Forbidden: you do not teach this class', 403);
  }

  const date = new Date().toISOString().split('T')[0];
  const newHomework: Homework = {
    id: nextHomeworkId(),
    branchId,
    classId,
    className: `${cls.name} (${cls.section})`,
    teacherId: actor.id,
    teacherName: actor.name,
    title: title.trim(),
    description: description.trim(),
    dueDate,
    createdAt: date,
    published: publish,
  };

  mockStore.homework.push(newHomework);

  if (publish) {
    const students = mockStore.users.filter((u) => u.role === 'student' && u.classId === classId);
    
    // Notify parents
    const parentIds = new Set(students.map((s) => s.parentId).filter(Boolean) as string[]);
    parentIds.forEach((pid) => {
      mockStore.notifications.push({
        id: nextNotificationId(),
        userId: pid,
        branchId,
        title: 'New Homework Assigned',
        message: `${actor.name} assigned homework: "${newHomework.title}" due by ${dueDate}.`,
        createdAt: date,
        read: false,
      });
    });

    // Notify students
    students.forEach((s) => {
      mockStore.notifications.push({
        id: nextNotificationId(),
        userId: s.id,
        branchId,
        title: 'New Homework Assigned',
        message: `${actor.name} assigned homework: "${newHomework.title}" due by ${dueDate}.`,
        createdAt: date,
        read: false,
      });

      // Pre-create pending submissions for all students in the class
      mockStore.homeworkSubmissions.push({
        id: nextSubmissionId(),
        homeworkId: newHomework.id,
        studentId: s.id,
        studentName: s.name,
        submittedAt: '',
        status: 'pending',
      });
    });
  }

  return mockRequest(newHomework);
}

/** PATCH /homework/:homeworkId */
export async function editHomework(
  actor: User,
  homeworkId: string,
  title: string,
  description: string,
  dueDate: string,
  publish = false,
): Promise<Homework> {
  assertRole(actor, 'teacher');
  const branchId = requireBranchId(actor);

  const index = mockStore.homework.findIndex((h) => h.id === homeworkId && h.teacherId === actor.id);
  if (index < 0) throw new ApiError('Homework not found', 404);

  const hw = mockStore.homework[index];
  const oldPublish = hw.published;
  
  hw.title = title.trim();
  hw.description = description.trim();
  hw.dueDate = dueDate;
  if (publish) {
    hw.published = true;
  }

  mockStore.homework[index] = hw;

  // If transitioned from draft to published, create submissions and notify
  if (!oldPublish && hw.published) {
    const date = new Date().toISOString().split('T')[0];
    const students = mockStore.users.filter((u) => u.role === 'student' && u.classId === hw.classId);
    
    // Notify parents
    const parentIds = new Set(students.map((s) => s.parentId).filter(Boolean) as string[]);
    parentIds.forEach((pid) => {
      mockStore.notifications.push({
        id: nextNotificationId(),
        userId: pid,
        branchId,
        title: 'New Homework Assigned',
        message: `${actor.name} assigned homework: "${hw.title}" due by ${dueDate}.`,
        createdAt: date,
        read: false,
      });
    });

    // Notify students
    students.forEach((s) => {
      mockStore.notifications.push({
        id: nextNotificationId(),
        userId: s.id,
        branchId,
        title: 'New Homework Assigned',
        message: `${actor.name} assigned homework: "${hw.title}" due by ${dueDate}.`,
        createdAt: date,
        read: false,
      });

      // Pre-create pending submissions for all students in the class
      mockStore.homeworkSubmissions.push({
        id: nextSubmissionId(),
        homeworkId: hw.id,
        studentId: s.id,
        studentName: s.name,
        submittedAt: '',
        status: 'pending',
      });
    });
  }

  return mockRequest({ ...hw });
}

/** GET /homework/:homeworkId/submissions */
export async function listSubmissions(actor: User, homeworkId: string): Promise<HomeworkSubmission[]> {
  assertRole(actor, 'teacher');
  const list = mockStore.homeworkSubmissions.filter((s) => s.homeworkId === homeworkId);
  return mockRequest(list.sort((a, b) => a.studentName.localeCompare(b.studentName)));
}

/** PATCH /submissions/:submissionId */
export async function gradeSubmission(
  actor: User,
  submissionId: string,
  status: HomeworkSubmission['status'],
  grade?: string,
  remarks?: string,
): Promise<HomeworkSubmission> {
  assertRole(actor, 'teacher');
  const index = mockStore.homeworkSubmissions.findIndex((s) => s.id === submissionId);
  if (index < 0) throw new ApiError('Submission not found', 404);

  const sub = mockStore.homeworkSubmissions[index];
  const updated: HomeworkSubmission = {
    ...sub,
    status,
    grade: grade?.trim() || sub.grade,
    remarks: remarks?.trim() || sub.remarks,
    submittedAt: status === 'submitted' || status === 'graded' ? (sub.submittedAt || new Date().toISOString().split('T')[0]) : '',
  };

  mockStore.homeworkSubmissions[index] = updated;

  const student = mockStore.users.find((u) => u.id === sub.studentId);
  const dateStr = new Date().toISOString().split('T')[0];

  // Notify Student
  mockStore.notifications.push({
    id: nextNotificationId(),
    userId: sub.studentId,
    branchId: student?.branchId || '',
    title: 'Homework Graded',
    message: `Your homework submission was graded "${updated.grade ?? 'Graded'}". Remarks: "${updated.remarks ?? ''}"`,
    createdAt: dateStr,
    read: false,
  });

  // Notify Parent
  if (student?.parentId) {
    mockStore.notifications.push({
      id: nextNotificationId(),
      userId: student.parentId,
      branchId: student.branchId || '',
      title: 'Homework Graded',
      message: `Your child's homework submission was graded "${updated.grade ?? 'Graded'}". Remarks: "${updated.remarks ?? ''}"`,
      createdAt: dateStr,
      read: false,
    });
  }

  return mockRequest(updated);
}

export interface StudentHomeworkRow {
  homework: Homework;
  submission?: HomeworkSubmission;
}

/** GET /students/:studentId/homework */
export async function getHomeworkForStudent(actor: User, studentId: string): Promise<StudentHomeworkRow[]> {
  const branchId = requireBranchId(actor);
  const student = mockStore.users.find((u) => u.id === studentId);
  if (!student) throw new ApiError('Student not found', 404);

  // Parents and students should only see published homeworks
  const homeworks = mockStore.homework.filter(
    (h) => h.classId === student.classId && h.branchId === branchId && h.published !== false
  );

  const rows = homeworks.map((h) => {
    const submission = mockStore.homeworkSubmissions.find(
      (s) => s.homeworkId === h.id && s.studentId === studentId
    );
    return {
      homework: h,
      submission,
    };
  });

  return mockRequest(rows.sort((a, b) => b.homework.dueDate.localeCompare(a.homework.dueDate)));
}
