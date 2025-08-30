const { connectDB } = require('./server/config/db');
const { awardBadgeBasedRewards } = require('./server/web3/rewardsController');

async function testDirectBadgeAward() {
  try {
    await connectDB();
    
    // Create mock request and response objects
    const mockReq = {
      body: {
        submissionId: 6  // Abhay's submission with 98 score
      },
      user: {
        role: 'teacher',  // Required for authorization
        id: 'TEST_TEACHER'
      }
    };
    
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log(`Response Status: ${this.statusCode}`);
        console.log('Response Data:', JSON.stringify(data, null, 2));
        return this;
      }
    };
    
    console.log('Testing badge award for submission ID 6 (Abhay Charan, score: 98)');
    console.log('Expected tier: Platinum (90-94% = 75 EVLT + NFT Certificate)');
    console.log('---');
    
    await awardBadgeBasedRewards(mockReq, mockRes);
    
  } catch (error) {
    console.error('Error testing badge award:', error);
  }
  
  process.exit(0);
}

testDirectBadgeAward();
