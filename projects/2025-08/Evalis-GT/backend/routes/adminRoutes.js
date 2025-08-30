const express = require('express');
const router = express.Router();
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
  createSubject,
  addStudentsBatch,
  addTeacher,
  assignSubjectToTeacher,
  getTeacherSubjectAssignments,
  generateSemestersForBatch,
  setActiveSemesterForStudent,
  setActiveSemesterForBatch
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const monitoringRoutes = require('./monitoringRoutes');
// Remove the adminUserRoutes import - we don't want Clerk user creation

// All routes use the protect middleware to ensure authentication
// and the admin middleware to ensure only admins can access these routes
router.use(protect);
router.use(admin);

// Mount monitoring routes
router.use('/', monitoringRoutes);

// Remove Clerk user management routes
// router.use('/users', adminUserRoutes);

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Batch management routes
router.get('/batches', getBatches);
router.post('/batches', createBatch);

// Teacher management routes
router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Student management routes
router.get('/students', getStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.post('/students/batch', addStudentsBatch);

// Subject management routes
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);

// Teacher-Subject assignment routes
router.post('/assign/subject', assignSubjectToTeacher);
router.get('/assignments', getTeacherSubjectAssignments);

// Semester management routes
router.post('/semesters/generate/:batchId', generateSemestersForBatch);
router.post('/semesters/:semesterId/student/:studentId', setActiveSemesterForStudent);
router.post('/semesters/:semesterId/batch/:batchId', setActiveSemesterForBatch);

module.exports = router; 