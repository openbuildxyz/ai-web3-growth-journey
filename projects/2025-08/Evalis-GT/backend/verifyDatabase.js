const dotenv = require('dotenv');
const colors = require('colors');
const { connectDB, sequelize } = require('./config/db');

// Load environment variables
dotenv.config();

const verifyDatabase = async () => {
  try {
    console.log('🔍 Verifying database setup...'.cyan.bold);
    await connectDB();
    
    // Import models
    const { Batch, Semester, Admin, Student, Teacher, Subject } = require('./models');
    
    // Check batches
    const batchCount = await Batch.count();
    console.log(`📊 Batches: ${batchCount}`.green);
    
    // Check semesters
    const semesterCount = await Semester.count();
    console.log(`📊 Semesters: ${semesterCount}`.green);
    
    // Check admin
    const adminCount = await Admin.count();
    console.log(`👤 Admins: ${adminCount}`.green);
    
    // Check other tables
    const studentCount = await Student.count();
    const teacherCount = await Teacher.count();
    const subjectCount = await Subject.count();
    
    console.log(`👨‍🎓 Students: ${studentCount}`.green);
    console.log(`👨‍🏫 Teachers: ${teacherCount}`.green);
    console.log(`📚 Subjects: ${subjectCount}`.green);
    
    // List all batches with their semesters
    console.log('\n📋 Batch-Semester Structure:'.cyan.bold);
    const batches = await Batch.findAll({
      include: [{
        model: Semester,
        attributes: ['number', 'name', 'active']
      }]
    });
    
    batches.forEach(batch => {
      console.log(`\n🎓 ${batch.name} (${batch.id})`.yellow);
      batch.Semesters.forEach(semester => {
        const status = semester.active ? '✅' : '⏸️';
        console.log(`   ${status} ${semester.name}`.cyan);
      });
    });
    
    console.log('\n✅ Database verification completed!'.green.bold);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying database:'.red.bold);
    console.error(`${error.message}`.red);
    process.exit(1);
  }
};

verifyDatabase();
