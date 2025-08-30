const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentSubmissions,
  getCurrentStudentSubmissions,
  getStudentSubjects,
  getCurrentStudentSubjects,
  importStudents,
  importStudentsFromExcel,
  getStudentProfile
} = require('../controllers/studentController');
const { getStudentAssignmentsByParam } = require('../controllers/assignmentController');
const { protect, admin, student } = require('../middleware/authMiddleware');

// Student routes
router.route('/')
  .get(protect, admin, getStudents)
  .post(protect, admin, createStudent);

router.route('/profile')
  .get(protect, student, getStudentProfile);

router.route('/subjects')
  .get(protect, student, getCurrentStudentSubjects);

router.route('/submissions')
  .get(protect, student, getCurrentStudentSubmissions);

router.route('/import')
  .post(protect, admin, importStudents);

router.route('/import-excel')
  .post(protect, admin, importStudentsFromExcel);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, admin, updateStudent)
  .delete(protect, admin, deleteStudent);

router.route('/:id/submissions')
  .get(protect, getStudentSubmissions);

router.route('/:id/subjects')
  .get(protect, getStudentSubjects);

router.route('/:id/assignments')
  .get(protect, getStudentAssignmentsByParam);

module.exports = router; 