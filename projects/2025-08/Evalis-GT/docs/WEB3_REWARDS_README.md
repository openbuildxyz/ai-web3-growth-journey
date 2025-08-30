# 🎓 Web3 Rewards System - EVT Tokens & NFT Certificates

## Overview

The Evalis platform now includes a comprehensive Web3 rewards system that allows teachers to award blockchain-based rewards to students for excellent academic performance. This system includes:

- **EVT Tokens**: ERC-20 governance tokens awarded for good performance
- **NFT Certificates**: Unique digital certificates for exceptional work
- **Student Rewards Portal**: View and manage earned rewards
- **Teacher Grading Interface**: Seamlessly award tokens during grading

## 🚀 Features

### For Teachers

#### **Enhanced Grading Interface**
- Award EVT tokens while grading assignments
- Mint NFT certificates for exceptional work (score ≥ 80%)
- Customizable token amounts and award reasons
- Batch token awarding capabilities

#### **Web3 Integration**
- Link teacher wallet addresses
- Mint tokens directly from the grading interface
- Automatic NFT metadata generation
- Transaction tracking and verification

### For Students

#### **Rewards Portal**
- View EVT token balance
- Display earned NFT certificates
- Blockchain verification links
- Achievement timeline

#### **Web3 Wallet Integration**
- Link personal wallets to receive rewards
- Real-time balance updates
- Multi-chain support (Sepolia testnet)

## 🏗️ Technical Architecture

### Smart Contracts

1. **EvalisToken (EVLT)** - `web3/contracts/EvalisToken.sol`
   - ERC-20 token with voting capabilities
   - Mintable by authorized addresses
   - Used for governance and rewards

2. **EvalisCertificate (EVLC)** - `web3/contracts/EvalisCertificate.sol`
   - ERC-721 NFT contract
   - Unique certificates for academic achievements
   - Metadata stored with achievement details

### Backend Implementation

#### **New Controllers**
- `server/web3/rewardsController.js` - Token and NFT awarding logic
- Enhanced `submissionController.js` - Integrated grading with rewards

#### **New API Endpoints**
```
POST /api/web3/award/tokens           # Award EVT tokens
POST /api/web3/award/certificate      # Award NFT certificate
POST /api/web3/award/tokens/batch     # Batch award tokens
GET  /api/web3/student/:id/balance    # Get student token balance
GET  /api/web3/student/:id/certificates # Get student certificates
```

#### **Database Models**
- Enhanced `Certificate` model with NFT tracking
- Wallet address fields in `Student` and `Teacher` models

### Frontend Implementation

#### **New Components**
- `StudentWeb3Rewards.tsx` - Student rewards dashboard
- Enhanced grading interface with Web3 options
- Wallet connection components

#### **Updated Pages**
- **TeacherPortal**: Integrated token/NFT awarding in grading
- **StudentPortal**: New "Rewards" tab showing Web3 achievements

## 🛠️ Setup Instructions

### 1. Deploy Smart Contracts

```bash
cd web3
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 2. Configure Environment Variables

Add to your `.env` file:
```env
# Web3 Configuration
CHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MINTER_PRIVATE_KEY=your_private_key_here
TOKEN_ADDRESS=deployed_token_address
CERTIFICATE_ADDRESS=deployed_certificate_address
GOVERNOR_ADDRESS=deployed_governor_address
```

### 3. Update Database

The Certificate model is already included. Ensure migrations are run:
```bash
npm run migrate
```

### 4. Start the Application

```bash
# Backend
cd server
npm start

