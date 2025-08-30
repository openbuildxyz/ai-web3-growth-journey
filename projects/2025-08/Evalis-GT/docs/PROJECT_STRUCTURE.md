# Evalis-GT Project Structure

This project has been reorganized into a clean, modular structure with separated frontend, backend, and web3 components.

## Project Structure

```
evalis-gt/
├── frontend/                   # React frontend application
│   ├── src/                   # Source code
│   ├── public/                # Static assets
│   ├── index.html             # Main HTML template
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── eslint.config.mjs      # ESLint configuration
│
├── backend/                   # Express.js backend API
│   ├── api/                   # API routes
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Express middleware
│   ├── models/                # Database models
│   ├── routes/                # Route definitions
│   ├── utils/                 # Utility functions
│   ├── uploads/               # File uploads storage
│   ├── logs/                  # Application logs
│   ├── package.json           # Backend dependencies
│   └── server.js              # Main server file
│
├── web3/                      # Blockchain/Web3 smart contracts
│   ├── contracts/             # Solidity smart contracts
│   ├── scripts/               # Deployment scripts
│   ├── artifacts/             # Compiled contracts
│   ├── package.json           # Web3 dependencies
│   └── hardhat.config.js      # Hardhat configuration
│
├── api/                       # Vercel API routes (serverless)
├── package.json               # Workspace package.json
├── docker-compose.yml         # Docker composition
├── Dockerfile                 # Docker configuration
├── ecosystem.config.js        # PM2 configuration
└── vercel.json                # Vercel deployment config
```

## Development Commands

### Root Level Commands (Workspace)
```bash
# Install all dependencies
npm run install:all

# Start development environment (both frontend and backend)
npm run dev

# Build all components
npm run build:all
```

### Frontend Commands
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Commands
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Start development server
npm run dev

# Start production server
npm run start
```

### Web3 Commands
```bash
# Navigate to web3 directory
cd web3

# Install web3 dependencies
npm install

# Compile smart contracts
npm run build

# Run tests
npm run test

# Deploy to Sepolia testnet
npm run deploy
```

## Environment Variables

Environment variables should be placed in the root directory:
- `.env` - Base configuration
- `.env.development` - Development overrides
- `.env.production` - Production overrides
- `.env.local` - Local overrides (gitignored)

## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
npm run docker:compose

# Or build individual container
npm run docker:build
npm run docker:run
```

### Production Deployment with PM2
```bash
# Start production server with PM2
npm run pm2:start

# Monitor PM2 processes
npm run pm2:monit
```

### Vercel Deployment
The project is configured for Vercel deployment:
- Frontend builds automatically to `frontend/dist/`
- Backend runs as serverless functions via `api/` directory
- Configuration in `vercel.json`

## Database

The backend supports multiple database configurations:
- PostgreSQL (AWS RDS, Neon, local)
- Sequelize ORM for database operations
- Migration scripts available in `backend/scripts/`

## Web3 Integration

Smart contracts are developed using:
- Hardhat development environment
- OpenZeppelin contracts for security
- Ethers.js for blockchain interaction
- Deployed on Sepolia testnet

## File Storage

- User uploads: `backend/uploads/`
- Application logs: `backend/logs/`
- Static assets: `frontend/public/`

## Key Features

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + Sequelize + PostgreSQL
- **Web3**: Hardhat + Solidity + Ethers.js
- **Auth**: Clerk authentication
- **Deployment**: Docker + PM2 + Vercel support
- **Monitoring**: Winston logging + Health checks

## Migration Notes

This structure separates concerns cleanly:
1. **Frontend** handles all UI/UX components
2. **Backend** manages API, database, and business logic
3. **Web3** contains all blockchain-related code
4. **Root** contains deployment and workspace configuration

All paths in configuration files have been updated to reflect the new structure.
