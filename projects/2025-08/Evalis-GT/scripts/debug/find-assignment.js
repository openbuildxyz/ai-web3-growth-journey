const { connectDB } = require('./server/config/db');
const { Assignment } = require('./server/models');

async function findAssignment() {
  try {
    await connectDB();
    
    const assignments = await Assignment.findAll({
      limit: 1
    });
    
    if (assignments.length > 0) {
      console.log('Found assignment:', {
        id: assignments[0].id,
        title: assignments[0].title,
        subjectId: assignments[0].subjectId
      });
    } else {
      console.log('No assignments found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

findAssignment();
