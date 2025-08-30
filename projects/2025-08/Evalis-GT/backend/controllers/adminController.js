const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { 
  Admin, 
  Student, 
  Teacher, 
  Batch, 
  Subject, 
  TeacherSubject, 
  Semester,
  PasswordResetToken
} = require('../models');
const { createSemestersForBatch } = require('../utils/seedData');
const { generateSecurePassword, generateResetToken, sendWelcomeEmail } = require('../utils/emailUtils');
const { clerkClient } = require('@clerk/express');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const [studentCount, teacherCount, batchCount, subjectCount] = await Promise.all([
      Student.count(),
      Teacher.count(),
      Batch.count(),
      Subject.count()
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalBatches: batchCount,
        totalSubjects: subjectCount
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

/**
 * @desc    Get all batches
 * @route   GET /api/admin/batches
 * @access  Private/Admin
 */
const getBatches = asyncHandler(async (req, res) => {
  try {
    const batches = await Batch.findAll({
      order: [['startYear', 'DESC']]
    });

    res.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches'
    });
  }
});

/**
 * @desc    Create a new batch
 * @route   POST /api/admin/batches
 * @access  Private/Admin
 */
const createBatch = asyncHandler(async (req, res) => {
  try {
    const { name, department, startYear, endYear, active = true } = req.body;

    if (!name || !department || !startYear || !endYear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, department, startYear, and endYear'
      });
    }

    // Check if batch already exists
    const existingBatch = await Batch.findOne({
      where: { name, startYear, endYear }
    });

    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'Batch with this name and years already exists'
      });
    }

    const batch = await Batch.create({
      name,
      department,
      startYear,
      endYear,
      active
    });

    res.status(201).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch'
    });
  }
});

/**
 * @desc    Get all teachers
 * @route   GET /api/admin/teachers
 * @access  Private/Admin
 */
const getTeachers = asyncHandler(async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Subject,
          through: { attributes: [] },
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers'
    });
  }
});

/**
 * @desc    Create a new teacher
 * @route   POST /api/admin/teachers
 * @access  Private/Admin
 */
