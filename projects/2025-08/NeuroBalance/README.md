# Smart Portfolio Rebalancer

An AI-powered decentralized portfolio management platform built on BNB Smart Chain that automatically rebalances your crypto portfolio based on machine learning predictions and customizable investment strategies.

## 🌟 Features

### 🎯 Core Features

#### **Portfolio Overview**
- Real-time portfolio tracking across BNB Smart Chain
- Interactive pie charts and progress bars for allocation visualization
- Total portfolio value calculation in USD
- Support for major tokens: BUSD, WBNB, CAKE
- Responsive design with beautiful gradients and animations

#### **AI-Powered Predictions**
- Machine learning model for 7-day return forecasts
- Uses `pypfopt` library for portfolio optimization
- Real-time prediction updates based on market data
- Visual representation of predicted returns with color-coded indicators
- AI-suggested optimal allocations based on risk profile

#### **Smart Investment Strategies**
- **Growth Strategy**: Higher risk, higher potential returns 
- **Balanced Strategy**: Moderate risk and returns
- **Conservative Strategy**: Lower risk, stable returns
- Dynamic strategy adjustments based on AI predictions

#### **Automated Rebalancing**
- One-click portfolio rebalancing with smart contract integration
- Multi-step swap process with progress tracking
- Automatic token approval handling
- Gas optimization and error recovery
- Real-time transaction status updates
- BSC Testnet integration for safe testing

#### **Decentralized Storage**
- BNB Greenfield integration for swap history storage
- Reed-Solomon checksums for data integrity
- Immutable transaction logs
- JSON export functionality
- Object-based storage with metadata

#### **Comprehensive Swap History**
- Complete transaction history stored on decentralized storage
- Before/after allocation comparisons
- Strategy tracking for each rebalance
- Download functionality for audit trails
- Real-time sync with BNB Greenfield

#### **Secure Authentication**
- NextAuth.js integration with MetaMask
- Wallet-based authentication
- Session management
- Protected routes and API endpoints

## 🛠️ Technology Stack

### **Frontend Technologies**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **shadcn/ui**: Modern UI component library
- **Recharts**: Data visualization and charting
- **Lucide React**: Beautiful icon library

### **Blockchain Integration**
- **Ethers.js v6**: Ethereum library for smart contract interaction
- **BNB Smart Chain**: Testnet deployment for safe testing
- **MetaMask**: Wallet integration and transaction signing
- **Solidity**: Smart contract development (SimpleSwap contract)

### **Backend & APIs**
- **Next.js API Routes**: Server-side API endpoints
- **NextAuth.js**: Authentication framework
- **Axios**: HTTP client for API requests
- **Python Integration**: AI model execution
- **pypfopt**: Portfolio optimization library

### **AI & Machine Learning**
- **Python**: Core AI processing
- **pypfopt**: Modern Portfolio Theory implementation
- **NumPy/Pandas**: Data manipulation (implied)
- **Custom prediction algorithms**: 7-day return forecasting

### **Decentralized Storage**
- **BNB Greenfield**: Decentralized object storage
- **@bnb-chain/greenfield-js-sdk**: Official Greenfield SDK
- **@bnb-chain/reed-solomon**: Data integrity checksums
- **JSON Storage**: Structured data persistence

## 🔗 Smart Contract Integration

### **SimpleSwap Contract**
- **Address**: `0xE91866063d5DA85cff082B73a5F93B5d7f334412`
- **Network**: BNB Smart Chain Testnet
- **Functions**:
  - `swap(address from, address to, uint256 amount)`
  - `isTokenSupported(address token)`
  - `withdrawTokens(address token, uint256 amount)`

### **Supported Tokens**
- **BUSD**: `0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814`
- **WBNB**: `0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd`
- **CAKE**: `0xFa60D973F7642B748046464e165A65B7323b0DEE`


### **Development Tools**
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **Git**: Version control
- **Environment Variables**: Secure configuration management

## 🏗️ Architecture

### **System Overview**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API    │    │  BNB Greenfield │
│   (React/TS)    │◄──►│   Routes         │◄──►│  Storage        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MetaMask      │    │   Python AI      │    │  Smart Contract │
│   Wallet        │    │   Model          │    │  (BNB Chain)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Data Flow**
1. **Authentication**: User connects MetaMask wallet
2. **Portfolio Fetch**: API retrieves token balances from BNB Chain
3. **AI Prediction**: Python model analyzes data and suggests allocations
4. **Strategy Selection**: User chooses investment strategy
5. **Rebalancing**: Smart contract executes token swaps
6. **Storage**: Transaction data stored on BNB Greenfield
7. **History**: Decentralized logs displayed in dashboard

## 📋 API Endpoints

### **Core APIs**
- `POST /api/portfolio` - Fetch wallet portfolio data
- `POST /api/ai-prediction` - Get AI predictions and allocations
- `GET /api/ai-prediction` - Fetch available strategies
- `POST /api/store-logs` - Store swap data to Greenfield
- `GET /api/store-logs` - Retrieve swap history


## 📊 AI Model Details

### **Portfolio Optimization**
- Modern Portfolio Theory implementation
- Risk-return optimization using pypfopt
- 7-day return predictions
- Dynamic allocation adjustments
- Strategy-based risk profiling

### **Prediction Engine**
- Historical price analysis
- Volatility calculations
- Correlation matrix analysis
- Efficient frontier optimization

## 🌐 Deployment Architecture

### **Production Environment**
- Next.js application deployed on Vercel/similar
- Python AI model as serverless functions
- BNB Greenfield for decentralized storage
- BNB Smart Chain testnet for smart contracts

### **Environment Variables**
```env
GREENFIELD_RPC_URL=
GREENFIELD_CHAIN_ID=
GREENFIELD_PRIVATE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```


## 📄 License

This project is open source and available under the MIT License.

---
