const { Student, Submission } = require('./server/models');
const { connectDB } = require('./server/config/db');

async function findAbhaySubmission() {
  try {
    await connectDB();
    
    // Find Abhay
    const abhay = await Student.findOne({
      where: { name: 'Abhay Charan' }
    });
    
    if (!abhay) {
      console.log('Abhay Charan not found');
      return;
    }
    
    console.log('Found Abhay:', {
      id: abhay.id,
      name: abhay.name,
      walletAddress: abhay.walletAddress
    });
    
    // Find his submissions
    const submissions = await Submission.findAll({
      where: { studentId: abhay.id },
      include: [{ model: Student, as: 'Student' }]
    });
    
    console.log('Abhay\'s submissions:');
    submissions.forEach(sub => {
      console.log(`- ID: ${sub.id}, Score: ${sub.score}, Graded: ${sub.graded}, Subject: ${sub.subjectId}`);
    });
    
    if (submissions.length > 0) {
      const firstSub = submissions[0];
      console.log('\nFirst submission details:', {
        id: firstSub.id,
        studentId: firstSub.studentId,
        score: firstSub.score,
        graded: firstSub.graded,
        hasStudentData: !!firstSub.Student,
        studentWallet: firstSub.Student?.walletAddress
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

findAbhaySubmission();
