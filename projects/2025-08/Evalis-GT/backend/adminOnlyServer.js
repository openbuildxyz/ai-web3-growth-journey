require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./config/db');

const app = express();

// Very permissive CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Portal-Role', 'X-User-Role']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Import admin controller functions
const {
  getDashboardStats,
  getBatches,
  createBatch,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getSubjects,
  createSubject
} = require('./controllers/adminController');

// Simple auth middleware for admin-only server
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Get admin user
    const { Admin } = require('./models');
    const admin = await Admin.findOne({ where: { username: decoded.id } });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }

    req.user = admin;
    req.user.role = 'admin';
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Admin login endpoint
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    console.log('\n=== ADMIN LOGIN ATTEMPT ===');
    console.log('Request body:', req.body);

    const { username, password, email, firebaseToken } = req.body;

    // Basic validation
    if ((!username && !email) || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required'
      });
    }

    console.log(`Username: "${username}", Email: "${email}"`);
    console.log(`Password length: ${password.length}`);
    console.log(`Firebase token: ${firebaseToken ? 'Yes' : 'No'}`);

    // Import models
    const { Admin } = require('./models');

    // Find admin by username (primary) or email (secondary)
    console.log('Looking for admin in database...');
    const whereClause = username ? { username: username.trim() } : { email: email.trim() };
    const admin = await Admin.findOne({ where: whereClause });

    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password'
      });
    }

    console.log(`✅ Admin found: ${admin.username} (ID: ${admin.id})`);

    // Try Firebase authentication first if we have an email
    let isAuthenticated = false;
    let authMethod = 'database';

    if (admin.email && (email || username.includes('@'))) {
      try {
        // Import Firebase auth functions
        const { loginWithEmailAndPassword } = require('./config/firebase');

        // Try Firebase authentication
        const loginEmail = email || username;
        const userCredential = await loginWithEmailAndPassword(loginEmail, password);
        if (userCredential && userCredential.user) {
          console.log(`✅ Firebase authentication successful for admin: ${loginEmail}`);
          isAuthenticated = true;
          authMethod = 'firebase';
        }
      } catch (firebaseError) {
        console.log(`Firebase authentication failed: ${firebaseError.message}`);
        // Continue to database authentication
      }
    }

    // If Firebase auth failed or not available, try database password
    if (!isAuthenticated) {
      console.log('Checking database password...');
      const isMatch = await bcrypt.compare(password, admin.password);
      console.log(`Database password match: ${isMatch}`);

      if (isMatch) {
        isAuthenticated = true;
        authMethod = 'database';
      }
    }

    if (isAuthenticated) {
      // Generate token
      console.log('Generating JWT token...');
      const token = jwt.sign(
        { id: admin.username, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      console.log(`✅ Admin authentication successful via ${authMethod}!`);

      // Send response in the format the frontend expects
      res.json({
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        token: token,
        authMethod: authMethod // Include auth method for debugging
      });
    } else {
      console.log('❌ Authentication failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password'
      });
    }

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Admin dashboard routes
app.get('/api/admin/dashboard', adminAuth, getDashboardStats);

// Batch management routes
app.get('/api/admin/batches', adminAuth, getBatches);
app.post('/api/admin/batches', adminAuth, createBatch);

// Teacher management routes
app.get('/api/admin/teachers', adminAuth, getTeachers);
app.post('/api/admin/teachers', adminAuth, createTeacher);
app.put('/api/admin/teachers/:id', adminAuth, updateTeacher);
app.delete('/api/admin/teachers/:id', adminAuth, deleteTeacher);

// Student management routes
app.get('/api/admin/students', adminAuth, getStudents);
app.post('/api/admin/students', adminAuth, createStudent);
app.put('/api/admin/students/:id', adminAuth, updateStudent);
app.delete('/api/admin/students/:id', adminAuth, deleteStudent);

// Subject management routes
app.get('/api/admin/subjects', adminAuth, getSubjects);
app.post('/api/admin/subjects', adminAuth, createSubject);

// Batch-specific student routes
app.get('/api/batches/:batchId/students', adminAuth, async (req, res) => {
  try {
    const { batchId } = req.params;
    const { Student, Batch, Semester } = require('./models');
    
    const students = await Student.findAll({
      where: { batch: batchId },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Batch,
          attributes: ['name', 'department', 'startYear', 'endYear']
        },
        {
          model: Semester,
          attributes: ['id', 'name', 'number', 'active'],
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students by batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

// Get subjects for a specific batch and semester
app.get('/api/batches/:batchId/subjects', adminAuth, async (req, res) => {
  try {
    const { batchId } = req.params;
    const { semesterId } = req.query;
    const { Subject, Semester, Batch } = require('./models');
    
    const whereClause = { batchId };
    if (semesterId) {
      whereClause.semesterId = semesterId;
    }
    
    const subjects = await Subject.findAll({
      where: whereClause,
      include: [
        {
          model: Semester,
          attributes: ['id', 'name', 'number', 'active']
        },
        {
          model: Batch,
          attributes: ['name', 'department']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects for batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects'
    });
  }
});

// Assignment management routes
app.get('/api/assignments', adminAuth, async (req, res) => {
  try {
    const { Assignment, Subject, Teacher, Student } = require('./models');
    
    const assignments = await Assignment.findAll({
      include: [
        {
          model: Subject,
          attributes: ['name', 'code']
        },
        {
          model: Teacher,
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
});

app.post('/api/assignments', adminAuth, async (req, res) => {
  try {
    const { title, description, subjectId, teacherId, dueDate, maxMarks } = req.body;
    const { Assignment } = require('./models');
    
    const assignment = await Assignment.create({
      title,
      description,
      subjectId,
      teacherId,
      dueDate,
      maxMarks: maxMarks || 100
    });

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment'
    });
  }
});

// Student subjects route
app.get('/api/students/:studentId/subjects', adminAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { Student, Subject, Semester, Batch } = require('./models');
    
    // Get student's batch and active semester
    const student = await Student.findByPk(studentId, {
      attributes: ['batch', 'activeSemesterId'],
      include: [
        {
          model: Batch,
          attributes: ['name', 'department']
        },
        {
          model: Semester,
          attributes: ['id', 'name', 'number'],
          required: false
        }
      ]
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get subjects for student's batch and semester
    const subjects = await Subject.findAll({
      where: {
        batchId: student.batch,
        ...(student.activeSemesterId && { semesterId: student.activeSemesterId })
      },
      include: [
        {
          model: Semester,
          attributes: ['id', 'name', 'number']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      student: {
        id: studentId,
        batch: student.Batch,
        activeSemester: student.Semester
      },
      subjects
    });
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects'
    });
  }
});

// Student assignments route
app.get('/api/students/:studentId/assignments', adminAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { Assignment, Subject, Teacher, Student, Submission } = require('./models');
    
    // Get student's batch and active semester
    const student = await Student.findByPk(studentId, {
      attributes: ['batch', 'activeSemesterId']
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get subjects for student's batch and semester
    const subjects = await Subject.findAll({
      where: {
        batchId: student.batch,
        ...(student.activeSemesterId && { semesterId: student.activeSemesterId })
      },
      attributes: ['id']
    });

    const subjectIds = subjects.map(s => s.id);

    // Get assignments for those subjects
    const assignments = await Assignment.findAll({
      where: {
        subjectId: subjectIds
      },
      include: [
        {
          model: Subject,
          attributes: ['name', 'code']
        },
        {
          model: Teacher,
          attributes: ['name']
        },
        {
          model: Submission,
          where: { studentId },
          required: false,
          attributes: ['id', 'status', 'grade', 'submittedAt']
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
});

// Teacher-specific routes
app.get('/api/teachers/:teacherId/students', adminAuth, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { Teacher, Subject, Student, TeacherSubject, Batch } = require('./models');
    
    // Get subjects assigned to this teacher
    const teacherSubjects = await TeacherSubject.findAll({
      where: { teacherId },
      include: [
        {
          model: Subject,
          attributes: ['id', 'batchId', 'name']
        }
      ]
    });

    if (teacherSubjects.length === 0) {
      return res.json([]);
    }

    // Get unique batch IDs from teacher's subjects
    const batchIds = [...new Set(teacherSubjects.map(ts => ts.Subject.batchId))];

    // Get students from those batches
    const students = await Student.findAll({
      where: {
        batch: batchIds
      },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Batch,
          attributes: ['name', 'department']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json(students);
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

app.get('/api/teachers/:teacherId/subjects', adminAuth, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { TeacherSubject, Subject, Semester, Batch } = require('./models');
    
    const teacherSubjects = await TeacherSubject.findAll({
      where: { teacherId },
      include: [
        {
          model: Subject,
          include: [
            {
              model: Semester,
              attributes: ['id', 'name', 'number']
            },
            {
              model: Batch,
              attributes: ['id', 'name', 'department']
            }
          ]
        }
      ]
    });

    const subjects = teacherSubjects.map(ts => ts.Subject);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Admin-only server is running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      field: err.errors[0]?.path
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Catch all other routes
app.use('*', (req, res) => {
  console.log(`❓ Unknown route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected');

    const port = 5003; // Match the port in environment config
    app.listen(port, () => {
      console.log(`\n🚀 Admin-Only Server running on http://localhost:${port}`);
      console.log(`📍 Admin login: POST http://localhost:${port}/api/auth/admin/login`);
      console.log(`💊 Health check: GET http://localhost:${port}/health`);
      console.log(`\n🔑 Credentials:`);
      console.log(`   Username: admin`);
      console.log(`   Password: admin123`);
      console.log(`\n✅ Frontend should now work with admin login!`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};

startServer();