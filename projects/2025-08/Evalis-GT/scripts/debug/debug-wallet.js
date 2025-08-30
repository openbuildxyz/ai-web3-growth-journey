const { Student } = require('./server/models');
const { connectDB } = require('./server/config/db');

async function checkAbhayWallet() {
  try {
    await connectDB();
    
    const abhay = await Student.findOne({
      where: { name: 'Abhay Charan' }
    });
    
    if (abhay) {
      console.log('Abhay Charan wallet info:');
      console.log('- ID:', abhay.id);
      console.log('- Name:', abhay.name);
      console.log('- Wallet Address:', abhay.walletAddress);
      console.log('- Wallet Type:', typeof abhay.walletAddress);
      console.log('- Wallet Length:', abhay.walletAddress?.length);
      console.log('- Is Truthy:', !!abhay.walletAddress);
      console.log('- Trimmed:', abhay.walletAddress?.trim());
      console.log('- Equals null string:', abhay.walletAddress === 'null');
      console.log('- Equals undefined string:', abhay.walletAddress === 'undefined');
    } else {
      console.log('Abhay Charan not found in database');
      
      // Check all students
      const allStudents = await Student.findAll();
      console.log('All students:');
      allStudents.forEach(student => {
        console.log(`- ${student.name}: ${student.walletAddress}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkAbhayWallet();
