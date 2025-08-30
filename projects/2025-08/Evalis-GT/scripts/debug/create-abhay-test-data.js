const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables
dotenv.config();

// Import database connection
const { connectDB, sequelize } = require('./server/config/db');
const { Student, Teacher, Batch, Semester, Subject, Assignment, Submission } = require('./server/models');

const createAbhayCharan = async () => {
  try {
    console.log('🔗 Connecting to database...'.yellow);
    await connectDB();
    
    console.log('📚 Creating test batch...'.cyan);
    const [batch, batchCreated] = await Batch.findOrCreate({
      where: { id: 'CS2024' },
      defaults: {
        id: 'CS2024',
        name: 'Computer Science 2024',
        startYear: 2024,
        endYear: 2028,
        department: 'Computer Science',
        active: true
      }
    });
    console.log(batchCreated ? '✅ Test batch created'.green : '✅ Test batch exists'.yellow);
    
    console.log('📅 Creating test semester...'.cyan);
    const [semester, semesterCreated] = await Semester.findOrCreate({
      where: { name: 'Semester 1 - 2024', batchId: batch.id },
      defaults: {
        name: 'Semester 1 - 2024',
        number: 1,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-31'),
        batchId: batch.id,
        active: true
      }
    });
    console.log(semesterCreated ? '✅ Test semester created'.green : '✅ Test semester exists'.yellow);
    
    console.log('👨‍🎓 Creating student: Abhay Charan...'.cyan);
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const [abhayStudent, studentCreated] = await Student.findOrCreate({
      where: { name: 'Abhay Charan' },
      defaults: {
        name: 'Abhay Charan',
        section: 'A',
        batch: batch.id,
        email: 'abhay.charan@university.edu',
        password: hashedPassword,
        role: 'student',
        activeSemesterId: semester.id,
        walletAddress: '0x1234567890123456789012345678901234567890' // Test wallet address
      }
    });
    console.log(studentCreated ? '✅ Abhay Charan created successfully!'.green : '✅ Abhay Charan already exists'.yellow);
    
    console.log('👨‍🏫 Creating test teacher...'.cyan);
    const [teacher, teacherCreated] = await Teacher.findOrCreate({
      where: { name: 'Professor Smith' },
      defaults: {
        name: 'Professor Smith',
        email: 'professor.smith@university.edu',
        password: await bcrypt.hash('teacherpassword123', 10),
        role: 'teacher',
        walletAddress: '0x9876543210987654321098765432109876543210'
      }
    });
    console.log(teacherCreated ? '✅ Test teacher created'.green : '✅ Test teacher exists'.yellow);
    
    console.log('📖 Creating test subject...'.cyan);
    const [subject, subjectCreated] = await Subject.findOrCreate({
      where: { name: 'Data Structures and Algorithms', section: 'A' },
      defaults: {
        name: 'Data Structures and Algorithms',
        section: 'A',
        description: 'Introduction to data structures and algorithms',
        credits: 4,
        semesterId: semester.id,
        batchId: batch.id
      }
    });
    console.log(subjectCreated ? '✅ Test subject created'.green : '✅ Test subject exists'.yellow);
    
    console.log('📝 Creating test assignment...'.cyan);
    const [assignment, assignmentCreated] = await Assignment.findOrCreate({
      where: { title: 'Binary Tree Implementation' },
      defaults: {
        title: 'Binary Tree Implementation',
        description: 'Implement a binary tree with insert, delete, and search operations',
        subjectId: subject.id,
        teacherId: teacher.id,
        examType: 'Assignment',
        dueDate: new Date('2024-12-15'),
        requiresFileUpload: false
      }
    });
    console.log(assignmentCreated ? '✅ Test assignment created'.green : '✅ Test assignment exists'.yellow);
    
    console.log('📋 Creating test submission for Abhay Charan...'.cyan);
    const [submission, submissionCreated] = await Submission.findOrCreate({
      where: { studentId: abhayStudent.id, assignmentId: assignment.id },
      defaults: {
        studentId: abhayStudent.id,
        subjectId: subject.id,
        assignmentId: assignment.id,
        examType: 'Assignment',
        submissionText: 'I have implemented a binary tree class with all required operations. The implementation uses recursive methods for insertion and search, and handles edge cases properly.',
        submissionDate: new Date(),
        score: null, // Will be graded later
        graded: false
      }
    });
    console.log(submissionCreated ? '✅ Test submission created'.green : '✅ Test submission exists'.yellow);
    
    console.log('\n🎉 Test Data Created Successfully!'.green.bold);
    console.log('=========================================='.green);
    console.log(`👨‍🎓 Student: ${abhayStudent.name} (ID: ${abhayStudent.id})`.cyan);
    console.log(`📧 Email: ${abhayStudent.email}`.cyan);
    console.log(`🔐 Password: testpassword123`.cyan);
    console.log(`💰 Wallet: ${abhayStudent.walletAddress}`.cyan);
    console.log(`👨‍🏫 Teacher: ${teacher.name} (ID: ${teacher.id})`.cyan);
    console.log(`📚 Subject: ${subject.name} (ID: ${subject.id})`.cyan);
    console.log(`📝 Assignment: ${assignment.title} (ID: ${assignment.id})`.cyan);
    console.log(`📋 Submission: ID ${submission.id} (Ready for grading)`.cyan);
    
    console.log('\n🎯 Next Steps:'.yellow.bold);
    console.log('1. Use the Teacher Portal to grade Abhay\'s submission'.yellow);
    console.log('2. Try different scores (75%, 85%, 92%) to test badge tiers'.yellow);
    console.log('3. Watch for automatic badge and token rewards'.yellow);
    console.log('4. Check the student portal for reward notifications'.yellow);
    
    console.log('\n🏆 Badge Tier Rewards:'.magenta.bold);
    console.log('• Bronze (75-79%): 20 EVLT tokens'.magenta);
    console.log('• Silver (80-84%): 30 EVLT tokens + NFT certificate'.magenta);
    console.log('• Gold (85-89%): 50 EVLT tokens + NFT certificate'.magenta);
    console.log('• Platinum (90-94%): 75 EVLT tokens + NFT certificate'.magenta);
    console.log('• Diamond (95-100%): 100 EVLT tokens + NFT certificate'.magenta);
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
};

// Run the script
createAbhayCharan().then(() => {
  console.log('\n🏁 Setup completed successfully!'.green.bold);
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Setup failed:', error);
  process.exit(1);
});
