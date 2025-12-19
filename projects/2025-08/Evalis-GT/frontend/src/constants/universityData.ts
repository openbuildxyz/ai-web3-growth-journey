import { Teacher } from '../types/university';
import { SUBJECTS, EXAM_TYPES, GRADE_SCALE } from '../data/universityData';

// Re-export for backwards compatibility
export { SUBJECTS, EXAM_TYPES, GRADE_SCALE };

// Backward compatibility for components that expect BATCHES
// Students are now fetched dynamically from the database
export const BATCHES: any = {
  '2023': {
    students: [], // Fetch from API using getStudentsByBatch
    subjects: [...SUBJECTS['CSE-1'], ...SUBJECTS['CSE-2']]
  },
  '2024': {
    subjects: [
      { code: 'CSE102', name: 'Object Oriented Programming' },
      { code: 'CSE202', name: 'Algorithm Design' },
      { code: 'CSE302', name: 'Operating Systems' },
      { code: 'CSE402', name: 'Web Technologies' },
      { code: 'CSE502', name: 'Machine Learning' },
    ],
    students: [], // Fetch from API using getStudentsByBatch
  },
};

export const TEACHERS: Teacher[] = [
  {
    id: 'T001',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@bennett.edu.in',
    subjects: ['CSE101', 'CSE102'],
  },
  {
    id: 'T002',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@bennett.edu.in',
    subjects: ['CSE201', 'CSE202'],
  },
  {
    id: 'T003',
    name: 'Dr. Amit Verma',
    email: 'amit.verma@bennett.edu.in',
    subjects: ['CSE301', 'CSE302'],
  },
  {
    id: 'T004',
    name: 'Dr. Sunita Patel',
    email: 'sunita.patel@bennett.edu.in',
    subjects: ['CSE401', 'CSE402'],
  },
  {
    id: 'T005',
    name: 'Dr. Vikram Singh',
    email: 'vikram.singh@bennett.edu.in',
    subjects: ['CSE501', 'CSE502'],
  },
]; 