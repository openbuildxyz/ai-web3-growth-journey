# Evalis-GT: Complete Project Understanding Guide

## 🎓 Project Overview

Evalis-GT is a full‑stack academic management and assessment platform for universities and institutes. It centralizes assignment creation and distribution, digital submissions, rubric‑based grading with feedback, and performance analytics across students, teachers, and administrators.

Built with React (Vite, MUI, Radix UI, Tailwind) on the frontend and Node.js/Express on the backend, Evalis‑GT uses PostgreSQL via Sequelize to model clean academic entities and relationships (Students, Teachers, Subjects, Batches, Semesters, Assignments, Submissions). Authentication combines Firebase Auth on the client with JWT on the server, reinforced by rate limiting, structured logging, and robust error handling. The platform supports secure file uploads (PDFs and more) with viewing/annotation, Excel import/export for bulk operations, and AI‑assisted features like question enhancement and profile insights.

It ships with Docker/PM2/Nginx configurations and can run locally or in production with AWS RDS (PostgreSQL) and Redis. The architecture is modular and extensible, enabling institutions to adapt workflows, add subjects/semesters, and scale from a single department to campus‑wide usage.

Key capabilities at a glance:
- Role‑based portals for Students, Teachers, and Admins
- Assignment lifecycle: create → distribute → submit → grade → feedback
- Semester/batch/subject management with teacher–subject mapping
- Analytics dashboards and grade visualizations
- Email notifications and password reset flows
- Secure, rate‑limited APIs with comprehensive logging

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript - Modern UI framework
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - Component library for professional UI
- **Radix UI** - Headless UI primitives for custom components
- **TailwindCSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **React Query (TanStack)** - Server state management
- **Firebase Auth** - Authentication system
- **Framer Motion** - Animation library
- **Chart.js & React ChartJS 2** - Data visualization
- **PDF.js & React PDF** - PDF handling
- **Axios** - HTTP client

### Backend
- **Node.js** with Express.js - Server framework
- **TypeScript/JavaScript** - Programming languages
- **PostgreSQL** - Primary database (migrated from MongoDB)
- **Sequelize ORM** - Database object-relational mapping
- **Firebase Admin SDK** - Server-side Firebase integration
- **JWT (jsonwebtoken)** - Authentication tokens
- **Multer** - File upload handling
- **Nodemailer** - Email functionality
- **Winston** - Logging system
- **Express Rate Limit** - API rate limiting
- **CORS** - Cross-origin resource sharing

### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **PM2** - Process management
- **Nginx** - Reverse proxy and load balancing
- **Vercel** - Frontend deployment platform
- **AWS RDS** - Managed database service
- **Redis** - Caching and session management

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands

## 📂 Project Structure Deep Dive

```
evalis-gt/
├── 📁 src/                          # Frontend React application
│   ├── 📁 components/               # Reusable UI components
│   │   ├── ui/                      # Base UI components (buttons, dialogs, etc.)
│   │   ├── AuthListener.jsx         # Firebase auth state management
│   │   ├── Header.tsx               # Main navigation header
│   │   ├── StudentList.jsx          # Student management components
│   │   ├── TeacherList.jsx          # Teacher management components
│   │   └── ProfileChatbot.tsx       # AI-powered student assistant
│   ├── 📁 pages/                    # Main application pages
│   │   ├── LandingPage.tsx          # Public homepage
│   │   ├── Login.tsx                # Authentication page
│   │   ├── StudentPortal.tsx        # Student dashboard
│   │   ├── TeacherPortal.tsx        # Teacher dashboard
│   │   └── AdminPortal.tsx          # Admin dashboard
│   ├── 📁 api/                      # Frontend API service layer
│   │   ├── authService.ts           # Authentication API calls
│   │   ├── studentService.ts        # Student-related API calls
│   │   └── questionEnhancerService.ts # AI question enhancement
│   ├── 📁 config/                   # Configuration files
│   │   └── firebase.ts              # Firebase client configuration
│   ├── 📁 types/                    # TypeScript type definitions
│   ├── 📁 hooks/                    # Custom React hooks
│   ├── 📁 context/                  # React context providers
│   ├── 📁 utils/                    # Utility functions
│   └── App.tsx                      # Main application component
│
├── 📁 server/                       # Backend Node.js application
│   ├── 📁 models/                   # Database models (Sequelize)
│   │   ├── studentModel.js          # Student entity definition
│   │   ├── teacherModel.js          # Teacher entity definition
│   │   ├── subjectModel.js          # Subject/course definition
│   │   ├── submissionModel.js       # Assignment submission model
│   │   └── index.js                 # Model relationships & exports
│   ├── 📁 controllers/              # Business logic controllers
│   │   ├── authController.js        # Authentication logic
│   │   ├── studentController.js     # Student management logic
│   │   ├── teacherController.js     # Teacher management logic
│   │   └── submissionController.js  # Submission handling logic
│   ├── 📁 routes/                   # API route definitions
│   │   ├── authRoutes.js            # Authentication endpoints
│   │   ├── studentRoutes.js         # Student CRUD endpoints
│   │   ├── teacherRoutes.js         # Teacher CRUD endpoints
│   │   └── submissionRoutes.js      # Submission endpoints
│   ├── 📁 middleware/               # Express middleware
│   │   ├── authMiddleware.js        # JWT token validation
│   │   ├── errorMiddleware.js       # Error handling
│   │   └── rateLimitMiddleware.js   # API rate limiting
│   ├── 📁 config/                   # Server configuration
│   │   ├── db.js                    # Database connection setup
│   │   └── constants.js             # Application constants
│   ├── 📁 utils/                    # Server utilities
│   │   ├── logger.js                # Winston logging configuration
│   │   └── sessionManager.js       # Session management
│   ├── 📁 scripts/                  # Utility scripts
│   │   ├── migrateToAWSRDS.js      # Database migration scripts
│   │   └── healthCheck.js          # Health monitoring
│   └── server.js                    # Main server entry point
│
├── 📁 cleanup-backup/               # Legacy cleanup and backup scripts
├── 📁 public/                       # Static assets
├── 📄 docker-compose.yml           # Docker containerization
├── 📄 package.json                 # Dependencies and scripts
├── 📄 vite.config.ts               # Vite build configuration
├── 📄 tailwind.config.js           # TailwindCSS configuration
└── 📄 ecosystem.config.js          # PM2 process management
```

