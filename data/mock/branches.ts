import type { Branch } from '@/types';

/** Mock Firebase `branches` collection */
export const mockBranches: Branch[] = [
  {
    id: 'branch-main',
    name: 'Main Campus',
    code: 'MAIN',
    address: 'Chennai — HQ',
    active: true,
    settings: {
      academicYear: '2026–27',
      currentTermLabel: 'Term 2',
      timezone: 'Asia/Kolkata',
    },
  },
  {
    id: 'branch-north',
    name: 'North Campus',
    code: 'NORTH',
    address: 'Tambaram',
    active: true,
    settings: {
      academicYear: '2026–27',
      currentTermLabel: 'Term 1',
      timezone: 'Asia/Kolkata',
    },
  },
];
