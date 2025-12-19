# Evalis-GT: Advanced Educational Assessment Platform

## 🏗️ Project Structure

This project is organized as a monorepo with separate frontend, backend, and web3 components:

```
evalis-gt/
├── frontend/          # React + Vite frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # Express.js backend API
│   ├── api/           # API routes
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── models/        # Database models
│   ├── utils/         # Utility functions
│   ├── uploads/       # File uploads
│   └── package.json   # Backend dependencies
├── web3/              # Blockchain contracts and scripts
│   ├── contracts/     # Solidity smart contracts
│   ├── scripts/       # Deployment scripts
│   └── package.json   # Web3 dependencies
├── scripts/           # Project utilities
│   ├── debug/         # Debug and troubleshooting scripts
│   ├── test/          # Test scripts
│   └── deployment/    # Deployment scripts
├── docs/              # Documentation
├── cleanup-backup/    # Backup files
└── package.json       # Workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (for production deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd evalis-gt
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development

1. **Start all services in development mode**
   ```bash
   npm run dev
   ```
   This starts:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

2. **Start individual services**
   ```bash
   # Frontend only
   npm run frontend:dev
   
   # Backend only  
   npm run backend:dev
   
   # Web3 development
   npm run web3:compile
   ```

### Building for Production

```bash
# Build all components
npm run build:all

# Build individual components
npm run frontend:build
npm run web3:compile
```

### Available Scripts

- `npm run dev` - Start frontend and backend in development
- `npm run build:all` - Build all components
- `npm run install:all` - Install dependencies for all modules
- `npm run deploy` - Run deployment script
- `npm run test:db` - Test database connection
- `npm run create:admin` - Create admin user

## 📁 Component Details

### Frontend (/frontend)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: React Context/Hooks

### Backend (/backend)
- **Framework**: Express.js
- **Database**: PostgreSQL (AWS RDS/Neon)
- **Authentication**: Clerk
- **File Storage**: Local uploads
- **API**: RESTful endpoints

### Web3 (/web3)
- **Framework**: Hardhat
- **Network**: Ethereum (Sepolia testnet)
- **Contracts**: NFT certificates and badges
- **Testing**: Hardhat test suite

## 🗄️ Database Setup

The project supports multiple database configurations:

1. **Development**: Local PostgreSQL or Neon DB
2. **Production**: AWS RDS PostgreSQL

### Environment Configuration

Create `.env` file with:
```env
# Database
DATABASE_URL=your_database_url

# Clerk Authentication  
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key

# Web3
SEPOLIA_RPC_URL=your_sepolia_rpc
PRIVATE_KEY=your_private_key
```

## 🚀 Deployment

### Development Deployment
```bash
npm run dev
```

### Production Deployment
```bash
npm run deploy
```

This runs the automated deployment script that:
- Builds all components
- Sets up production environment
- Starts services with PM2
- Configures monitoring

### Docker Deployment
```bash
docker-compose up -d
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Test specific components
npm run test:frontend
npm run test:backend
npm run web3:test
```

## 📖 Documentation

Detailed documentation is available in the `/docs` folder:

- [AWS RDS Setup](docs/AWS_RDS_MIGRATION.md)
- [Clerk Authentication](docs/CLERK_MIGRATION_GUIDE.md)
- [Firebase Setup](docs/FIREBASE_SETUP.md)
- [Production Deployment](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/CERTIFICATE_TROUBLESHOOTING_GUIDE.md)

## 🛠️ Development Tools

The project includes various utility scripts in `/scripts`:

### Debug Scripts (/scripts/debug)
- `auth-troubleshoot.js` - Authentication debugging
- `debug-database.js` - Database connection testing
- `find-*.js` - Data lookup utilities
- `verify-*.js` - System verification

### Test Scripts (/scripts/test)
- `test-*.js` - Comprehensive test suites
- `test-*.sh` - Shell-based tests

### Deployment Scripts (/scripts/deployment)
- `deploy.sh` - Main deployment script
- `monitor.sh` - System monitoring

## 🔧 Configuration

### Frontend Configuration
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration

### Backend Configuration  
- `server.js` - Express server setup
- `ecosystem.config.js` - PM2 process management
- Database models in `/backend/models`

### Web3 Configuration
- `hardhat.config.js` - Hardhat setup
- Smart contracts in `/web3/contracts`
- Deployment scripts in `/web3/scripts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes in the appropriate module
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and troubleshooting:
1. Check the documentation in `/docs`
2. Run debug scripts in `/scripts/debug`
3. Review logs in respective module directories
4. Open an issue on GitHub

## Features


## Admin Login Troubleshooting

If you cannot log in as admin:

1. Ensure the backend is actually running (check logs for "Server running" message).
2. Confirm an admin row exists:
   - Run: `node server/createAdmin.js` (creates if missing, password = env DEFAULT_ADMIN_PASSWORD or `admin123`).
3. To reset the admin password explicitly:
   - Run: `node server/createAdmin.js --reset --password=newStrongPass123`.
4. Verify environment variables `JWT_SECRET` and `DATABASE_URL` are set and the DB is reachable.
5. If you recreated the database, re-run: `node server/setupFreshDatabase.js` then recreate admin.
6. Observe login request/response in browser dev tools; 401 with correct username usually means password mismatch.

After resetting, try login with:
```
username: admin
password: (the password you set / admin123)
```

