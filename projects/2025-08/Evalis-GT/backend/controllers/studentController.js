const asyncHandler = require('express-async-handler');
const { Student, Submission, Batch, Subject, Assignment } = require('../models');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const { Op } = require('sequelize');
const { generateRandomPassword } = require('../utils/passwordUtils');
const { sendLoginCredentials, sendPasswordResetLink } = require('../utils/emailUtils');

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private/Admin
 */
const getStudents = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const batch = req.query.batch || null;
  const section = req.query.section || null;
  
  const filter = {};
  if (batch) filter.batch = batch;
  if (section) filter.section = section;

  const { count, rows: students } = await Student.findAndCountAll({
    where: filter,
    attributes: { exclude: ['password'] },
    limit: pageSize,
    offset: pageSize * (page - 1),
    order: [['id', 'ASC']]
  });

  res.json({
    students,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

/**
 * @desc    Get student by ID
 * @route   GET /api/students/:id
 * @access  Private/Admin or Teacher
 */
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ 
    where: { id: req.params.id },
    attributes: { exclude: ['password'] }
  });

  if (student) {
    res.json(student);
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

/**
 * @desc    Create a new student
 * @route   POST /api/students
 * @access  Private/Admin
 */
const createStudent = asyncHandler(async (req, res) => {
  try {
    console.log('Creating student with data:', { 
      ...req.body, 
      password: req.body.password ? '[REDACTED]' : undefined 
    });
    
    const { id, name, section, batch, email, password } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the student name'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the student email'
      });
    }

    if (!batch) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the student batch'
      });
    }

    // Check if student already exists
    const studentExists = await Student.findOne({ where: { id } });
    if (studentExists) {
      return res.status(400).json({
        success: false,
        message: 'Student already exists'
      });
    }

    // Check if email already exists
    const emailExists = await Student.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Check if user already exists in Clerk
    let clerkUser = null;
    try {
      const { clerkClient } = require('@clerk/express');
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
        const { clerkClient } = require('@clerk/express');
        clerkUser = await clerkClient.users.createUser({
          emailAddress: [email],
          username: email.split('@')[0] + '_student_' + Date.now(),
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
    const { generateSecurePassword, generateResetToken, sendWelcomeEmail } = require('../utils/emailUtils');
    const temporaryPassword = generateSecurePassword();
    
    // Hash password for database storage
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    console.log(`Creating student in database with ID: ${id}`);
    
    const student = await Student.create({
      id,
      name,
      section,
      batch,
      email,
      password: hashedPassword,
      clerkId: clerkUser.id // Link to Clerk user
    });

    // Generate password reset token
    const { PasswordResetToken } = require('../models');
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
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError.message);
      // Don't fail the creation if email fails
    }

    console.log(`Student created successfully: ${student.id}`);

    res.status(201).json({
      success: true,
      data: {
        id: student.id,
        name: student.name,
        section: student.section,
        batch: student.batch,
        email: student.email,
        clerkId: student.clerkId,
        message: 'Student created successfully in both database and Clerk. Welcome email sent with password setup instructions.'
      }
    });

  } catch (error) {
    console.error('Error in createStudent:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({
        success: false,
        message: 'Student with this ID or email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create student'
      });
    }
  }
});

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private/Admin
 */
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { id: req.params.id } });

  if (student) {
    const previousEmail = student.email;
    const newEmail = req.body.email;
    
    student.name = req.body.name || student.name;
    student.section = req.body.section || student.section;
    student.batch = req.body.batch || student.batch;
    student.email = newEmail || student.email;
    
    // If email is being added for the first time or changed
    let passwordChanged = false;
    let generatedPassword;
    
    if (newEmail && (!previousEmail || newEmail !== previousEmail)) {
      // Generate a new password when email is added or changed
      generatedPassword = generateRandomPassword(10);
      student.password = generatedPassword;
      passwordChanged = true;
    } else if (req.body.password) {
      // Or if password is explicitly provided
      student.password = req.body.password;
      passwordChanged = true;
      generatedPassword = req.body.password;
    }

    const updatedStudent = await student.save();

    // Send login credentials if email was added or changed (no Firebase operations)
    if (passwordChanged && newEmail) {
      try {
        // Send login credentials to the student
        await sendLoginCredentials(updatedStudent, generatedPassword);
        console.log(`Login credentials sent to ${newEmail}`);
      } catch (error) {
        console.error('Error sending login credentials:', error);
        // Continue even if email sending fails
      }
    }

    res.json({
      id: updatedStudent.id,
      name: updatedStudent.name,
      section: updatedStudent.section,
      batch: updatedStudent.batch,
      email: updatedStudent.email,
      initialPassword: passwordChanged && newEmail ? generatedPassword : undefined,
    });
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private/Admin
 */
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { id: req.params.id } });

  if (student) {
    console.log(`Deleting student: ${student.id} (${student.name})`);
    
    // Delete the student from database
    console.log(`Deleting student ${student.id} from database`);
    await student.destroy();
    
    console.log(`Student ${student.id} successfully deleted from system`);
    res.json({ 
      message: 'Student removed'
    });
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

/**
 * @desc    Get student submissions
 * @route   GET /api/students/:id/submissions
 * @access  Private/Admin or Teacher or Student (if own submissions)
 */
const getStudentSubmissions = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { id: req.params.id } });

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Check if the requesting user has permission to view these submissions
  if (req.user.role === 'student' && req.user.id !== req.params.id) {
    res.status(403);
    throw new Error('Not authorized to view these submissions');
  }

  const submissions = await Submission.findAll({
    where: { studentId: req.params.id },
    include: [
      {
        model: Subject,
        attributes: ['name'],
        required: true
      },
      {
        model: Assignment,
        attributes: ['title', 'description'],
        required: false
      }
    ],
    order: [['submissionDate', 'DESC']]
  });

  // Format the response to include subject name
  const formattedSubmissions = submissions.map(submission => ({
    ...submission.toJSON(),
    subjectName: submission.Subject.name
  }));

  res.json(formattedSubmissions);
});

