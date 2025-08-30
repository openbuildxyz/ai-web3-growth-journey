/**
 * Returns a color based on the grade score
 */
export const getGradeColor = (score: number): string => {
  if (score >= 90) return '#4caf50'; // Green - A grade
  if (score >= 80) return '#8bc34a'; // Light Green - B grade
  if (score >= 70) return '#ffeb3b'; // Yellow - C grade
  if (score >= 60) return '#ff9800'; // Orange - D grade
  return '#f44336'; // Red - F grade
}; 