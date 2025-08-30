const { connectDB } = require('./server/config/db');
const { Submission, Student, Assignment } = require('./server/models');

async function testActualGrading() {
  try {
    await connectDB();
    
    // Let's use the existing ungraded submission (ID 7) and reset it first
    const submission = await Submission.findByPk(7, {
      include: [{ model: Student, as: 'Student' }]
    });
    
    if (!submission) {
      console.log('Submission 7 not found');
      return;
    }
    
    // Reset submission to ungraded state
    await submission.update({
      score: null,
      graded: false,
      gradedBy: null,
      gradedDate: null,
      letterGrade: null,
      gradePoints: null,
      feedback: null
    });
    
    console.log('Reset and using submission:', {
      id: submission.id,
      studentId: submission.studentId,
      score: submission.score,
      graded: submission.graded,
      studentName: submission.Student?.name
    });
    
    // Now test the actual grading controller function
    const submissionController = require('./server/controllers/submissionController');
    
    // Create mock req/res objects like the real API would
    const mockReq = {
      params: { id: submission.id },
      body: { score: 78, feedback: 'Good work! Keep it up.' },
      user: { id: 'T001', role: 'teacher' }
    };
    
    const mockRes = {
      statusCode: null,
      responseData: null,
      status: function(code) { 
        this.statusCode = code; 
        return this; 
      },
      json: function(data) { 
        this.responseData = data;
        console.log(`\nGrading Response Status: ${this.statusCode}`);
        console.log('Grading Response Data:', JSON.stringify(data, null, 2));
        return this; 
      }
    };
    
    console.log('\n--- Testing actual grading process with 78% score ---');
    
    // Call the actual grading function (updateSubmission)
    await submissionController.updateSubmission(mockReq, mockRes);
    
  } catch (error) {
    console.error('Error testing actual grading:', error);
  }
  
  process.exit(0);
}

testActualGrading();