/**
 * @desc    Get submissions for current authenticated student
 * @route   GET /api/students/submissions
 * @access  Private/Student
 */
const getCurrentStudentSubmissions = asyncHandler(async (req, res) => {
  const student = req.user; // From auth middleware

  const submissions = await Submission.findAll({
    where: { studentId: student.id },
    include: [
      {
        model: Subject,
        attributes: ['name'],
        required: true
      },
      {
        model: Assignment,
        attributes: ['title', 'description'],
        required: false
      }
    ],
    order: [['submissionDate', 'DESC']]
  });

  // Format the response to include subject name
  const formattedSubmissions = submissions.map(submission => ({
    ...submission.toJSON(),
    subjectName: submission.Subject.name
  }));

  res.json(formattedSubmissions);
});

/**
 * @desc    Get subjects for a student (independent of submissions)
 * @route   GET /api/students/:id/subjects
 * @access  Private (student self, teacher, or admin)
 */
const getStudentSubjects = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { id: req.params.id } });
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  console.log('[Diag:getStudentSubjects] START', { studentId: student.id, batch: student.batch, activeSemesterId: student.activeSemesterId });

  // Permission: student can view own, teacher/admin can view any
  if (req.user.role === 'student' && req.user.id !== req.params.id) {
    res.status(403);
    throw new Error('Not authorized to view these subjects');
  }

  // Base where clause: include subjects for student's batch OR legacy subjects with null batchId
  const whereClause = {
    [Op.or]: [
      { batchId: student.batch },
      { batchId: null } // Include legacy subjects not assigned to any batch
    ]
  };
  
  // If student has active semester, also filter by semester
  if (student.activeSemesterId) {
    whereClause[Op.and] = {
      [Op.or]: [
        { semesterId: student.activeSemesterId },
        { semesterId: null } // Include legacy subjects not assigned to any semester
      ]
    };
  }

  // Dynamically require to avoid circular reference issues
  const { Semester, Batch, Teacher } = require('../models');
  const subjects = await Subject.findAll({
    where: whereClause,
    include: [
      { model: Semester },
      { model: Batch },
      { model: Teacher, through: { attributes: [] } }
    ]
  });
  console.log('[Diag:getStudentSubjects] Subjects fetched', subjects.length);
  res.json(subjects);
  console.log('[Diag:getStudentSubjects] END');
});