const createTeacher = asyncHandler(async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and email'
      });
    }

    // Check if teacher already exists in database
    const existingTeacher = await Teacher.findOne({ where: { email } });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this email already exists'
      });
    }

    // Check if user already exists in Clerk
    let clerkUser = null;
    try {
      const existingClerkUsers = await clerkClient.users.getUserList({ emailAddress: [email] });
      if (existingClerkUsers && existingClerkUsers.length > 0) {
        clerkUser = existingClerkUsers[0];
      }
    } catch (clerkError) {
      console.warn('Error checking existing Clerk user:', clerkError.message);
    }

    // Create user in Clerk if doesn't exist
    if (!clerkUser) {
      try {
        clerkUser = await clerkClient.users.createUser({
          emailAddress: [email],
          username: email.split('@')[0] + '_teacher_' + Date.now(), // Generate unique username
          firstName: name.split(' ')[0] || name,
          lastName: name.split(' ').slice(1).join(' ') || undefined,
          skipPasswordChecks: true,
          skipPasswordRequirement: true
        });
        console.log(`Created Clerk user for teacher: ${email}`);
      } catch (clerkError) {
        console.error('Failed to create Clerk user:', clerkError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to create user account. Please try again.'
        });
      }
    }

    // Generate teacher ID
    const teacherId = await Teacher.generateTeacherId();
    
    // Generate secure temporary password
    const temporaryPassword = generateSecurePassword();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    // Create teacher in database
    const teacher = await Teacher.create({
      id: teacherId,
      name,
      email,
      password: hashedPassword,
      clerkId: clerkUser.id // Link to Clerk user
    });

    // Generate password reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token
    await PasswordResetToken.create({
      userId: teacher.id,
      userRole: 'teacher',
      token: resetToken,
      expiresAt
    });

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/teacher/reset-password?token=${resetToken}`;

    // Send welcome email with password setup
    try {
      await sendWelcomeEmail(
        { ...teacher.toJSON(), role: 'teacher' },
        temporaryPassword,
        resetLink
      );
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError.message);
      // Don't fail the creation if email fails
    }

    res.status(201).json({
      success: true,
      data: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        clerkId: teacher.clerkId,
        message: 'Teacher created successfully in both database and Clerk. Welcome email sent with password setup instructions.'
      }
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create teacher'
    });
  }
});

/**
 * @desc    Update teacher
 * @route   PUT /api/admin/teachers/:id
 * @access  Private/Admin
 */
const updateTeacher = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== teacher.email) {
      const existingTeacher = await Teacher.findOne({ where: { email } });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: 'Teacher with this email already exists'
        });
      }
    }

    await teacher.update({ name, email });

    res.json({
      success: true,
      data: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email
      }
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update teacher'
    });
  }
});

/**
 * @desc    Delete teacher
 * @route   DELETE /api/admin/teachers/:id
 * @access  Private/Admin
 */
const deleteTeacher = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    console.log(`Admin deleting teacher: ${teacher.id} (${teacher.name})`);
    
    // If teacher has an email, delete their Firebase account
    if (teacher.email) {
      try {
        console.log(`Attempting to delete Firebase user for email: ${teacher.email}`);
        const { deleteFirebaseUserByEmail } = require('../utils/firebaseUtils');
        
        const deleteResult = await deleteFirebaseUserByEmail(teacher.email);
        
        if (deleteResult.success) {
          console.log(`Firebase user deleted successfully for teacher ${teacher.id}: ${deleteResult.message}`);
        } else {
          console.warn(`Failed to delete Firebase user for teacher ${teacher.id}: ${deleteResult.error}`);
        }
      } catch (error) {
        console.error(`Error deleting Firebase user for teacher ${teacher.id}:`, error);
        // Continue with deletion even if Firebase operations fail
      }
    }

    await teacher.destroy();

    console.log(`Teacher ${teacher.id} successfully deleted by admin`);
    res.json({
      success: true,
      message: 'Teacher deleted successfully',
      firebaseDeleted: !!teacher.email
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete teacher'
    });
  }
});

/**
 * @desc    Get all students
 * @route   GET /api/admin/students
 * @access  Private/Admin
 */
const getStudents = asyncHandler(async (req, res) => {
  try {
    const { batch } = req.query;
    
    const whereClause = batch ? { batch } : {};
    
    const students = await Student.findAll({
      where: whereClause,
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
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

/**
 * @desc    Create a new student
 * @route   POST /api/admin/students
 * @access  Private/Admin
 */
const createStudent = asyncHandler(async (req, res) => {
  try {
    const { id, name, email, batch, section } = req.body;

    if (!id || !name || !email || !batch) {
      return res.status(400).json({
        success: false,
        message: 'Please provide id, name, email, and batch'
      });
    }

    // Check if student already exists in database
    const existingStudent = await Student.findByPk(id);
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this ID already exists'
      });
    }

    // Check if email already exists in database
    const existingEmail = await Student.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Check if batch exists
    const batchExists = await Batch.findByPk(batch);
    if (!batchExists) {
      return res.status(400).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if user already exists in Clerk
    let clerkUser = null;
    try {
      const existingClerkUsers = await clerkClient.users.getUserList({ emailAddress: [email] });
      if (existingClerkUsers && existingClerkUsers.length > 0) {
        clerkUser = existingClerkUsers[0];
      }
    } catch (clerkError) {
      console.warn('Error checking existing Clerk user:', clerkError.message);
    }

    // Create user in Clerk if doesn't exist
    if (!clerkUser) {
      try {
        clerkUser = await clerkClient.users.createUser({
          emailAddress: [email],
          username: email.split('@')[0] + '_student_' + Date.now(), // Generate unique username
          firstName: name.split(' ')[0] || name,
          lastName: name.split(' ').slice(1).join(' ') || undefined,
          skipPasswordChecks: true,
          skipPasswordRequirement: true
        });
        console.log(`Created Clerk user for student: ${email}`);
      } catch (clerkError) {
        console.error('Failed to create Clerk user:', clerkError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to create user account. Please try again.'
        });
      }
    }

    // Generate secure temporary password
    const temporaryPassword = generateSecurePassword();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    // Create student in database
    const student = await Student.create({
      id,
      name,
      email,
      batch,
      section,
      password: hashedPassword,
      clerkId: clerkUser.id // Link to Clerk user
    });

    // Generate password reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token
    await PasswordResetToken.create({
      userId: student.id,
      userRole: 'student',
      token: resetToken,
      expiresAt
    });

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/reset-password?token=${resetToken}`;

    // Send welcome email with password setup
    try {
      await sendWelcomeEmail(
        { ...student.toJSON(), role: 'student' },
        temporaryPassword,
        resetLink
      );
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError.message);
      // Don't fail the creation if email fails
    }

    res.status(201).json({
      success: true,
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        batch: student.batch,
        section: student.section,
        clerkId: student.clerkId,
        message: 'Student created successfully in both database and Clerk. Welcome email sent with password setup instructions.'
      }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student'
    });
  }
});

