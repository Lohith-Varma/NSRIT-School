import { mockStore, nextAttendanceId } from '@/data/mock/store';
import type {
  AttendanceMarkInput,
  AttendanceRecord,
  AttendanceStatus,
  StudentAttendanceSummary,
  User,
} from '@/types';
import { ApiError, mockRequest } from './client';
import { assertParentChildAccess } from './parent';
import { assertActorOwnsClass, assertPermission, assertRole } from './rbac';

/** GET /classes/:classId/attendance?date= */
export async function getClassAttendanceForDate(
  actor: User,
  classId: string,
  date: string,
): Promise<AttendanceRecord[]> {
  assertPermission(actor, 'classes:read');
  assertRole(actor, 'teacher');

  const cls = mockStore.classes.find((c) => c.id === classId);
  if (!cls) throw new ApiError('Class not found', 404);
  assertActorOwnsClass(actor, cls);
  if (cls.teacherId !== actor.id) {
    throw new ApiError('You are not assigned to this class', 403);
  }

  const records = mockStore.attendance.filter(
    (r) => r.branchId === cls.branchId && r.classId === classId && r.date === date,
  );
  return mockRequest(records.map((r) => ({ ...r })));
}

/** POST /classes/:classId/attendance */
export async function postClassAttendance(
  actor: User,
  classId: string,
  date: string,
  marks: AttendanceMarkInput[],
): Promise<AttendanceRecord[]> {
  assertPermission(actor, 'attendance:write');
  assertRole(actor, 'teacher');

  const cls = mockStore.classes.find((c) => c.id === classId);
  if (!cls) throw new ApiError('Class not found', 404);
  assertActorOwnsClass(actor, cls);
  if (cls.teacherId !== actor.id) {
    throw new ApiError('You are not assigned to this class', 403);
  }

  const teacherId = actor.id;
  const created: AttendanceRecord[] = [];

  for (const mark of marks) {
    if (!cls.studentIds.includes(mark.studentId)) {
      throw new ApiError(`Student ${mark.studentId} is not in this class`, 400);
    }

    const existingIndex = mockStore.attendance.findIndex(
      (r) =>
        r.classId === classId &&
        r.studentId === mark.studentId &&
        r.date === date,
    );

    const record: AttendanceRecord = {
      id: existingIndex >= 0 ? mockStore.attendance[existingIndex].id : nextAttendanceId(),
      branchId: cls.branchId,
      classId,
      studentId: mark.studentId,
      date,
      status: mark.status,
      markedBy: teacherId,
    };

    if (existingIndex >= 0) {
      mockStore.attendance[existingIndex] = record;
    } else {
      mockStore.attendance.push(record);
    }
    created.push({ ...record });
  }

  return mockRequest(created, 600);
}

/** GET /students/:studentId/attendance */
export async function getStudentAttendance(
  actor: User,
  studentId: string,
): Promise<StudentAttendanceSummary> {
  assertRole(actor, 'parent');
  assertParentChildAccess(actor, studentId);

  const student = mockStore.users.find((u) => u.id === studentId && u.role === 'student');
  if (!student?.branchId) throw new ApiError('Student not found', 404);

  const records = mockStore.attendance
    .filter((r) => r.studentId === studentId && r.branchId === student.branchId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((r) => ({ ...r }));

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const totalDays = records.length;
  const percentage =
    totalDays === 0 ? 0 : Math.round((presentCount / totalDays) * 100);

  return mockRequest({
    records,
    presentCount,
    absentCount,
    totalDays,
    percentage,
  });
}

export function formatAttendanceStatus(status: AttendanceStatus): string {
  return status === 'present' ? 'Present' : 'Absent';
}
