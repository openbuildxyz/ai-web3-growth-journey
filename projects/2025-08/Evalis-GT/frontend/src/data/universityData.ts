import type { Subject, GradeScale, ExamType } from '../types/university';

export const BATCHES = [
  { id: '2023-2027', name: 'BTech 2023-2027' },
  { id: '2022-2026', name: 'BTech 2022-2026' },
  { id: '2021-2025', name: 'BTech 2021-2025' },
  { id: '2020-2024', name: 'BTech 2020-2024' }
];

// Students are now managed through the database
// Use the API endpoints to fetch student data dynamically

export const SUBJECTS: Record<string, Subject[]> = {
  'CSE-1': [
    { id: 'CSE101', name: 'Introduction to Programming' },
    { id: 'CSE102', name: 'Data Structures' },
    { id: 'CSE103', name: 'Database Management Systems' },
    { id: 'CSE104', name: 'Computer Networks' }
  ],
  'CSE-2': [
    { id: 'CSE201', name: 'Object Oriented Programming' },
    { id: 'CSE202', name: 'Operating Systems' },
    { id: 'CSE203', name: 'Software Engineering' },
    { id: 'CSE204', name: 'Web Development' }
  ]
};

export const EXAM_TYPES: ExamType[] = [
  { id: 'mid-sem', name: 'Mid Semester' },
  { id: 'end-sem', name: 'End Semester' },
  { id: 'assignment', name: 'Assignment' },
  { id: 'project', name: 'Project' }
];

// Student submissions are now managed through the database
// Use the API endpoints to fetch submission data dynamically

export const GRADE_SCALE: GradeScale = {
  'A+': { min: 90, max: 100, points: 10 },
  'A': { min: 80, max: 89, points: 9 },
  'B+': { min: 70, max: 79, points: 8 },
  'B': { min: 60, max: 69, points: 7 },
  'C+': { min: 50, max: 59, points: 6 },
  'C': { min: 40, max: 49, points: 5 },
  'F': { min: 0, max: 39, points: 0 }
}; 