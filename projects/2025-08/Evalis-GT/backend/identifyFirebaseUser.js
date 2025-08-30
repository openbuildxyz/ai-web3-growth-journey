const { Teacher, Student, Admin } = require('./models');
const { admin } = require('./utils/firebaseUtils');

async function identifyRemainingFirebaseUser() {
    console.log('🔍 Identifying Remaining Firebase User');
    console.log('==================================================');
    
    try {
        // Get all users from Firebase
        console.log('📋 Step 1: Getting Firebase users...');
        const firebaseUsers = [];
        let nextPageToken;
        
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            firebaseUsers.push(...listUsersResult.users);
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        
        console.log(`Found ${firebaseUsers.length} users in Firebase Authentication:`);
        
        for (const user of firebaseUsers) {
            console.log(`\n👤 Firebase User: ${user.email}`);
            console.log(`   UID: ${user.uid}`);
            console.log(`   Email Verified: ${user.emailVerified}`);
            console.log(`   Created: ${user.metadata.creationTime}`);
            console.log(`   Last Sign In: ${user.metadata.lastSignInTime || 'Never'}`);
            
            // Check if this user exists in any of our database tables
            console.log(`\n🔍 Checking if ${user.email} exists in database tables...`);
            
            // Check Teachers table
            const teacher = await Teacher.findOne({ 
                where: { email: user.email },
                attributes: ['id', 'name', 'email']
            });
            
            if (teacher) {
                console.log(`   ✅ Found in Teachers table: ID ${teacher.id}, Name: ${teacher.name}`);
            } else {
                console.log(`   ❌ Not found in Teachers table`);
            }
            
            // Check Students table
            const student = await Student.findOne({ 
                where: { email: user.email },
                attributes: ['id', 'name', 'email']
            });
            
            if (student) {
                console.log(`   ✅ Found in Students table: ID ${student.id}, Name: ${student.name}`);
            } else {
                console.log(`   ❌ Not found in Students table`);
            }
            
            // Check if Admin table exists and check it
            try {
                const admin = await Admin.findOne({ 
                    where: { email: user.email },
                    attributes: ['id', 'name', 'email']
                });
                
                if (admin) {
                    console.log(`   ✅ Found in Admin table: ID ${admin.id}, Name: ${admin.name}`);
                } else {
                    console.log(`   ❌ Not found in Admin table`);
                }
            } catch (error) {
                console.log(`   ⚠️  Admin table check failed (table might not exist): ${error.message}`);
            }
            
            // Determine what to do with this user
            if (!teacher && !student) {
                console.log(`\n⚠️  ORPHANED USER DETECTED!`);
                console.log(`   User ${user.email} exists in Firebase but not in any database table`);
                console.log(`   This user should probably be deleted from Firebase`);
                
                // Offer to delete this orphaned user
                console.log(`\n🗑️  Would you like to delete this orphaned user? Y/N`);
                console.log(`   Command to delete: node deleteOrphanedFirebaseUser.js ${user.email}`);
            } else {
                console.log(`\n✅ User ${user.email} is properly linked to database records`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error identifying Firebase user:', error);
    }
}

identifyRemainingFirebaseUser();
