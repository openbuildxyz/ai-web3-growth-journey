require('dotenv').config();
const { Student, Subject } = require('./models');
const { Op } = require('sequelize');

async function testSubjectQuery() {
    console.log('🔍 Testing Subject Query Logic');
    console.log('==============================');
    
    try {
        // Get student S0001
        const student = await Student.findByPk('S0001');
        console.log(`📋 Student: ${student.id} - Batch: ${student.batch} - Active Semester: ${student.activeSemesterId}`);
        
        // OLD query (current broken one)
        console.log('\n❌ OLD Query (broken):');
        const oldWhereClause = { batchId: student.batch };
        const oldSubjects = await Subject.findAll({ where: oldWhereClause });
        console.log(`Found ${oldSubjects.length} subjects with old query`);
        
        // NEW query (fixed)
        console.log('\n✅ NEW Query (fixed):');
        const newWhereClause = {
            [Op.or]: [
                { batchId: student.batch },
                { batchId: null }
            ]
        };
        const newSubjects = await Subject.findAll({ where: newWhereClause });
        console.log(`Found ${newSubjects.length} subjects with new query`);
        
        // Show the subjects
        console.log('\n📚 Subjects found with NEW query:');
        newSubjects.forEach(subject => {
            console.log(`  - ${subject.id}: ${subject.name} (batch: ${subject.batchId || 'null'})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

testSubjectQuery();
