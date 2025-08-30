require('dotenv').config();
const { Student, Subject, Batch } = require('../server/models');

async function checkDatabase() {
    console.log('🔍 Checking Database for Students and Subjects');
    console.log('================================================');
    
    try {
        // Get all students
        const students = await Student.findAll({
            attributes: ['id', 'name', 'email', 'batch', 'activeSemesterId'],
            include: [{
                model: Batch,
                attributes: ['id', 'name'],
                required: false
            }]
        });
        
        console.log(`\n📋 Found ${students.length} students:`);
        students.forEach(student => {
            console.log(`  - ${student.id}: ${student.name} (${student.email}) - Batch: ${student.batch} - Active Semester: ${student.activeSemesterId}`);
        });
        
        // Get all subjects  
        const subjects = await Subject.findAll({
            attributes: ['id', 'name', 'batchId', 'semesterId']
        });
        
        console.log(`\n📚 Found ${subjects.length} subjects:`);
        subjects.forEach(subject => {
            console.log(`  - ${subject.id}: ${subject.name} - Batch: ${subject.batchId} - Semester: ${subject.semesterId}`);
        });
        
        // Check for subjects for each student's batch
        console.log('\n🔍 Checking subjects for each student batch:');
        for (const student of students) {
            const studentSubjects = await Subject.findAll({
                where: { batchId: student.batch }
            });
            console.log(`  - Student ${student.id} (batch ${student.batch}): ${studentSubjects.length} subjects`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

checkDatabase();
