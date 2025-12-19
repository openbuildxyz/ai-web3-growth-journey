const { deleteFirebaseUserByEmail } = require('./utils/firebaseUtils');

async function deleteOrphanedFirebaseUser() {
    const email = process.argv[2];
    
    if (!email) {
        console.log('Usage: node deleteOrphanedFirebaseUser.js <email>');
        console.log('Example: node deleteOrphanedFirebaseUser.js anantmishra249@gmail.com');
        process.exit(1);
    }
    
    console.log(`🗑️  Deleting Orphaned Firebase User: ${email}`);
    console.log('==================================================');
    
    try {
        console.log(`⚠️  WARNING: About to delete Firebase user: ${email}`);
        console.log('   This user exists in Firebase but not in any database table');
        console.log('   This action cannot be undone!');
        
        // Perform the deletion
        console.log('\n🔥 Proceeding with deletion...');
        const result = await deleteFirebaseUserByEmail(email);
        
        if (result.success) {
            console.log('\n✅ SUCCESS: Orphaned Firebase user deleted!');
            console.log(`   ${result.message}`);
            console.log(`   ${result.details}`);
            console.log('\n🎉 Firebase Authentication is now clean!');
            console.log('   All Firebase users now correspond to valid database records');
        } else {
            console.log('\n❌ FAILED: Could not delete orphaned user');
            console.log(`   Error: ${result.error}`);
            console.log(`   Details: ${result.details}`);
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

deleteOrphanedFirebaseUser();