/**
 * @desc    Update student
 * @route   PUT /api/admin/students/:id
 * @access  Private/Admin
 */
const updateStudent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, batch, section } = req.body;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if batch exists if being updated
    if (batch && batch !== student.batch) {
      const batchExists = await Batch.findByPk(batch);
      if (!batchExists) {
        return res.status(400).json({
          success: false,
          message: 'Batch not found'
        });
      }
    }

    await student.update({ name, email, batch, section });

    res.json({
      success: true,
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        batch: student.batch,
        section: student.section
      }
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student'
    });
  }
});

/**
 * @desc    Delete student
 * @route   DELETE /api/admin/students/:id
 * @access  Private/Admin
 */
const deleteStudent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    console.log(`Admin deleting student: ${student.id} (${student.name})`);
    
    // If student has an email, delete their Firebase account
    if (student.email) {
      try {
        console.log(`Attempting to delete Firebase user for email: ${student.email}`);
        const { deleteFirebaseUserByEmail } = require('../utils/firebaseUtils');
        
        const deleteResult = await deleteFirebaseUserByEmail(student.email);
        
        if (deleteResult.success) {
          console.log(`Firebase user deleted successfully for student ${student.id}: ${deleteResult.message}`);
        } else {
          console.warn(`Failed to delete Firebase user for student ${student.id}: ${deleteResult.error}`);
        }
      } catch (error) {
        console.error(`Error deleting Firebase user for student ${student.id}:`, error);
        // Continue with deletion even if Firebase operations fail
      }
    }

    await student.destroy();

    console.log(`Student ${student.id} successfully deleted by admin`);
    res.json({
      success: true,
      message: 'Student deleted successfully',
      firebaseDeleted: !!student.email
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student'
    });
  }
});

/**
 * @desc    Get all subjects
 * @route   GET /api/admin/subjects
 * @access  Private/Admin
 */
const getSubjects = asyncHandler(async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      include: [
        {
          model: Batch,
          attributes: ['name', 'department']
        },
        {
          model: Semester,
          attributes: ['name', 'number']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects'
    });
  }
});

/**
 * @desc    Create a new subject
 * @route   POST /api/admin/subjects
 * @access  Private/Admin
 */
const createSubject = asyncHandler(async (req, res) => {
  try {
    const { id, name, code, section, description, credits, batchId, semesterId } = req.body;

    if (!name || !section) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and section'
      });
    }

    // Check if batch exists if provided
    if (batchId) {
      const batchExists = await Batch.findByPk(batchId);
      if (!batchExists) {
        return res.status(400).json({
          success: false,
          message: 'Batch not found'
        });
      }
    }

    // Check if semester exists if provided
    if (semesterId) {
      const semesterExists = await Semester.findByPk(semesterId);
      if (!semesterExists) {
        return res.status(400).json({
          success: false,
          message: 'Semester not found'
        });
      }
    }

    const subject = await Subject.create({
      id,
      name,
      code,
      section,
      description,
      credits: credits || 3,
      batchId,
      semesterId
    });

    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subject'
    });
  }
});

/**
 * @desc    Add students in batch
 * @route   POST /api/admin/students/batch
 * @access  Private/Admin
 */