If problems persist, check server logs for lines containing `Admin login attempt` and `password match result` to pinpoint the issue.

### CORS Issues (Frontend 5173 -> Backend 3000)

Ensure backend started with NODE_ENV=development or set FRONTEND_URL env var, e.g.:
```
FRONTEND_URL=http://localhost:5173
```
To temporarily allow any origin (dev only):
```
CORS_ALLOW_ANY=true
```
Clear browser cache or hard-reload after changing CORS settings.

## Prerequisites
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/anantmishra/evalis.git
   cd evalis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   PORT=5000
   
   # Email Configuration (Optional but recommended)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:5173
   VITE_GOOGLE_AI_API_KEY=your_api_key_here
   ```

   > **Note on Email Configuration**: 
   > 
   > To use the email functionality (sending login credentials to students):
   > 
   > - For Gmail: You need to create an "App Password" in your Google Account security settings.
   > - For other providers: Use the appropriate SMTP settings and credentials.
   > - The `FRONTEND_URL` should point to your frontend application's URL.

## Database Setup

1. Create a MongoDB database (local or MongoDB Atlas)
2. Update the `.env` file with your MongoDB connection string
3. Seed the database with initial data:
   ```bash
   npm run data:import
   ```

## Database Setup (PostgreSQL)

### Prerequisites
- PostgreSQL installed on your system (version 12 or higher recommended)
- Basic knowledge of PostgreSQL administration

### Setup Instructions

1. Install PostgreSQL if you haven't already:
   ```bash
   # For Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # For macOS with Homebrew
   brew install postgresql
   
   # For Windows
   # Download the installer from https://www.postgresql.org/download/windows/
   ```

2. Start the PostgreSQL service:
   ```bash
   # Ubuntu/Debian
   sudo service postgresql start
   
   # macOS
   brew services start postgresql
   
   # Windows
   # The service should start automatically after installation
   ```

3. Create the database:
   ```bash
   # Option 1: Using the provided SQL script
   psql -U postgres -f init-db.sql
   
   # Option 2: Manually via psql
   psql -U postgres
   postgres=# CREATE DATABASE evalis;
   postgres=# \q
   ```

4. Configure environment variables:
   Update the `.env` file with your PostgreSQL connection details if different from the defaults:
   ```
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=evalis
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=yourpassword
   POSTGRES_SSL=false
   ```

5. Run the application with database synchronization:
   ```bash
   npm run server:dev
   ```
   This will create all the required tables in the database.

6. (Optional) Seed the database with initial data:
   ```bash
   npm run data:import
   ```

### Database Schemas

The application uses the following main database tables:

- `Students`: Student records with authentication
- `Teachers`: Teacher records with authentication
- `Subjects`: Available subjects/courses 
- `Batches`: Student batch/year information
- `Submissions`: Student assignment/exam submissions
- `TeacherSubjects`: Association between teachers and their assigned subjects
- `Admins`: Administrator accounts

## Running the Application

### Development Mode

1. Start the backend server:
   ```bash
   npm run server:dev
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   npm run dev
   ```

### Production Mode

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm run server
   ```

## API Endpoints

### Authentication
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/teacher/login` - Teacher login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/profile` - Get user profile

### Students
- `GET /api/students` - Get all students (Admin only)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create a new student (Admin only)
- `PUT /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)
- `GET /api/students/:id/submissions` - Get student submissions
- `POST /api/students/import` - Import students from Excel (Admin only)

### Teachers
- `GET /api/teachers` - Get all teachers (Admin only)
- `GET /api/teachers/:id` - Get teacher by ID (Admin only)
- `POST /api/teachers` - Create a new teacher (Admin only)
- `PUT /api/teachers/:id` - Update teacher (Admin only)
- `DELETE /api/teachers/:id` - Delete teacher (Admin only)
- `POST /api/teachers/:id/subjects` - Assign subject to teacher (Admin only)
- `DELETE /api/teachers/:id/subjects/:subjectId` - Remove subject from teacher (Admin only)

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create a new subject (Admin only)
- `PUT /api/subjects/:id` - Update subject (Admin only)
- `DELETE /api/subjects/:id` - Delete subject (Admin only)

### Batches
- `GET /api/batches` - Get all batches
- `GET /api/batches/:id` - Get batch by ID
- `POST /api/batches` - Create a new batch (Admin only)
- `PUT /api/batches/:id` - Update batch (Admin only)
- `DELETE /api/batches/:id` - Delete batch (Admin only)
- `GET /api/batches/:id/students` - Get students in a batch

## Demo Credentials

### Student Login
- ID: E23CSE001
- Password: anant123

### Teacher Login
- ID: T001
- Password: smith123

### Admin Login
- Username: admin
- Password: admin123

## Google AI Integration

The ProfileChatbot component now integrates with Google AI Studio's Gemini model for real-time student analysis. To use this feature:

1. Obtain a Google AI Studio API key from [Google AI Studio](https://makersuite.google.com/)
2. Add your API key to the `.env` file:
   ```
   VITE_GOOGLE_AI_API_KEY=your_api_key_here
   ```
3. The chatbot will automatically use the Google AI API to generate personalized responses based on student data

The AI provides:
- Personalized academic insights
- Performance analysis based on grades and attendance
- Customized recommendations for improvement
- Natural language interactions with students

## License

This project is licensed under the ISC License.