/**
 * @desc    Get subjects for current authenticated student
 * @route   GET /api/students/subjects
 * @access  Private/Student
 */
const getCurrentStudentSubjects = asyncHandler(async (req, res) => {
  const student = req.user; // From auth middleware
  console.log('[Diag:getCurrentStudentSubjects] START', { studentId: student.id, batch: student.batch, activeSemesterId: student.activeSemesterId });

  // Base where clause: include subjects for student's batch OR legacy subjects with null batchId
  const whereClause = {
    [Op.or]: [
      { batchId: student.batch },
      { batchId: null } // Include legacy subjects not assigned to any batch
    ]
  };
  
  // If student has active semester, also filter by semester
  if (student.activeSemesterId) {
    whereClause[Op.and] = {
      [Op.or]: [
        { semesterId: student.activeSemesterId },
        { semesterId: null } // Include legacy subjects not assigned to any semester
      ]
    };
  }

  // Dynamically require to avoid circular reference issues
  const { Semester, Batch, Teacher } = require('../models');
  const subjects = await Subject.findAll({
    where: whereClause,
    include: [
      { model: Semester },
      { model: Batch },
      { model: Teacher, through: { attributes: [] } }
    ]
  });
  console.log('[Diag:getCurrentStudentSubjects] Subjects fetched', subjects.length);
  res.json(subjects);
  console.log('[Diag:getCurrentStudentSubjects] END');
});

/**
 * @desc    Import students from array
 * @route   POST /api/students/import
 * @access  Private/Admin
 */
const importStudents = asyncHandler(async (req, res) => {
  const { students, batch } = req.body;

  if (!students || !Array.isArray(students) || students.length === 0) {
    res.status(400);
    throw new Error('No students to import');
  }

  if (!batch) {
    res.status(400);
    throw new Error('Batch is required');
  }

  const importedStudents = [];
  const errors = [];

  for (const student of students) {
    try {
      const { id, name, section, email } = student;
      
      if (!id || !name || !section) {
        errors.push(`Missing required fields for student: ${JSON.stringify(student)}`);
        continue;
      }

      const studentExists = await Student.findOne({ where: { id } });

      if (studentExists) {
        errors.push(`Student with ID ${id} already exists`);
        continue;
      }

      // Generate random password if email is provided
      const password = email ? generateRandomPassword(10) : id;

      const newStudent = await Student.create({
        id,
        name,
        section,
        batch,
        email,
        password,
      });

      // Send email if provided
      if (email) {
        try {
          await sendLoginCredentials(newStudent, password);
          console.log(`Login credentials sent to ${email}`);
        } catch (emailError) {
          console.error(`Error sending email to ${email}:`, emailError);
          // Log but continue with imports
        }
      }

      importedStudents.push({
        id: newStudent.id,
        name: newStudent.name,
        section: newStudent.section,
        email: newStudent.email,
        initialPassword: email ? password : undefined,
      });
    } catch (error) {
      errors.push(`Error importing student ${student.id}: ${error.message}`);
    }
  }

  res.status(201).json({
    success: true,
    count: importedStudents.length,
    students: importedStudents,
    errors,
  });
});

/**
 * @desc    Import students from Excel file
 * @route   POST /api/students/import-excel
 * @access  Private/Admin
 */