## 🎯 Core Features

### 👨‍🎓 Student Portal
- **Dashboard**: Personal academic overview with grades and statistics
- **Assignment Submission**: Upload assignments with file validation
- **Grade Tracking**: View grades across subjects and semesters
- **PDF Annotation**: Annotate submitted documents
- **AI Chatbot**: Personalized academic assistance using Google AI
- **Profile Management**: Update personal information

### 👨‍🏫 Teacher Portal  
- **Assignment Management**: Create, edit, and manage assignments
- **Grading System**: Grade student submissions with feedback
- **Student Analytics**: View class performance and statistics
- **Question Paper Creator**: AI-assisted question paper generation
- **Bulk Operations**: Import/export student data
- **Subject Management**: Manage assigned subjects

### 👨‍💼 Admin Portal
- **User Management**: CRUD operations for students and teachers
- **Batch Management**: Organize students by academic years/batches
- **Subject Administration**: Create and assign subjects
- **System Analytics**: Comprehensive system usage statistics
- **Data Import/Export**: Excel-based bulk data operations
- **Semester Management**: Academic calendar management

### 🔐 Authentication & Security
- **Multi-role Authentication**: Separate login systems for students, teachers, admins
- **Firebase Integration**: Secure authentication with password reset
- **JWT Tokens**: Stateless authentication with session management
- **Rate Limiting**: API protection against abuse
- **Role-based Access Control**: Granular permissions system

## 🗃️ Database Architecture

### Core Entities & Relationships

```sql
-- Primary Tables
Students (id, name, email, batch, activeSemesterId, firebaseUid)
Teachers (id, name, email, department, firebaseUid)
Admins (id, username, email, passwordHash)
Subjects (id, name, code, credits, semesterId, batchId)
Batches (id, name, year, program)
Semesters (id, name, batchId, startDate, endDate)
Assignments (id, title, description, dueDate, teacherId, subjectId)
Submissions (id, studentId, assignmentId, subjectId, filePath, grade, feedback)

-- Junction Tables
TeacherSubjects (teacherId, subjectId) -- Many-to-many relationship
```

### Key Relationships
- Students belong to Batches and have active Semesters
- Teachers can teach multiple Subjects (many-to-many)
- Subjects belong to Semesters and Batches
- Assignments are created by Teachers for specific Subjects
- Submissions link Students to Assignments with grading info

## 🚀 Getting Started - Step by Step

### 1. Prerequisites Installation
```bash
# Install Node.js (v18 or higher)
# Install PostgreSQL (v12 or higher)
# Install Git
```

### 2. Clone and Setup
```bash
git clone https://github.com/anntmishra/Evalis-GT.git
cd Evalis-GT
npm install
```

### 3. Environment Configuration
Create `.env` in the root directory:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/evalis
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=evalis
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password

# Authentication
JWT_SECRET=your-super-secret-jwt-key
DEFAULT_ADMIN_PASSWORD=admin123

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Firebase (Frontend)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com

# Google AI
VITE_GOOGLE_AI_API_KEY=your-google-ai-api-key

# Development
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### 4. Database Setup
```bash
# Start PostgreSQL service
sudo service postgresql start  # Linux
brew services start postgresql # macOS

# Create database
createdb evalis

# Initialize database structure
npm run server:dev  # This will create tables automatically
```

### 5. Create Admin User
```bash
node server/createAdmin.js
```

### 6. Start Development Servers
```bash
# Terminal 1: Start backend
npm run server:dev

# Terminal 2: Start frontend  
npm run dev
```

### 7. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/api/health

## 📚 Learning Path - Files to Read First

