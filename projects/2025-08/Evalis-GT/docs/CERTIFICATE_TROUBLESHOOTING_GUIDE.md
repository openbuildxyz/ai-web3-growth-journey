# 🎓 NFT Certificate Troubleshooting Guide

## Issue: "No Certificates Yet" showing in Student Portal

### 📊 Current Status
✅ **Certificate System Implemented**: Complete NFT certificate system with automatic and manual awarding  
✅ **API Endpoints Working**: `/api/web3/student/:id/certificates` endpoint available  
✅ **Frontend Components Ready**: `StudentWeb3Rewards.tsx` properly fetches and displays certificates  
✅ **Debugging Added**: Console logs and debug info panel added to identify issues  

### 🔍 Root Cause Analysis
The "No Certificates Yet" message appears because **no certificates have been awarded yet**. The system is working correctly but waiting for certificates to be created.

### 🚀 Steps to Test Certificate System

#### Step 1: Start Development Environment
```bash
cd /Users/anantmishra/Documents/Github/Evalis-GT
npm run dev
# Server should start on http://localhost:3000
```

#### Step 2: Set Up Test Teacher
1. 🌐 Navigate to **http://localhost:3000/teacher/login**
2. 👨‍🏫 Login or create teacher account
3. 📝 Go to **Teacher Portal > Assignments tab**
4. ➕ **Create a new assignment**:
   - Title: "Mathematics Test"
   - Subject: Mathematics  
   - Description: "Basic math assessment"
   - Upload question paper (optional)

#### Step 3: Set Up Test Student
1. 🌐 Navigate to **http://localhost:3000/student/login**
2. 👨‍🎓 Login or create student account
3. 🔗 **Connect MetaMask wallet**:
   - Use Sepolia testnet
   - Sample address: `0x742d35Cc6634C0532925a3b8D9D96d8c4b7B45e1`
4. 📤 **Submit assignment**:
   - Find the created assignment
   - Submit text response: "Detailed mathematical solutions..."
   - Upload file if required

#### Step 4: Grade Submission (Trigger Certificate)
1. 👨‍🏫 **Return to Teacher Portal**
2. 🎯 **Go to Grading tab**
3. 📊 **Grade the submission**:
   - **Enter grade: 85%** (Gold tier - triggers auto-certificate)
   - Add feedback: "Excellent work!"
   - **Click "Submit Grade"**
   - Should see **"Badge + NFT"** indicator
   - Look for success message with transaction hash

#### Step 5: Verify Certificate Display
1. 👨‍🎓 **Return to Student Portal**
2. 🔍 **Check browser console** (F12 > Console):
   - Look for certificate fetch logs
   - Should see: `✅ Certificates state updated: 1 certificates found`
3. 📺 **Check NFT Achievement Certificates section**:
   - Should display the awarded certificate
   - Debug panel shows certificate count > 0

### 🐛 Debugging Checklist

#### Browser Console (F12 > Console)
Look for these debug messages:
```
🔍 StudentWeb3Rewards: Loading rewards data...
📋 getMyCertificates: Fetching certificates for student ID: 123
✅ getMyCertificates: API response received: [certificate_data]
📊 Rewards data loaded: - Certificates: [certificate_data]
✅ Certificates state updated: 1 certificates found
```

#### Browser Network Tab (F12 > Network)
Check for API calls:
- ✅ `GET /api/web3/student/:id/certificates` (Status: 200)
- ❌ Failed calls show authentication or server issues

#### Debug Panel in Student Portal
The certificate section now shows:
- Certificates found: 0/1/2...
- Loading: true/false
- Error: none/error_message
- Wallet linked: yes/no
- 🔄 Refresh button to retry

### 📱 Common Issues & Solutions

#### 1. "User not logged in" Error
**Problem**: Student authentication failed  
**Solution**: 
- Clear browser localStorage
- Re-login to student portal
- Check browser cookies enabled

#### 2. "Failed to get certificates" Network Error
**Problem**: API call failing  
**Solution**:
- Verify server is running (`npm run dev`)
- Check Network tab for 401/403/500 errors
- Verify API endpoint in `config/environment.ts`

#### 3. Wallet Not Connected
**Problem**: Student wallet not linked  
**Solution**:
- Connect MetaMask to Sepolia testnet
- Ensure wallet address saved in student profile
- Check wallet connection status in debug panel

#### 4. No Certificates Even After Grading
**Problem**: Certificate creation failed  
**Solution**:
- Check teacher console for blockchain errors
- Verify environment variables:
  - `CERTIFICATE_ADDRESS` (smart contract)
  - `PRIVATE_KEY` (wallet for minting)
  - `SEPOLIA_RPC_URL` (blockchain connection)
- Try manual certificate award button

### 🎯 Grade Thresholds for Auto-Certificates

| Score | Badge | Certificate | Status |
|-------|-------|-------------|---------|
| 95-100% | Diamond | ✅ Auto | Gold tier |
| 90-94% | Platinum | ✅ Auto | Gold tier |
| 85-89% | Gold | ✅ Auto | Gold tier |
| 80-84% | Silver | ✅ Auto | Silver tier |
| 75-79% | Bronze | ❌ Manual only | Bronze tier |
| <75% | None | ❌ Manual only | No tier |

### 🔧 Manual Certificate Testing

If automatic certificates aren't working:

1. 👨‍🏫 **Teacher Portal > Grading tab**
2. 🎯 **Find any graded submission**
3. 🏆 **Click "Award Certificate" button**
4. ✍️ **Enter reason**: "Exceptional creativity"
5. ✅ **Should show success message with transaction hash**

### 📊 Database Verification

To verify certificates in database:
```sql
-- Connect to your database
SELECT 
  id, 
  studentId, 
  submissionId, 
  tokenId, 
  contractAddress,
  createdAt 
FROM certificates 
ORDER BY createdAt DESC;
```

### 🚀 Production Deployment

Before going live:
1. ✅ Test full certificate flow end-to-end
2. ✅ Verify all environment variables set
3. ✅ Remove debug console.log statements
4. ✅ Test with real MetaMask wallets
5. ✅ Monitor blockchain transaction costs

### 📞 Support Resources

- **Frontend logs**: Browser console (F12)
- **Backend logs**: Server terminal output
- **Blockchain**: Sepolia Etherscan for transaction verification
- **Database**: SQL queries to check certificate records

---

## ✨ Expected Result

After following these steps, you should see:

1. 🎓 **Student Portal shows certificate card** with:
   - Certificate name and description
   - Grade information and badge tier
   - Blockchain transaction link
   - Download/view options

2. 👨‍🏫 **Teacher Portal shows certificate status**:
   - "Auto-Awarded ✓" for Silver+ grades
   - Manual award button for exceptional work
   - Success notifications with transaction hashes

3. 🔍 **Debug panel shows**:
   - Certificates found: 1 (or more)
   - Loading: false
   - Error: none
   - Wallet linked: yes

**The certificate system is fully implemented and ready - it just needs test data to display certificates!** 🎉
