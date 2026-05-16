import type { FeeStatus } from '@/types';

const secondaryFees = [
  { label: 'Tuition', amount: 45000 },
  { label: 'Lab Fee', amount: 5000 },
  { label: 'Library', amount: 2000 },
];

const primaryFees = [
  { label: 'Tuition', amount: 28000 },
  { label: 'Activity', amount: 3000 },
];

const higherFees = [
  { label: 'Tuition', amount: 55000 },
  { label: 'Lab Fee', amount: 8000 },
  { label: 'Exam Fee', amount: 4000 },
];

const B = 'branch-main';

/** Mock Firebase `fees` collection */
export const mockFeeStatuses: FeeStatus[] = [
  {
    id: 'fee-1',
    branchId: B,
    studentId: 'student-1',
    classId: 'class-cs-10a',
    totalAmount: 52000,
    paidAmount: 52000,
    dueAmount: 0,
    status: 'paid',
    lastPaymentDate: '2026-04-10',
    feeStructure: secondaryFees,
  },
  {
    id: 'fee-2',
    branchId: B,
    studentId: 'student-2',
    classId: 'class-cs-10a',
    totalAmount: 52000,
    paidAmount: 30000,
    dueAmount: 22000,
    status: 'partial',
    lastPaymentDate: '2026-03-15',
    feeStructure: secondaryFees,
  },
  {
    id: 'fee-3',
    branchId: B,
    studentId: 'student-3',
    classId: 'class-cs-10a',
    totalAmount: 52000,
    paidAmount: 0,
    dueAmount: 52000,
    status: 'pending',
    feeStructure: secondaryFees,
  },
  {
    id: 'fee-4',
    branchId: B,
    studentId: 'student-4',
    classId: 'class-cs-10a',
    totalAmount: 52000,
    paidAmount: 52000,
    dueAmount: 0,
    status: 'paid',
    lastPaymentDate: '2026-04-22',
    feeStructure: secondaryFees,
  },
  {
    id: 'fee-5',
    branchId: B,
    studentId: 'student-5',
    classId: 'class-math-3b',
    totalAmount: 31000,
    paidAmount: 31000,
    dueAmount: 0,
    status: 'paid',
    lastPaymentDate: '2026-04-01',
    feeStructure: primaryFees,
  },
  {
    id: 'fee-6',
    branchId: B,
    studentId: 'student-6',
    classId: 'class-math-3b',
    totalAmount: 31000,
    paidAmount: 15000,
    dueAmount: 16000,
    status: 'partial',
    lastPaymentDate: '2026-02-20',
    feeStructure: primaryFees,
  },
  {
    id: 'fee-7',
    branchId: B,
    studentId: 'student-7',
    classId: 'class-sci-12a',
    totalAmount: 67000,
    paidAmount: 67000,
    dueAmount: 0,
    status: 'paid',
    lastPaymentDate: '2026-04-05',
    feeStructure: higherFees,
  },
  {
    id: 'fee-8',
    branchId: B,
    studentId: 'student-8',
    classId: 'class-sci-12a',
    totalAmount: 67000,
    paidAmount: 20000,
    dueAmount: 47000,
    status: 'partial',
    lastPaymentDate: '2026-01-12',
    feeStructure: higherFees,
  },
];
