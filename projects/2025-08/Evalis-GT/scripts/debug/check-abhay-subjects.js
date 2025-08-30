const { Student, Subject, Assignment, Submission, Batch } = require('./server/models');
const { connectDB } = require('./server/config/db');

async function checkAbhaySubjects() {
    try {
        await connectDB();
        console.log('🔍 Checking Abhay\'s subject enrollment...\n');

        // First, find Abhay's student record using simple where clause
        const abhay = await Student.findOne({
            where: { 
                name: 'Abhay Charan'
            }
        });
        
        if (!abhay) {
            console.log('❌ No student found with name "Abhay Charan"');
            
            // Let's check all students to see available options
            const allStudents = await Student.findAll({
                order: [['name', 'ASC']]
            });
            
            console.log('\n📋 Available students:');
            allStudents.forEach(student => {
                console.log(`- ID: ${student.id}, Name: ${student.name}, Email: ${student.email}`);
            });
            return;
        }

        console.log(`✅ Found student: ${abhay.name} (${abhay.email})`);
        console.log(`   Student ID: ${abhay.id}`);
        console.log(`   Batch: ${abhay.batch}`);
        console.log(`   Section: ${abhay.section}\n`);

        // Check subjects associated with this batch
        const subjects = await Subject.findAll({
            where: { 
                batchId: abhay.batch // Using batch field from student
            }
        });
        
        if (subjects.length === 0) {
            console.log(`❌ No subjects found for batch: ${abhay.batch}`);
            
            // Check all subjects to see what's available
            const allSubjects = await Subject.findAll();
            console.log('\n📋 All available subjects:');
            allSubjects.forEach(subject => {
                console.log(`- ${subject.name} (${subject.code}) - Batch: ${subject.batchId}`);
            });
            return;
        }

        console.log(`📚 Abhay is enrolled in ${subjects.length} subjects:\n`);
        
        subjects.forEach((subject, index) => {
            console.log(`${index + 1}. ${subject.name} (${subject.code})`);
            console.log(`   Credits: ${subject.credits}`);
            console.log(`   Description: ${subject.description}`);
            console.log(`   Subject ID: ${subject.id}\n`);
        });

        // Also check for any assignments in these subjects
        console.log('📝 Checking assignments in these subjects...\n');
        
        for (const subject of subjects) {
            const assignments = await Assignment.findAll({
                where: { subjectId: subject.id },
                order: [['createdAt', 'DESC']]
            });
            
            if (assignments.length > 0) {
                console.log(`   📋 ${subject.name} has ${assignments.length} assignments:`);
                assignments.forEach(assignment => {
                    console.log(`     - ${assignment.title}`);
                    console.log(`       Due: ${assignment.dueDate}, Max Score: ${assignment.maxScore}`);
                });
            } else {
                console.log(`   📋 ${subject.name} has no assignments yet`);
            }
            console.log('');
        }

        // Check submissions by Abhay
        console.log('📤 Checking Abhay\'s submissions...\n');
        
        const submissions = await Submission.findAll({
            where: { studentId: abhay.id },
            order: [['submissionDate', 'DESC']]
        });
        
        if (submissions.length > 0) {
            console.log(`✅ Found ${submissions.length} submissions by Abhay:`);
            
            for (const submission of submissions) {
                // Get assignment details
                const assignment = await Assignment.findByPk(submission.assignmentId);
                const subject = await Subject.findByPk(submission.subjectId);
                
                console.log(`   - Assignment: ${assignment?.title || 'Unknown'} (${subject?.name || 'Unknown Subject'})`);
                console.log(`     Score: ${submission.score || 'Not graded'}, Graded: ${submission.graded}`);
                console.log(`     Submitted: ${submission.submissionDate}\n`);
            }
        } else {
            console.log('❌ No submissions found for Abhay');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkAbhaySubjects();