### Phase 1: Understanding the Foundation (Start Here)
1. **`package.json`** - Understand dependencies and available scripts
2. **`src/App.tsx`** - Main application structure and routing
3. **`server/server.js`** - Backend entry point and middleware setup
4. **`server/config/db.js`** - Database connection and configuration

### Phase 2: Core Architecture  
5. **`server/models/index.js`** - Database relationships and models
6. **`src/config/firebase.ts`** - Authentication configuration
7. **`server/routes/authRoutes.js`** - Authentication API endpoints
8. **`server/controllers/authController.js`** - Authentication business logic

### Phase 3: User Interfaces
9. **`src/pages/LandingPage.tsx`** - Public homepage and navigation
10. **`src/pages/Login.tsx`** - Authentication interface
11. **`src/pages/StudentPortal.tsx`** - Student dashboard
12. **`src/pages/TeacherPortal.tsx`** - Teacher dashboard
13. **`src/pages/AdminPortal.tsx`** - Admin dashboard

### Phase 4: Core Features
14. **`server/models/studentModel.js`** - Student data structure
15. **`server/controllers/studentController.js`** - Student management logic
16. **`src/components/StudentList.jsx`** - Student management UI
17. **`server/controllers/submissionController.js`** - Assignment submission handling
18. **`src/components/SubmissionUploader.tsx`** - File upload interface

### Phase 5: Advanced Features
19. **`src/components/ProfileChatbot.tsx`** - AI integration
20. **`src/api/questionEnhancerService.ts`** - AI question enhancement
21. **`server/middleware/authMiddleware.js`** - Security middleware
22. **`docker-compose.yml`** - Deployment configuration

## 🔧 Key Code Patterns to Understand

### 1. Authentication Flow
```typescript
// Frontend: src/config/firebase.ts
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Backend: server/controllers/authController.js
const loginStudent = async (req, res) => {
  const { email, password } = req.body;
  // Validate credentials and return JWT token
};
```

### 2. Database Operations with Sequelize
```javascript
// server/models/studentModel.js
const Student = sequelize.define('Student', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  batch: DataTypes.INTEGER
});

// server/controllers/studentController.js
const getStudents = async (req, res) => {
  const students = await Student.findAll({
    include: [{ model: Batch }]
  });
};
```

### 3. API Service Pattern
```typescript
// src/api/studentService.ts
export const fetchStudents = async () => {
  const response = await axios.get('/api/students', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

### 4. Component Structure
```tsx
// src/components/StudentList.jsx
const StudentList = () => {
  const [students, setStudents] = useState([]);
  
  useEffect(() => {
    fetchStudents().then(setStudents);
  }, []);
  
  return (
    <div>
      {students.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
};
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start frontend + backend concurrently
npm run frontend         # Start only frontend (Vite)
npm run server:dev       # Start only backend with nodemon

# Production
npm run build           # Build frontend for production
npm run start           # Start production server
npm run pm2:start       # Start with PM2 process manager

# Database
npm run data:import     # Import sample data
npm run create:admin    # Create admin user
npm run setup:awsrds    # Setup AWS RDS database

# Docker
npm run docker:build    # Build Docker image
npm run docker:compose  # Start with Docker Compose

# Testing & Health
npm run health:check    # Check application health
npm run test:db        # Test database connection
```

## 🎨 UI Component System

The project uses a layered UI approach:

1. **Base Components** (`src/components/ui/`) - Primitive components like buttons, inputs
2. **Feature Components** (`src/components/`) - Business logic components
3. **Page Components** (`src/pages/`) - Full page layouts
4. **Layout Components** - Headers, navigation, containers

## 🔐 Security Features

- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Sequelize ORM prevents SQL injection
- **XSS Protection**: Input sanitization and CSP headers
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Controlled cross-origin access
- **JWT Token Management**: Secure stateless authentication
- **File Upload Security**: Type validation and size limits

## 🚀 Deployment Options

### Development
- Frontend: Vite dev server (port 5173)
- Backend: Node.js with nodemon (port 3000)
- Database: Local PostgreSQL

### Production
- **Vercel**: Frontend deployment with serverless functions
- **Docker**: Containerized deployment with nginx
- **PM2**: Process management for Node.js
- **AWS RDS**: Managed PostgreSQL database
- **Redis**: Session storage and caching

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging with different levels
- **Health Checks**: API endpoints for monitoring
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Request timing and database query optimization

## 🤝 Contributing Guidelines

1. Follow the existing code structure and patterns
2. Use TypeScript for new frontend components
3. Implement proper error handling
4. Add JSDoc comments for functions
5. Test API endpoints thoroughly
6. Follow the established naming conventions

## 📈 Future Roadmap

- Real-time notifications with WebSockets
- Advanced analytics dashboard
- Mobile app development
- Integration with external LMS systems
- Advanced AI features for personalized learning
- Automated grading for multiple choice questions

---

**Start your journey with the files listed in the Learning Path section above. This will give you a solid foundation to understand the entire codebase progressively!**