const importStudentsFromExcel = asyncHandler(async (req, res) => {
  console.log('Import request received:', {
    files: req.files ? Object.keys(req.files) : 'No files',
    body: req.body,
    content_type: req.headers['content-type']
  });

  // Check if file is uploaded
  if (!req.files || !req.files.file) {
    res.status(400);
    throw new Error('Please upload an Excel file');
  }

  // Check if batchId is provided
  if (!req.body.batchId) {
    res.status(400);
    throw new Error('Batch ID is required');
  }

  // Verify that the batch exists
  const batch = await Batch.findByPk(req.body.batchId);
  if (!batch) {
    res.status(404);
    throw new Error(`Batch with ID ${req.body.batchId} not found`);
  }

  try {
    // Get the file buffer
    const file = req.files.file;
    console.log('File info:', {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype
    });

    // Check file type
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      res.status(400);
      throw new Error('Invalid file format. Please upload an Excel file (.xlsx, .xls) or CSV (.csv)');
    }

    let workbook;
    try {
      // Determine the type based on file extension
      const fileExt = file.name.split('.').pop().toLowerCase();
      let type = 'buffer';
      
      if (fileExt === 'csv') {
        // For CSV files, first convert to string then to sheet
        const csvString = file.data.toString('utf8');
        workbook = XLSX.read(csvString, { type: 'string' });
      } else {
        // For Excel files (.xlsx, .xls)
        workbook = XLSX.read(file.data, { type: 'buffer' });
      }
    } catch (error) {
      console.error('XLSX parsing error:', error);
      res.status(400);
      throw new Error(`Error parsing Excel file: ${error.message}`);
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      res.status(400);
      throw new Error('Excel file does not contain any sheets');
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      res.status(400);
      throw new Error('Could not read worksheet from Excel file');
    }
    
    let jsonData;
    try {
      jsonData = XLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
      console.error('JSON conversion error:', error);
      res.status(400);
      throw new Error(`Error converting sheet to JSON: ${error.message}`);
    }

    // Check if we have any data
    if (!jsonData || jsonData.length === 0) {
      res.status(400);
      throw new Error('Excel file contains no data');
    }

    console.log('First row example:', jsonData[0]);

    // Validate and prepare data
    const studentsToCreate = [];
    const studentsToUpdate = [];
    const errors = [];
    const studentEmails = []; // Collect emails for password reset

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Skip empty rows
      if (!row.id && !row.ID && !row.StudentId && !row.StudentID) {
        errors.push(`Row ${i + 2}: Missing required fields (id)`);
        continue;
      }

      // Create student object
      const studentData = {
        id: (row.id || row.ID || row.StudentId || row.StudentID || '').toString().trim(),
        name: (row.name || row.Name || row.StudentName || '').toString().trim(),
        section: (row.section || row.Section || '').toString().trim() || batch.id.split('-')[0] || 'CSE-1',
        batch: req.body.batchId,
        email: (row.email || row.Email || row.StudentEmail || '').toString().trim(),
        password: (row.id || row.ID || row.StudentId || row.StudentID || '').toString().trim(), // Default to student ID
      };

      // Validate student data
      if (!studentData.id) {
        errors.push(`Row ${i + 2}: Student ID is required`);
        continue;
      }

      if (!studentData.name) {
        errors.push(`Row ${i + 2}: Student name is required`);
        continue;
      }

      // Generate a default password (last 4 digits of student ID)
      if (studentData.id.length >= 4) {
        studentData.password = studentData.id.slice(-4);
      }

      // Add email to the collection for password reset if it exists
      if (studentData.email) {
        studentEmails.push(studentData.email);
      }

      // Check if student already exists
      try {
        const existingStudent = await Student.findOne({ where: { id: studentData.id } });
        
        if (existingStudent) {
          studentsToUpdate.push({
            id: studentData.id,
            update: {
              name: studentData.name,
              section: studentData.section,
              batch: studentData.batch,
              email: studentData.email || existingStudent.email,
            }
          });
        } else {
          studentsToCreate.push(studentData);
        }
      } catch (error) {
        console.error(`Error checking student ${studentData.id}:`, error);
        errors.push(`Row ${i + 2}: Error processing student: ${error.message}`);
      }
    }

    // Create new students
    if (studentsToCreate.length > 0) {
      try {
        const createdStudents = await Student.bulkCreate(studentsToCreate);
        
        // Send login credentials for students with emails (no Firebase operations)
        for (const student of createdStudents) {
          if (student.email) {
            try {
              // Generate a random password
              const generatedPassword = generateRandomPassword(10);
              
              // Update student password in database
              await student.update({ password: generatedPassword });
              
              // Send login credentials
              await sendLoginCredentials(student, generatedPassword);
              console.log(`Login credentials sent to ${student.email}`);
            } catch (error) {
              console.error(`Error sending credentials for student ${student.id}:`, error);
              errors.push(`Failed to send credentials for student ${student.id}: ${error.message}`);
              // Continue with next student
            }
          }
        }
      } catch (error) {
        console.error('Error creating students:', error);
        errors.push(`Failed to create students: ${error.message}`);
      }
    }

    // Update existing students
    for (const student of studentsToUpdate) {
      try {
        await Student.update(
          student.update,
          { where: { id: student.id } }
        );
      } catch (error) {
        console.error(`Error updating student ${student.id}:`, error);
        errors.push(`Failed to update student ${student.id}: ${error.message}`);
      }
    }

    const response = {
      message: 'Students imported successfully',
      totalImported: studentsToCreate.length + studentsToUpdate.length,
      created: studentsToCreate.length,
      updated: studentsToUpdate.length,
      emails: studentEmails, // Include emails for further processing
      errors: errors
    };

    console.log('Import response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Import error:', error);
    res.status(500);
    throw new Error('Error processing Excel file: ' + error.message);
  }
});

