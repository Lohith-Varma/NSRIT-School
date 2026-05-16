import type { Class } from '@/types';

/** Mock Firebase `classes` collection */
export const mockClasses: Class[] = [
  {
    id: 'class-cs-10a',
    branchId: 'branch-main',
    name: 'Computer Science',
    section: 'A',
    grade: '10',
    wing: 'secondary',
    subject: 'Computer Science',
    teacherId: 'teacher-1',
    studentIds: ['student-1', 'student-2', 'student-3', 'student-4'],
  },
  {
    id: 'class-math-3b',
    branchId: 'branch-main',
    name: 'Mathematics',
    section: 'B',
    grade: '3',
    wing: 'primary',
    subject: 'Mathematics',
    teacherId: 'teacher-2',
    studentIds: ['student-5', 'student-6'],
  },
  {
    id: 'class-sci-12a',
    branchId: 'branch-main',
    name: 'Science Stream',
    section: 'A',
    grade: '12',
    wing: 'higher_secondary',
    subject: 'Physics',
    teacherId: 'teacher-3',
    studentIds: ['student-7', 'student-8'],
  },
];
