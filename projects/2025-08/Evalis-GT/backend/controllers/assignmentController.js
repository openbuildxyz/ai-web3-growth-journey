const asyncHandler = require('express-async-handler');
const { Assignment, Teacher, Subject, Submission, Student } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all assignments
 * @route   GET /api/assignments
 * @access  Private/Admin
 */
const getAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.findAll({
    include: [
      {
        model: Teacher,
        attributes: ['id', 'name']
      },
      {
        model: Subject,
        attributes: ['id', 'name', 'section']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  
  res.json(assignments);
});

/**
 * @desc    Get assignments for a student
 * @route   GET /api/assignments/student
 * @access  Private/Student
 */
const getStudentAssignments = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  console.log('[Diag:getStudentAssignments] START', { studentId });
  
  // Get the student's section, batch, and active semester info
  const student = await Student.findByPk(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Build a resilient subject query.
  // Primary intent: subjects in the student's batch AND (same active semester OR semester unset for legacy data).
  // Older rows may have null semesterId; some may have been created before semester feature.
  let subjects = await Subject.findAll({
    where: student.activeSemesterId ? {
      batchId: student.batch,
      [Op.or]: [
        { semesterId: student.activeSemesterId },
        { semesterId: null }
      ]
    } : {
      batchId: student.batch
    }
  });
  console.log('[Diag:getStudentAssignments] Subjects fetched (primary query)', subjects.length);

  // Fallback: if still nothing and student has activeSemesterId, try ignoring semester completely
  if (!subjects.length && student.activeSemesterId) {
    subjects = await Subject.findAll({ where: { batchId: student.batch } });
  console.log('[Diag:getStudentAssignments] Fallback subjects fetched (ignore semester)', subjects.length);
  }

  if (!subjects.length) return res.json([]); // No subjects => no assignments
  if (!subjects.length) {
    console.log('[Diag:getStudentAssignments] No subjects found for student', studentId, 'batch', student.batch, 'activeSemester', student.activeSemesterId);
    return res.json([]);
  }

  const subjectIds = subjects.map(subject => subject.id);

  // Get all assignments for these subjects
  const assignments = await Assignment.findAll({
    where: {
      subjectId: {
        [Op.in]: subjectIds
      }
    },
    include: [
      {
        model: Teacher,
        attributes: ['id', 'name']
      },
      {
        model: Subject,
        attributes: ['id', 'name', 'section', 'batchId', 'semesterId']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  console.log('[Diag:getStudentAssignments] Assignments fetched', assignments.length, { subjectIds });
  if (assignments.length === 0) {
    console.log('[Diag:getStudentAssignments] DEBUG DETAIL: student=', { id: student.id, batch: student.batch, activeSemesterId: student.activeSemesterId });
    console.log('[Diag:getStudentAssignments] DEBUG DETAIL: subjects meta=', subjects.map(s => ({ id: s.id, batchId: s.batchId, semesterId: s.semesterId })));
  }

  // Check if student has already submitted for each assignment
  const assignmentsWithSubmitStatus = await Promise.all(assignments.map(async (assignment) => {
    const submission = await Submission.findOne({
      where: {
        assignmentId: assignment.id,
        studentId
      }
    });

    return {
      ...assignment.toJSON(),
      submitted: !!submission,
      submissionId: submission ? submission.id : null,
      grade: submission ? submission.score : null,
      graded: submission ? submission.graded : false
    };
  }));
  
  res.json(assignmentsWithSubmitStatus);
  console.log('[Diag:getStudentAssignments] END', { count: assignmentsWithSubmitStatus.length });
});

/**
 * @desc    Get assignments for a specific student by ID
 * @route   GET /api/students/:id/assignments
 * @access  Private/Admin, Student (own only)
 */
const getStudentAssignmentsByParam = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  
  console.log('[Diag:getStudentAssignmentsByParam] Authorization check', { 
    studentId, 
    reqUserId: req.user.id, 
    reqUserRole: req.user.role 
  });
  
  // Check if user is admin or accessing their own assignments
  if (req.user.role !== 'admin' && req.user.role !== 'student') {
    res.status(403);
    throw new Error('Not authorized to access these assignments');
  }
  
  // If it's a student, verify they're accessing their own data
  // Note: studentId could be either database ID or Firebase UID
  if (req.user.role === 'student') {
    // Check if the studentId matches either the database ID or if this student ID exists and belongs to this user
    const requestedStudent = await Student.findByPk(studentId);
    if (!requestedStudent || requestedStudent.id !== req.user.id) {
      res.status(403);
      throw new Error('Students can only access their own assignments');
    }
  }
  
  console.log('[Diag:getStudentAssignmentsByParam] START', { studentId });
  
  // Get the student's section, batch, and active semester info
  const student = await Student.findByPk(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Build a resilient subject query.
  // Primary intent: subjects in the student's batch AND (same active semester OR semester unset for legacy data).
  // Older rows may have null semesterId; some may have been created before semester feature.
  let subjects = await Subject.findAll({
    where: student.activeSemesterId ? {
      batchId: student.batch,
      [Op.or]: [
        { semesterId: student.activeSemesterId },
        { semesterId: null }
      ]
    } : {
      batchId: student.batch
    }
  });
  console.log('[Diag:getStudentAssignmentsByParam] Subjects fetched (primary query)', subjects.length);

  // Fallback: if still nothing and student has activeSemesterId, try ignoring semester completely
  if (!subjects.length && student.activeSemesterId) {
    subjects = await Subject.findAll({ where: { batchId: student.batch } });
    console.log('[Diag:getStudentAssignmentsByParam] Fallback subjects fetched (ignore semester)', subjects.length);
  }

  if (!subjects.length) {
    console.log('[Diag:getStudentAssignmentsByParam] No subjects found for student', studentId, 'batch', student.batch, 'activeSemester', student.activeSemesterId);
    return res.json([]);
  }

  const subjectIds = subjects.map(subject => subject.id);

  // Get all assignments for these subjects
  const assignments = await Assignment.findAll({
    where: {
      subjectId: {
        [Op.in]: subjectIds
      }
    },
    include: [
      {
        model: Teacher,
        attributes: ['id', 'name']
      },
      {
        model: Subject,
        attributes: ['id', 'name', 'section', 'batchId', 'semesterId']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  console.log('[Diag:getStudentAssignmentsByParam] Assignments fetched', assignments.length, { subjectIds });
  
  if (assignments.length === 0) {
    console.log('[Diag:getStudentAssignmentsByParam] DEBUG DETAIL: student=', { id: student.id, batch: student.batch, activeSemesterId: student.activeSemesterId });
    console.log('[Diag:getStudentAssignmentsByParam] DEBUG DETAIL: subjects meta=', subjects.map(s => ({ id: s.id, batchId: s.batchId, semesterId: s.semesterId })));
  }

  // Check if student has already submitted for each assignment
  const assignmentsWithSubmitStatus = await Promise.all(assignments.map(async (assignment) => {
    const submission = await Submission.findOne({
      where: {
        assignmentId: assignment.id,
        studentId
      }
    });

    return {
      ...assignment.toJSON(),
      submitted: !!submission,
      submissionId: submission ? submission.id : null,
      grade: submission ? submission.score : null,
      graded: submission ? submission.graded : false
    };
  }));
  
  res.json(assignmentsWithSubmitStatus);
  console.log('[Diag:getStudentAssignmentsByParam] END', { count: assignmentsWithSubmitStatus.length });
});

/**
 * @desc    Get teacher's assignments
 * @route   GET /api/assignments/teacher
 * @access  Private/Teacher
 */
const getTeacherAssignments = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  
  const assignments = await Assignment.findAll({
    where: { teacherId },
    include: [
      {
        model: Subject,
        attributes: ['id', 'name', 'section']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  
  res.json(assignments);
});

/**
 * @desc    Get assignment by ID
 * @route   GET /api/assignments/:id
 * @access  Private
 */
const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByPk(req.params.id, {
    include: [
      {
        model: Teacher,
        attributes: ['id', 'name']
      },
      {
        model: Subject,
        attributes: ['id', 'name', 'section']
      }
    ]
  });

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Check permissions based on role
  const isAdmin = req.user.role === 'admin';
  const isTeacher = req.user.role === 'teacher';
  const isStudent = req.user.role === 'student';
  
  if (isAdmin) {
    // Admin can see all assignments
    res.json(assignment);
  } else if (isTeacher) {
    // Teacher can see their own assignments or assignments for subjects they teach
    if (assignment.teacherId === req.user.id) {
      res.json(assignment);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this assignment');
    }
  } else if (isStudent) {
    // Students can see assignments for their subjects
    const student = await Student.findByPk(req.user.id);
    
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }
    
    const subject = await Subject.findByPk(assignment.subjectId);
    
  // Authorize if the subject belongs to the same batch and either semester matches (or is null/legacy)
  if (subject && subject.batchId === student.batch && (!subject.semesterId || !student.activeSemesterId || subject.semesterId === student.activeSemesterId)) {
      // Check if student has submitted this assignment
      const submission = await Submission.findOne({
        where: {
          assignmentId: assignment.id,
          studentId: req.user.id
        }
      });
      
      res.json({
        ...assignment.toJSON(),
        submitted: !!submission,
        submissionId: submission ? submission.id : null,
        grade: submission ? submission.score : null,
        graded: submission ? submission.graded : false
      });
    } else {
      res.status(403);
      throw new Error('Not authorized to view this assignment');
    }
  } else {
    res.status(403);
    throw new Error('Not authorized to view this assignment');
  }
});

/**
 * @desc    Create a new assignment
 * @route   POST /api/assignments
 * @access  Private/Teacher
 */
const createAssignment = asyncHandler(async (req, res) => {
  console.log('Creating assignment with data:', {
    ...req.body,
    fileUrl: req.body.fileUrl ? 'EXISTS' : 'NOT PROVIDED'
  });
  
  const { title, description, subjectId, examType, dueDate, fileUrl } = req.body;

  if (!title || !subjectId || !examType) {
    console.log('Missing required fields:', { title, subjectId, examType });
    res.status(400);
    throw new Error('Please provide title, subjectId, and examType');
  }

  try {
    // Check if the teacher is assigned to this subject
    const teachesSubject = await Subject.findOne({
      include: [
        {
          model: Teacher,
          where: { id: req.user.id },
          through: { attributes: [] }
        }
      ],
      where: { id: subjectId }
    });

    if (!teachesSubject) {
      console.log('Teacher not authorized for subject:', {
        teacherId: req.user.id,
        subjectId
      });
      res.status(403);
      throw new Error('Not authorized to create assignments for this subject');
    }

    console.log('Creating assignment in database with data:', {
      title,
      teacherId: req.user.id,
      subjectId,
      examType,
      dueDate: dueDate || null,
      fileUrl: fileUrl || null
    });

    const assignment = await Assignment.create({
      title,
      description: description || '',
      subjectId,
      teacherId: req.user.id,
      examType,
      dueDate: dueDate || null,
      fileUrl: fileUrl || null
    });

    if (assignment) {
      console.log('Assignment created successfully:', assignment.id);
      res.status(201).json(assignment);
    } else {
      console.error('Failed to create assignment, no error but no result');
      res.status(400);
      throw new Error('Invalid assignment data');
    }
  } catch (error) {
    console.error('Error creating assignment in database:', error);
    res.status(500);
    throw new Error(`Database error: ${error.message}`);
  }
});

/**
 * @desc    Update assignment
 * @route   PUT /api/assignments/:id
 * @access  Private/Teacher (who created it)
 */
const updateAssignment = asyncHandler(async (req, res) => {
  const { title, description, examType, dueDate, fileUrl } = req.body;

  const assignment = await Assignment.findByPk(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Check if the teacher owns this assignment
  if (assignment.teacherId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this assignment');
  }

  // Update fields
  assignment.title = title || assignment.title;
  assignment.description = description !== undefined ? description : assignment.description;
  assignment.examType = examType || assignment.examType;
  assignment.dueDate = dueDate !== undefined ? dueDate : assignment.dueDate;
  assignment.fileUrl = fileUrl !== undefined ? fileUrl : assignment.fileUrl;
  
  const updatedAssignment = await assignment.save();

  res.json(updatedAssignment);
});

/**
 * @desc    Delete assignment
 * @route   DELETE /api/assignments/:id
 * @access  Private/Teacher (who created it) or Admin
 */
const deleteAssignment = asyncHandler(async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const assignment = await Assignment.findByPk(req.params.id, {
    include: [{ model: Submission }]
  });

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Check permissions
  if (req.user.role !== 'admin' && assignment.teacherId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this assignment');
  }

  try {
    // Delete assignment file if exists
    if (assignment.questionPaperUrl) {
      const assignmentFilePath = path.join(__dirname, '..', assignment.questionPaperUrl);
      if (fs.existsSync(assignmentFilePath)) {
        fs.unlinkSync(assignmentFilePath);
        console.log(`Deleted assignment file: ${assignmentFilePath}`);
      }
    }

    // Delete all submission files
    if (assignment.Submissions && assignment.Submissions.length > 0) {
      for (const submission of assignment.Submissions) {
        // Delete submission file
        if (submission.fileUrl) {
          const submissionFilePath = path.join(__dirname, '..', submission.fileUrl);
          if (fs.existsSync(submissionFilePath)) {
            fs.unlinkSync(submissionFilePath);
            console.log(`Deleted submission file: ${submissionFilePath}`);
          }
        }
        
        // Delete graded file if exists
        if (submission.gradedFileUrl) {
          const gradedFilePath = path.join(__dirname, '..', submission.gradedFileUrl);
          if (fs.existsSync(gradedFilePath)) {
            fs.unlinkSync(gradedFilePath);
            console.log(`Deleted graded file: ${gradedFilePath}`);
          }
        }
      }
      
      // Delete all submissions from database
      await Submission.destroy({
        where: { assignmentId: req.params.id }
      });
      console.log(`Deleted ${assignment.Submissions.length} submissions for assignment ${req.params.id}`);
    }

    // Finally delete the assignment
    await assignment.destroy();
    
    res.json({ 
      message: 'Assignment and all associated files removed successfully',
      deletedSubmissions: assignment.Submissions ? assignment.Submissions.length : 0
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500);
    throw new Error('Failed to delete assignment and associated files');
  }
});

/**
 * @desc    Get submissions for an assignment
 * @route   GET /api/assignments/:id/submissions
 * @access  Private/Teacher (who created it) or Admin
 */
const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByPk(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Check permissions
  if (req.user.role !== 'admin' && assignment.teacherId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view submissions for this assignment');
  }

  const submissions = await Submission.findAll({
    where: { assignmentId: req.params.id },
    include: [
      {
        model: Student,
        attributes: ['id', 'name', 'section', 'batch']
      }
    ],
    order: [['submissionDate', 'DESC']]
  });

  res.json(submissions);
});

module.exports = {
  getAssignments,
  getStudentAssignments,
  getStudentAssignmentsByParam,
  getTeacherAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions
}; 