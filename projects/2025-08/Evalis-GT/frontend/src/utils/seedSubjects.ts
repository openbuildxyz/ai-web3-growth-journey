import { createSubject } from '../api/subjectService';
import { SUBJECTS } from '../data/universityData';

/**
 * Seeds subjects from the hardcoded data into the database
 * Used to initialize the database with subject data
 */
export const seedSubjectsToDatabase = async () => {
  console.log('Seeding subjects to database...');
  
  try {
    const allSubjects = Object.entries(SUBJECTS).flatMap(([section, subjects]) => 
      subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        section,
        description: `${subject.name} course for ${section} students`,
        credits: 4
      }))
    );

    const results = await Promise.allSettled(
      allSubjects.map(subject => createSubject(subject))
    );

    const succeeded = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Subjects seeded: ${succeeded} succeeded, ${failed} failed`);
    
    // Return the results for inspection
    return {
      succeeded,
      failed,
      results
    };
  } catch (error) {
    console.error('Error seeding subjects:', error);
    throw error;
  }
};

export default seedSubjectsToDatabase; 