import { mockStore, nextTimetableId, nextNotificationId } from '@/data/mock/store';
import type { Timetable, TimetableSlot, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertRole, assertBranchAccess, requireBranchId } from './rbac';

/** GET /classes/:classId/timetable */
export async function getTimetableForClass(actor: User, classId: string): Promise<Timetable | null> {
  const branchId = requireBranchId(actor);
  const tt = mockStore.timetables.find((t) => t.classId === classId && t.branchId === branchId);
  return mockRequest(tt ? { ...tt, slots: [...tt.slots] } : null);
}

/** GET /teachers/:teacherId/timetable */
export async function getTimetableForTeacher(actor: User, teacherId: string): Promise<TimetableSlot[]> {
  const branchId = requireBranchId(actor);
  const slots: TimetableSlot[] = [];

  mockStore.timetables
    .filter((t) => t.branchId === branchId)
    .forEach((t) => {
      t.slots.forEach((s) => {
        if (s.teacherId === teacherId) {
          slots.push({
            ...s,
            day: s.day,
            // Add reference to which class this slot is for
            teacherName: `${t.className} (${t.section})`,
          });
        }
      });
    });

  return mockRequest(slots);
}

/** POST /classes/:classId/timetable */
export async function saveTimetable(
  actor: User,
  classId: string,
  slots: TimetableSlot[],
): Promise<Timetable> {
  assertRole(actor, 'coordinator', 'principal', 'branch_admin');
  const branchId = requireBranchId(actor);

  const cls = mockStore.classes.find((c) => c.id === classId && c.branchId === branchId);
  if (!cls) throw new ApiError('Class not found', 404);

  const index = mockStore.timetables.findIndex((t) => t.classId === classId && t.branchId === branchId);
  const date = new Date().toISOString().split('T')[0];

  const timetable: Timetable = {
    id: index >= 0 ? mockStore.timetables[index].id : nextTimetableId(),
    branchId,
    classId,
    className: cls.name,
    section: cls.section,
    slots: slots.map((s) => ({
      day: s.day,
      period: Number(s.period),
      subject: s.subject.trim(),
      teacherId: s.teacherId,
      teacherName: s.teacherName.trim(),
    })),
  };

  if (index >= 0) {
    mockStore.timetables[index] = timetable;
  } else {
    mockStore.timetables.push(timetable);
  }

  // Timetable Notifications for parents/students of this class
  const students = mockStore.users.filter((u) => u.role === 'student' && u.classId === classId);
  const parentIds = new Set(students.map((s) => s.parentId).filter(Boolean) as string[]);

  parentIds.forEach((pid) => {
    mockStore.notifications.push({
      id: nextNotificationId(),
      userId: pid,
      branchId,
      title: 'Timetable Updated',
      message: `The weekly timetable for ${cls.name} (${cls.section}) has been updated.`,
      createdAt: date,
      read: false,
    });
  });

  // Timetable Notifications for teachers in this timetable
  const teacherIds = new Set(slots.map((s) => s.teacherId).filter(Boolean));
  teacherIds.forEach((tid) => {
    mockStore.notifications.push({
      id: nextNotificationId(),
      userId: tid,
      branchId,
      title: 'Your Timetable Updated',
      message: `You have new slots scheduled in the weekly timetable of Class ${cls.name} (${cls.section}).`,
      createdAt: date,
      read: false,
    });
  });

  return mockRequest(timetable);
}
