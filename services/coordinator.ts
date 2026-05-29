import { mockRequest } from '@/services/api/client';
import type { User } from '@/types';
import type { CoordinatorApprovalRequest, CoordinatorCircularReview, CoordinatorDiaryEntry } from '@/types';

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