const addStudentsBatch = asyncHandler(async (req, res) => {
  const { students, batchId, semesterId } = req.body;

  if (!students || !Array.isArray(students) || students.length === 0) {
    res.status(400);
    throw new Error('Please provide a non-empty array of students');
  }

  if (!batchId) {
    res.status(400);
    throw new Error('Batch ID is required');
  }

  // Validate batch exists
  const batch = await Batch.findByPk(batchId);
  if (!batch) {
    res.status(404);
    throw new Error(`Batch with ID ${batchId} not found`);
  }

  // Validate semester if provided
  let semester = null;
  if (semesterId) {
    semester = await Semester.findByPk(semesterId);
    if (!semester) {
      res.status(404);
      throw new Error(`Semester with ID ${semesterId} not found`);
    }
    
    // Check if semester belongs to the specified batch
    if (semester.batchId !== batchId) {
      res.status(400);
      throw new Error(`Semester ${semesterId} does not belong to the specified batch ${batchId}`);
    }
    
    console.log(`Using semester ${semester.name} (${semesterId}) for new students`);
  } else {
    // Try to find the active semester for this batch
    const activeSemester = await Semester.findOne({
      where: {
        batchId,
        active: true
      },
      order: [['number', 'DESC']]
    });
    
    if (activeSemester) {
      semester = activeSemester;
      console.log(`Using active semester ${activeSemester.name} (${activeSemester.id}) for new students`);
    } else {
      console.log(`No active semester found for batch ${batchId}. Students will be created without a semester assignment.`);
    }
  }

  const createdStudents = [];
  const errors = [];

  // Create students in transaction
  for (const studentData of students) {
    try {
      const { id, name, section, email, password } = studentData;
      
      // Check if student already exists
      const existingStudent = await Student.findByPk(id);
      if (existingStudent) {
        errors.push({ id, error: 'Student with this ID already exists' });
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create student
      const student = await Student.create({
        id,
        name,
        section,
        batch: batchId,
        email,
        password: hashedPassword,
        activeSemesterId: semester ? semester.id : null
      });

      createdStudents.push({
        id: student.id,
        name: student.name,
        section: student.section,
        email: student.email,
        batch: student.batch,
        activeSemester: semester ? {
          id: semester.id,
          name: semester.name,
          number: semester.number
        } : null
      });
    } catch (error) {
      errors.push({ 
        id: studentData.id, 
        error: `Failed to create student: ${error.message}` 
      });
    }
  }

  res.status(201).json({
    success: true,
    count: createdStudents.length,
    data: createdStudents,
    errors: errors.length > 0 ? errors : undefined
  });
});

/**
 * @desc    Add teacher
 * @route   POST /api/admin/teachers
 * @access  Private/Admin
 */
const addTeacher = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate inputs
  if (!name || !email) {
    res.status(400);
    throw new Error('Please provide name and email');
  }

  // Check if teacher with this email already exists
  const existingTeacher = await Teacher.findOne({ where: { email } });
  if (existingTeacher) {
    res.status(400);
    throw new Error('Teacher with this email already exists');
  }

  // Generate teacher ID
  const teacherId = await Teacher.generateTeacherId();
  
  // Generate password if not provided
  const teacherPassword = password || Teacher.generatePassword(teacherId);

  // Create teacher
  const teacher = await Teacher.create({
    id: teacherId,
    name,
    email,
    password: teacherPassword
  });

  res.status(201).json({
    success: true,
    data: {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email
    }
  });
});

/**
 * @desc    Assign subject to teacher for a semester
 * @route   POST /api/admin/assign/subject
 * @access  Private/Admin
 */
const assignSubjectToTeacher = asyncHandler(async (req, res) => {
  const { teacherId, subjectId } = req.body;

  // Validate teacher exists
  const teacher = await Teacher.findByPk(teacherId);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  // Validate subject exists with its semester information
  const subject = await Subject.findByPk(subjectId, {
    include: [
      {
        model: Semester,
        attributes: ['id', 'name', 'number']
      }
    ]
  });
  
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  // Log the subject assignment details
  console.log(`Assigning subject ${subject.name} (${subjectId}) to teacher ${teacher.name} (${teacherId})`);
  
  if (subject.Semester) {
    console.log(`Subject is part of semester: ${subject.Semester.name} (${subject.Semester.id})`);
  } else {
    console.log('Warning: Subject does not have an associated semester');
  }

  // Check if assignment already exists
  const existingAssignment = await TeacherSubject.findOne({
    where: {
      teacherId,
      subjectId
    }
  });

  if (existingAssignment) {
    res.status(400);
    throw new Error('Teacher is already assigned to this subject');
  }

  // Create teacher-subject assignment
  const assignment = await TeacherSubject.create({
    teacherId,
    subjectId
  });

  // Return comprehensive information about the assignment
  const assignmentDetails = {
    id: assignment.id,
    teacherId: assignment.teacherId,
    teacherName: teacher.name,
    subjectId: assignment.subjectId,
    subjectName: subject.name,
    subjectSection: subject.section,
    semester: subject.Semester ? {
      id: subject.Semester.id,
      name: subject.Semester.name,
      number: subject.Semester.number
    } : null,
    createdAt: assignment.createdAt
  };

  res.status(201).json({
    success: true,
    data: assignmentDetails
  });
});

