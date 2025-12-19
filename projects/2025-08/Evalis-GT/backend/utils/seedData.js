const { Batch, Semester } = require('../models');
const asyncHandler = require('express-async-handler');

/**
 * Creates semesters 1-8 for a given batch
 * @param {string} batchId - The ID of the batch to create semesters for
 */
const createSemestersForBatch = async (batchId) => {
  try {
    // First, check if the batch exists
    const batch = await Batch.findByPk(batchId);
    if (!batch) {
      console.error(`Batch with ID ${batchId} not found`);
      return { success: false, message: `Batch with ID ${batchId} not found` };
    }
    
    console.log(`Creating semesters for batch: ${batch.name} (${batchId})`);
    
    // Get existing semesters for this batch to avoid duplicates
    const existingSemesters = await Semester.findAll({
      where: { batchId }
    });
    
    const existingSemesterNumbers = existingSemesters.map(sem => sem.number);
    console.log(`Existing semester numbers: ${existingSemesterNumbers.join(', ') || 'none'}`);
    
    // Create each semester from 1 to 8 if it doesn't already exist
    const createdSemesters = [];
    const startYear = parseInt(batch.startYear);
    
    for (let i = 1; i <= 8; i++) {
      if (existingSemesterNumbers.includes(i)) {
        console.log(`Semester ${i} already exists for batch ${batchId}, skipping`);
        continue;
      }
      
      // Calculate academic year based on semester number
      // Semesters 1-2: Year 1, 3-4: Year 2, 5-6: Year 3, 7-8: Year 4
      const academicYear = Math.ceil(i / 2);
      const year = startYear + academicYear - 1;
      
      // For odd semesters (1,3,5,7) use Jul-Dec, for even (2,4,6,8) use Jan-Jun
      const isOddSemester = i % 2 === 1;
      const startMonth = isOddSemester ? 7 : 1; // July or January
      const endMonth = isOddSemester ? 12 : 6;  // December or June
      
      const startDate = new Date(year, startMonth - 1, 1); // Month is 0-indexed
      const endDate = new Date(year, endMonth - 1, isOddSemester ? 31 : 30); // Last day of month
      
      // Generate semester name (e.g., "Semester 1 (Fall 2023)")
      const semesterType = isOddSemester ? 'Fall' : 'Spring';
      const semesterYear = isOddSemester ? year : year;
      const name = `Semester ${i} (${semesterType} ${semesterYear})`;
      
      // Generate semester ID
      const semesterId = await Semester.generateSemesterId(batchId, i);
      
      // Set active status (only the current or upcoming semester should be active)
      const now = new Date();
      const isActive = now >= startDate && now <= endDate; // Active if current date falls within semester
      
      // Create the semester
      const semester = await Semester.create({
        id: semesterId,
        name,
        number: i,
        startDate,
        endDate,
        active: isActive,
        batchId
      });
      
      console.log(`Created semester: ${semester.name} (${semester.id}), active: ${semester.active}`);
      createdSemesters.push(semester);
    }
    
    return { 
      success: true, 
      created: createdSemesters.length,
      total: createdSemesters.length + existingSemesters.length,
      semesters: createdSemesters.map(sem => ({
        id: sem.id,
        name: sem.name,
        number: sem.number,
        active: sem.active
      }))
    };
  } catch (error) {
    console.error('Error creating semesters:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Creates semesters for all batches
 */
const createSemestersForAllBatches = async () => {
  try {
    const batches = await Batch.findAll();
    
    if (batches.length === 0) {
      return { success: false, message: 'No batches found' };
    }
    
    console.log(`Found ${batches.length} batches`);
    
    const results = [];
    for (const batch of batches) {
      const result = await createSemestersForBatch(batch.id);
      results.push({
        batchId: batch.id,
        batchName: batch.name,
        ...result
      });
    }
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Error creating semesters for all batches:', error);
    return { success: false, message: error.message };
  }
};

// Export the functions for external use
module.exports = {
  createSemestersForBatch,
  createSemestersForAllBatches
}; 