# Frontend
cd ../
npm run dev
```

## 🎯 Usage Guide

### For Teachers

#### **Grading with Rewards**

1. Navigate to Teacher Portal → Grading tab
2. Select a submission to grade
3. Enter grade and feedback
4. **Optional**: Check "Award EVT Tokens" checkbox
   - Enter token amount (e.g., 50)
   - Add custom reason
5. Click "Submit Grade & Awards"
6. **For excellent work**: Click "Award NFT" button (appears for grades ≥80%)

#### **Batch Token Awards**

Use the API endpoint to award tokens to multiple students:
```javascript
// Example batch award
const awards = [
  { studentId: 'S001', amount: 100, reason: 'Excellent midterm performance' },
  { studentId: 'S002', amount: 75, reason: 'Great improvement shown' }
];
```

### For Students

#### **Viewing Rewards**

1. Navigate to Student Portal → Rewards tab
2. Link your Web3 wallet (one-time setup)
3. View your EVT token balance
4. Browse earned NFT certificates
5. Click "View on Chain" to verify on blockchain

#### **Wallet Connection**

Students must link their Web3 wallet to receive rewards:
1. Install MetaMask or compatible wallet
2. Switch to Sepolia testnet
3. Use the wallet connection interface in the portal

## 🔗 Web3 Integration Details

### Token Economics

- **EVT Tokens**: Awarded for academic performance
- **Typical Awards**: 25-100 tokens per assignment
- **Use Cases**: Governance voting, recognition, future utility

### NFT Certificates

- **Criteria**: Automatically offered for scores ≥80%
- **Metadata**: Includes student name, assignment, score, date
- **Storage**: Metadata stored as data URI (upgradeable to IPFS)
- **Verification**: Immutable proof of academic achievement

### Blockchain Networks

- **Development**: Hardhat local network
- **Testing**: Sepolia testnet
- **Production**: Ethereum mainnet (configurable)

## 🔧 API Reference

### Award EVT Tokens

```http
POST /api/web3/award/tokens
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "studentId": "S12345",
  "amount": 50,
  "reason": "Excellent assignment submission"
}
```

### Award NFT Certificate

```http
POST /api/web3/award/certificate
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "submissionId": 123,
  "metadataUri": "" // Optional - auto-generated if empty
}
```

### Get Student Balance

```http
GET /api/web3/student/S12345/balance
Authorization: Bearer <token>
```

## 🛡️ Security Considerations

### Access Control
- Only teachers and admins can award tokens/certificates
- Students can only view their own rewards
- Wallet linking requires authentication

### Blockchain Security
- Private keys stored securely in environment variables
- Minting restricted to authorized addresses
- Transaction verification and error handling

### Data Validation
- Input validation for all reward parameters
- Duplicate award prevention
- Wallet address format validation

## 🧪 Testing

### Manual Testing

Run the test script:
```bash
./test-web3-implementation.sh
```

### Test Scenarios

1. **Teacher awards tokens during grading**
2. **Student views rewards in portal**
3. **NFT certificate minting for high scores**
4. **Wallet connection and balance display**
5. **Batch token awarding**

## 🚀 Future Enhancements

### Planned Features
- IPFS metadata storage for NFTs
- Multi-chain support (Polygon, BSC)
- Token staking for additional benefits
- Marketplace for trading certificates
- Advanced governance features

### Integration Opportunities
- Alumni network rewards
- Industry partnership tokens
- Academic credential verification
- Cross-institution recognition

## 📊 Monitoring and Analytics

### Dashboard Metrics
- Total tokens awarded
- NFT certificates minted
- Student wallet adoption rate
- Teacher usage statistics

### Blockchain Analytics
- Transaction success rates
- Gas usage optimization
- Network performance monitoring

## 🤝 Contributing

### Development Workflow
1. Test contracts on local hardhat network
2. Deploy to Sepolia for integration testing
3. Frontend integration with testnet
4. Security review and auditing

### Smart Contract Updates
- Follow OpenZeppelin standards
- Implement upgrade patterns if needed
- Comprehensive testing before deployment

## 📞 Support

For technical issues or questions:
- Check contract deployment status
- Verify environment variables
- Review blockchain transaction logs
- Contact development team

---

**🎉 Congratulations!** You've successfully implemented a comprehensive Web3 rewards system that bridges traditional academia with blockchain technology, creating new opportunities for student recognition and engagement.
