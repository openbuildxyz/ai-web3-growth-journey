// Grade Scale System and CGPA Calculator

export interface GradeScale {
  min: number;
  max: number;
  grade: string;
  gradePoint: number;
}

// Standard grading scale as per university requirements
export const GRADE_SCALE: GradeScale[] = [
  { min: 100, max: 100, grade: 'O', gradePoint: 10.0 },
  { min: 90, max: 99, grade: 'A+', gradePoint: 9.0 },
  { min: 81, max: 89, grade: 'A', gradePoint: 8.0 },
  { min: 77, max: 80, grade: 'B+', gradePoint: 7.0 },
  { min: 66, max: 76, grade: 'B', gradePoint: 6.0 },
  { min: 55, max: 65, grade: 'C+', gradePoint: 5.0 },
  { min: 45, max: 54, grade: 'C', gradePoint: 4.0 },
  { min: 33, max: 44, grade: 'D', gradePoint: 3.0 },
  { min: 0, max: 32, grade: 'F', gradePoint: 0.0 }
];

// Assignment types that contribute to CGPA
export const CGPA_CONTRIBUTING_TYPES = ['mid-sem', 'end-sem'];

/**
 * Convert numeric score to letter grade
 */
export const getLetterGrade = (score: number): string => {
  const grade = GRADE_SCALE.find(scale => score >= scale.min && score <= scale.max);
  return grade ? grade.grade : 'F';
};

/**
 * Convert numeric score to grade points
 */
export const getGradePoints = (score: number): number => {
  const grade = GRADE_SCALE.find(scale => score >= scale.min && score <= scale.max);
  return grade ? grade.gradePoint : 0.0;
};

/**
 * Get grade info (letter + points)
 */
export const getGradeInfo = (score: number) => {
  const gradeScale = GRADE_SCALE.find(scale => score >= scale.min && score <= scale.max);
  return gradeScale ? {
    letter: gradeScale.grade,
    points: gradeScale.gradePoint,
    score
  } : {
    letter: 'F',
    points: 0.0,
    score
  };
};

/**
 * Calculate CGPA based on submissions
 * Only considers mid-sem and end-sem assignments
 */
export const calculateCGPA = (submissions: any[]): number => {
  // Filter only CGPA contributing assignments
  const cgpaSubmissions = submissions.filter(sub => 
    sub.graded && 
    sub.score !== null && 
    CGPA_CONTRIBUTING_TYPES.includes(sub.examType?.toLowerCase())
  );

  if (cgpaSubmissions.length === 0) return 0.0;

  // Calculate weighted average of grade points
  const totalGradePoints = cgpaSubmissions.reduce((sum, sub) => {
    const gradePoints = getGradePoints(sub.score);
    // Assuming each subject has equal weight for now
    // In future, we can add subject credits for weighted calculation
    return sum + gradePoints;
  }, 0);

  const cgpa = totalGradePoints / cgpaSubmissions.length;
  return Math.round(cgpa * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate semester GPA for specific semester
 */
export const calculateSemesterGPA = (submissions: any[], semesterId?: string): number => {
  // Filter submissions for specific semester and CGPA contributing types
  const semesterSubmissions = submissions.filter(sub => 
    sub.graded && 
    sub.score !== null && 
    CGPA_CONTRIBUTING_TYPES.includes(sub.examType?.toLowerCase()) &&
    (!semesterId || sub.Subject?.semesterId === semesterId)
  );

  if (semesterSubmissions.length === 0) return 0.0;

  const totalGradePoints = semesterSubmissions.reduce((sum, sub) => {
    return sum + getGradePoints(sub.score);
  }, 0);

  const gpa = totalGradePoints / semesterSubmissions.length;
  return Math.round(gpa * 100) / 100;
};

/**
 * Get grade distribution for analytics
 */
export const getGradeDistribution = (submissions: any[]) => {
  const distribution = GRADE_SCALE.map(scale => ({
    grade: scale.grade,
    count: 0,
    percentage: 0
  }));

  const gradedSubmissions = submissions.filter(sub => sub.graded && sub.score !== null);
  
  gradedSubmissions.forEach(sub => {
    const letterGrade = getLetterGrade(sub.score);
    const gradeEntry = distribution.find(d => d.grade === letterGrade);
    if (gradeEntry) gradeEntry.count++;
  });

  // Calculate percentages
  const total = gradedSubmissions.length;
  distribution.forEach(d => {
    d.percentage = total > 0 ? Math.round((d.count / total) * 100) : 0;
  });

  return distribution;
};