/**
 * @desc    Get teacher-subject assignments
 * @route   GET /api/admin/assignments
 * @access  Private/Admin
 */
const getTeacherSubjectAssignments = asyncHandler(async (req, res) => {
  // Get all teacher-subject assignments with related teacher and subject details
  const assignments = await TeacherSubject.findAll({
    include: [
      {
        model: Teacher,
        attributes: ['id', 'name', 'email']
      },
      {
        model: Subject,
        include: [
          {
            model: Semester,
            attributes: ['id', 'name', 'number']
          }
        ]
      }
    ]
  });

  // Process the data to make it more frontend-friendly
  const processedAssignments = assignments.map(assignment => ({
    id: assignment.id,
    teacherId: assignment.teacherId,
    teacherName: assignment.Teacher ? assignment.Teacher.name : 'Unknown',
    teacherEmail: assignment.Teacher ? assignment.Teacher.email : '',
    subjectId: assignment.subjectId,
    subjectName: assignment.Subject ? assignment.Subject.name : 'Unknown',
    subjectSection: assignment.Subject ? assignment.Subject.section : '',
    semester: assignment.Subject && assignment.Subject.Semester ? {
      id: assignment.Subject.Semester.id,
      name: assignment.Subject.Semester.name,
      number: assignment.Subject.Semester.number
    } : null,
    createdAt: assignment.createdAt
  }));

  res.json({
    count: processedAssignments.length,
    assignments: processedAssignments
  });
});

/**
 * @desc    Generate semesters 1-8 for a batch
 * @route   POST /api/admin/semesters/generate/:batchId
 * @access  Private/Admin
 */
const generateSemestersForBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  
  // Call the utility function to create semesters
  const result = await createSemestersForBatch(batchId);
  
  if (!result.success) {
    res.status(400);
    throw new Error(result.message);
  }
  
  res.status(201).json(result);
});

/**
 * @desc    Set active semester for a student
 * @route   POST /api/admin/semesters/:semesterId/student/:studentId
 * @access  Private/Admin
 */
const setActiveSemesterForStudent = asyncHandler(async (req, res) => {
  const { semesterId, studentId } = req.params;
  
  // Validate semester exists
  const semester = await Semester.findByPk(semesterId);
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }
  
  // Validate student exists
  const student = await Student.findByPk(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  
  // Check if student belongs to the batch that the semester belongs to
  if (student.batch !== semester.batchId) {
    res.status(400);
    throw new Error('Student does not belong to the batch of this semester');
  }
  
  // Update student's active semester
  student.activeSemesterId = semesterId;
  await student.save();
  
  res.json({
    success: true,
    message: `Active semester for student ${studentId} updated to ${semester.name}`,
    data: {
      studentId,
      studentName: student.name,
      semesterId,
      semesterName: semester.name,
      semesterNumber: semester.number
    }
  });
});

/**
 * @desc    Set active semester for all students in a batch
 * @route   POST /api/admin/semesters/:semesterId/batch/:batchId
 * @access  Private/Admin
 */
const setActiveSemesterForBatch = asyncHandler(async (req, res) => {
  const { semesterId, batchId } = req.params;
  
  // Validate semester exists
  const semester = await Semester.findByPk(semesterId);
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }
  
  // Validate batch exists
  const batch = await Batch.findByPk(batchId);
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found');
  }
  
  // Check if semester belongs to the batch
  if (semester.batchId !== batchId) {
    res.status(400);
    throw new Error('Semester does not belong to this batch');
  }
  
  // Get all students in the batch
  const students = await Student.findAll({
    where: { batch: batchId }
  });
  
  if (students.length === 0) {
    res.status(404);
    throw new Error('No students found in this batch');
  }
  
  // Update all students' active semester
  const updatedCount = await Student.update(
    { activeSemesterId: semesterId },
    { where: { batch: batchId } }
  );
  
  // Set this semester as active and others as inactive for this batch
  await Semester.update(
    { active: false },
    { where: { batchId } }
  );
  
  await Semester.update(
    { active: true },
    { where: { id: semesterId } }
  );
  
  res.json({
    success: true,
    message: `Active semester for ${updatedCount[0]} students in batch ${batch.name} updated to ${semester.name}`,
    data: {
      batchId,
      batchName: batch.name,
      semesterId,
      semesterName: semester.name,
      semesterNumber: semester.number,
      studentsUpdated: updatedCount[0]
    }
  });
});

module.exports = {
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
}; 