/**
 * @desc    Auth student & get token
 * @route   POST /api/students/login
 * @access  Public
 */
const authStudent = asyncHandler(async (req, res) => {
  const { id, password } = req.body;

  // Check for student
  const student = await Student.findOne({ where: { id } });

  if (student && (await student.matchPassword(password))) {
    res.json({
      id: student.id,
      name: student.name,
      section: student.section,
      batch: student.batch,
      email: student.email,
      role: student.role,
      token: generateToken(student.id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid ID or password');
  }
});

/**
 * @desc    Get student profile
 * @route   GET /api/students/profile
 * @access  Private/Student
 */
const getStudentProfile = asyncHandler(async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Batch,
          attributes: ['id', 'name', 'startYear', 'endYear', 'department']
        }
      ]
    });

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Get subjects associated with the student's batch
    const batchSubjects = await Subject.findAll({
      where: {
        batchId: student.batch
      },
      attributes: ['id', 'name', 'section', 'credits', 'description']
    });

    // Get subjects from the student's active semester if available
    let semesterSubjects = [];
    if (student.activeSemesterId) {
      semesterSubjects = await Subject.findAll({
        where: {
          semesterId: student.activeSemesterId
        },
        attributes: ['id', 'name', 'section', 'credits', 'description']
      });
    }

    // Combine both sets of subjects (removing duplicates by ID)
    const allSubjectIds = new Set();
    const allSubjects = [];

    // Add batch subjects first
    batchSubjects.forEach(subject => {
      if (!allSubjectIds.has(subject.id)) {
        allSubjectIds.add(subject.id);
        allSubjects.push(subject);
      }
    });

    // Add semester subjects next
    semesterSubjects.forEach(subject => {
      if (!allSubjectIds.has(subject.id)) {
        allSubjectIds.add(subject.id);
        allSubjects.push(subject);
      }
    });

    // Send the student data along with the subjects
    res.json({
      ...student.get({ plain: true }),
      subjects: allSubjects
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500);
    throw new Error('Server error fetching student profile');
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = {
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
  authStudent,
  getStudentProfile,
}; 