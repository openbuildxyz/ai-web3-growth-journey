const { connectDB } = require('./server/config/db');
const { Submission, Student } = require('./server/models');

async function checkActualBadges() {
  try {
    await connectDB();
    
    // Get Abhay's graded submissions to see what badges he should have
    const submissions = await Submission.findAll({
      where: { 
        studentId: 'S0001',
        graded: true,
        score: { [require('sequelize').Op.gte]: 75 } // 75% or higher
      },
      include: [{ model: Student, as: 'Student' }]
    });
    
    console.log('Abhay\'s qualifying submissions for badges:');
    submissions.forEach(sub => {
      let badgeType = 'none';
      if (sub.score >= 95) badgeType = 'diamond';
      else if (sub.score >= 90) badgeType = 'platinum';
      else if (sub.score >= 85) badgeType = 'gold';
      else if (sub.score >= 80) badgeType = 'silver';
      else if (sub.score >= 75) badgeType = 'bronze';
      
      console.log(`- Submission ${sub.id}: ${sub.score}% -> ${badgeType} badge`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkActualBadges();
