const { connectDB } = require('./server/config/db');
const { Submission, Student } = require('./server/models');

async function testAbhayBronzeScenario() {
  try {
    await connectDB();
    
    // Find Abhay's ungraded submission (ID 7)
    const submission = await Submission.findByPk(7, {
      include: [{ model: Student, as: 'Student' }]
    });
    
    if (!submission) {
      console.log('Submission 7 not found');
      return;
    }
    
    console.log('Current submission state:', {
      id: submission.id,
      studentId: submission.studentId,
      score: submission.score,
      graded: submission.graded,
      studentName: submission.Student?.name,
      walletAddress: submission.Student?.walletAddress
    });
    
    // Update the submission to have a 78% score (Bronze tier)
    await submission.update({
      score: 78,
      graded: true,
      gradedBy: 'T001',  // Valid teacher ID
      gradedDate: new Date(),
      letterGrade: 'B-',
      gradePoints: 2.7
    });
    
    console.log('Updated submission to 78% (Bronze tier)');
    
    // Now test the badge awarding
    const { awardBadgeBasedRewards } = require('./server/web3/rewardsController');
    
    const mockReq = {
      body: {
        submissionId: 7
      },
      user: {
        role: 'teacher',
        id: 'TEST_TEACHER'
      }
    };
    
    const mockRes = {
      statusCode: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log(`\nResponse Status: ${this.statusCode}`);
        console.log('Response Data:', JSON.stringify(data, null, 2));
        return this;
      }
    };
    
    console.log('\n--- Testing Bronze badge award for 78% score ---');
    await awardBadgeBasedRewards(mockReq, mockRes);
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

testAbhayBronzeScenario();
