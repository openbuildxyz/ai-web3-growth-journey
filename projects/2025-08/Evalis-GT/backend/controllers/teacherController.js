const asyncHandler = require('express-async-handler');
const { Teacher, Subject, TeacherSubject, Student, Batch, Semester } = require('../models');
const XLSX = require('xlsx');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * @desc    Get all teachers
 * @route   GET /api/teachers
 * @access  Private/Admin
 */
const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.findAll({
    attributes: { exclude: ['password'] },
    include: [{
      model: Subject,
      through: { attributes: [] }, // Don't include join table attributes
    }]
  });
  res.json(teachers);
});

/**
 * @desc    Get teacher by ID
 * @route   GET /api/teachers/:id
 * @access  Private/Admin
 */
const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ 
    where: { id: req.params.id },
    attributes: { exclude: ['password'] },
    include: [{
      model: Subject,
      through: { attributes: [] }, // Don't include join table attributes
    }]
  });

  if (teacher) {
    res.json(teacher);
  } else {
    res.status(404);
    throw new Error('Teacher not found');
  }
});

/**
 * @desc    Create a new teacher
 * @route   POST /api/teachers
 * @access  Private/Admin
 */
const createTeacher = asyncHandler(async (req, res) => {
  try {
    console.log('Teacher creation request received');
    console.log('Request body:', req.body);
    
    const { name, email, subjects, password, role } = req.body;
    let { id } = req.body;

    console.log('Extracted fields:', { id, name, email, subjectsLength: subjects?.length });

    // Validate required fields
    if (!name) {
      console.log('Missing required name field');
      return res.status(400).json({
        success: false,
        message: 'Please provide the teacher name'
      });
    }

    if (!email) {
      console.log('Missing required email field');
      return res.status(400).json({
        success: false,
        message: 'Please provide the teacher email'
      });
    }

    // Generate teacher ID if not provided
    if (!id) {
      id = await Teacher.generateTeacherId();
      console.log('Generated teacher ID:', id);
    }

    // Check if teacher already exists
    const teacherExists = await Teacher.findOne({ where: { id } });
    if (teacherExists) {
      console.log('Teacher already exists with id:', id);
      return res.status(400).json({
        success: false,
        message: 'Teacher already exists'
      });
    }

    // Check if email already exists
    const emailExists = await Teacher.findOne({ where: { email } });
    if (emailExists) {
      console.log('Email already in use:', email);
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
          username: email.split('@')[0] + '_teacher_' + Date.now(),
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

    // Generate secure temporary password
    const { generateSecurePassword, generateResetToken, sendWelcomeEmail } = require('../utils/emailUtils');
    const temporaryPassword = generateSecurePassword();
    
    // Hash password for database storage
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    console.log('Creating teacher in database...');
    // Create the teacher
    const teacher = await Teacher.create({
      id,
      name,
      email,
      password: hashedPassword,
      role: role || 'teacher',
      clerkId: clerkUser.id // Link to Clerk user
    });

    // If subjects were provided, assign them
    if (subjects && subjects.length > 0) {
      // Create teacher-subject associations
      const subjectAssociations = subjects.map(subjectId => ({
        teacherId: id,
        subjectId: subjectId
      }));
      
      await TeacherSubject.bulkCreate(subjectAssociations);
      
      // Reload teacher with subjects
      await teacher.reload({
        include: [{
          model: Subject,
          through: { attributes: [] }
        }]
      });
    }

    // Generate password reset token
    const { PasswordResetToken } = require('../models');
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
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError.message);
      // Don't fail the creation if email fails
    }

    console.log('Teacher created successfully:', teacher.id);

    res.status(201).json({
      success: true,
      data: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        subjects: teacher.Subjects || [],
        role: teacher.role,
        clerkId: teacher.clerkId,
        message: 'Teacher created successfully in both database and Clerk. Welcome email sent with password setup instructions.'
      }
    });

  } catch (error) {
    console.error('Error in createTeacher:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({
        success: false,
        message: 'Teacher with this ID or email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create teacher'
      });
    }
  }
});

/**
 * @desc    Update teacher
 * @route   PUT /api/teachers/:id
 * @access  Private/Admin
 */
const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ where: { id: req.params.id } });

  if (teacher) {
    const previousEmail = teacher.email;
    const newEmail = req.body.email;
    
    teacher.name = req.body.name || teacher.name;
    teacher.email = newEmail || teacher.email;
    
    // If email is being added for the first time or changed
    let passwordChanged = false;
    let generatedPassword;
    
    if (newEmail && (!previousEmail || newEmail !== previousEmail)) {
      // Import generateRandomPassword
      const { generateRandomPassword } = require('../utils/passwordUtils');
      
      // Generate a new password when email is added or changed
      generatedPassword = generateRandomPassword(10);
      teacher.password = generatedPassword;
      passwordChanged = true;
    } else if (req.body.password) {
      // Or if password is explicitly provided
      teacher.password = req.body.password;
      passwordChanged = true;
      generatedPassword = req.body.password;
    }

    const updatedTeacher = await teacher.save();

    // Update subjects if provided
    if (req.body.subjects) {
      // First remove all existing associations
      await TeacherSubject.destroy({ where: { teacherId: teacher.id } });
      
      // Then create new associations
      if (req.body.subjects.length > 0) {
        const subjectAssociations = req.body.subjects.map(subjectId => ({
          teacherId: teacher.id,
          subjectId: subjectId
        }));
        
        await TeacherSubject.bulkCreate(subjectAssociations);
      }
    }

    // Send login credentials if email was added or changed and create Firebase user
    if (passwordChanged && newEmail) {
      try {
        // Import Firebase functions
        const { createFirebaseUser, updateFirebaseUser, sendPasswordResetEmail } = require('../utils/firebaseUtils');
        const { sendPasswordResetLink, sendLoginCredentials } = require('../utils/emailUtils');
        
        // If changing email, first try to find if a Firebase user already exists
        let firebaseUser;
        try {
          if (previousEmail) {
            // Try to update the existing Firebase user with the new email
            firebaseUser = await updateFirebaseUser(null, { 
              email: newEmail,
              password: generatedPassword
            });
          }
        } catch (error) {
          console.log('No existing Firebase user to update, creating new one');
        }
        
        // If no existing user or couldn't update, create a new Firebase user
        if (!firebaseUser) {
          firebaseUser = await createFirebaseUser(newEmail, generatedPassword, {
            id: updatedTeacher.id,
            name: updatedTeacher.name,
          });
        }
        
        // Generate password reset link
        const resetLink = await sendPasswordResetEmail(newEmail);
        
        // Send password reset email
        await sendPasswordResetLink({
          email: newEmail,
          name: updatedTeacher.name,
        }, resetLink);
        
        console.log(`Firebase user updated/created and password reset link sent to ${newEmail}`);
        
        // Also send login credentials for reference
        await sendLoginCredentials({
          id: updatedTeacher.id,
          name: updatedTeacher.name,
          email: newEmail
        }, generatedPassword);
      } catch (error) {
        console.error('Error with Firebase operations:', error);
        // Continue even if Firebase operations fail
      }
    }

    // Reload teacher with updated subjects
    const teacherWithSubjects = await Teacher.findOne({
      where: { id: teacher.id },
      attributes: { exclude: ['password'] },
      include: [{
        model: Subject,
        through: { attributes: [] }
      }]
    });

    res.json({
      ...teacherWithSubjects.get(),
      initialPassword: passwordChanged && newEmail ? generatedPassword : undefined,
    });
  } else {
    res.status(404);
    throw new Error('Teacher not found');
  }
});

/**
 * @desc    Delete teacher
 * @route   DELETE /api/teachers/:id
 * @access  Private/Admin
 */
const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ where: { id: req.params.id } });

  if (teacher) {
    console.log(`Deleting teacher: ${teacher.id} (${teacher.name})`);
    
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
    } else {
      console.log(`Teacher ${teacher.id} has no email, skipping Firebase deletion`);
    }
    
    // First delete all teacher-subject associations
    console.log(`Deleting teacher-subject associations for teacher ${teacher.id}`);
    await TeacherSubject.destroy({ where: { teacherId: teacher.id } });
    
    // Then delete the teacher from database
    console.log(`Deleting teacher ${teacher.id} from database`);
    await teacher.destroy();
    
    console.log(`Teacher ${teacher.id} successfully deleted from system and Firebase`);
    res.json({ 
      message: 'Teacher removed', 
      firebaseDeleted: !!teacher.email 
    });
  } else {
    res.status(404);
    throw new Error('Teacher not found');
  }
});

/**
 * @desc    Assign subject to teacher
 * @route   POST /api/teachers/:id/subjects
 * @access  Private/Admin
 */
const assignSubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.body;
  
  if (!subjectId) {
    res.status(400);
    throw new Error('Subject ID is required');
  }
  
  const teacher = await Teacher.findOne({ where: { id: req.params.id } });
  
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  
  const subject = await Subject.findByPk(subjectId);
  
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  
  // Check if subject is already assigned
  const existingAssignment = await TeacherSubject.findOne({
    where: {
      teacherId: teacher.id,
      subjectId: subject.id
    }
  });
  
  if (existingAssignment) {
    res.status(400);
    throw new Error('Subject already assigned to this teacher');
  }
  
  // Create the association
  await TeacherSubject.create({
    teacherId: teacher.id,
    subjectId: subject.id
  });
  
  // Get updated teacher with subjects
  const updatedTeacher = await Teacher.findOne({
    where: { id: teacher.id },
    attributes: { exclude: ['password'] },
    include: [{
      model: Subject,
      through: { attributes: [] }
    }]
  });
  
  res.json(updatedTeacher);
});

/**
 * @desc    Remove subject from teacher
 * @route   DELETE /api/teachers/:id/subjects/:subjectId
 * @access  Private/Admin
 */
const removeSubject = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ where: { id: req.params.id } });
  
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  
  const subjectId = req.params.subjectId;
  const subject = await Subject.findByPk(subjectId);
  
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  
  // Check if teacher has this subject
  const assignment = await TeacherSubject.findOne({
    where: {
      teacherId: teacher.id,
      subjectId: subject.id
    }
  });
  
  if (!assignment) {
    res.status(400);
    throw new Error('This subject is not assigned to this teacher');
  }
  
  // Remove the association
  await assignment.destroy();
  
  // Get updated teacher with subjects
  const updatedTeacher = await Teacher.findOne({
    where: { id: teacher.id },
    attributes: { exclude: ['password'] },
    include: [{
      model: Subject,
      through: { attributes: [] }
    }]
  });
  
  res.json(updatedTeacher);
});

/**
 * @desc    Import teachers from Excel file
 * @route   POST /api/teachers/import-excel
 * @access  Private/Admin
 */
const importTeachersFromExcel = asyncHandler(async (req, res) => {
  // Check if file is uploaded
  if (!req.files || !req.files.file) {
    res.status(400);
    throw new Error('Please upload an Excel file');
  }

  try {
    // Get the file buffer
    const file = req.files.file;
    const workbook = XLSX.read(file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validate and prepare data
    const teachersToCreate = [];
    const teachersToUpdate = [];
    const errors = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Skip empty rows
      if (!row.TeacherID && !row.ID) {
        errors.push(`Row ${i + 2}: Missing required field (TeacherID/ID)`);
        continue;
      }

      if (!row.Name && !row.TeacherName) {
        errors.push(`Row ${i + 2}: Missing required field (Name/TeacherName)`);
        continue;
      }

      if (!row.Email && !row.TeacherEmail) {
        errors.push(`Row ${i + 2}: Missing required field (Email/TeacherEmail)`);
        continue;
      }

      // Get field values (handle different column naming conventions)
      const teacherId = (row.TeacherID || row.ID || '').toString().trim();
      const teacherName = (row.Name || row.TeacherName || '').toString().trim();
      const teacherEmail = (row.Email || row.TeacherEmail || '').toString().trim();
      
      // Generate password (last 4 digits of ID)
      const defaultPassword = teacherId.slice(-4);
      
      // Create teacher object
      const teacherData = {
        id: teacherId,
        name: teacherName,
        email: teacherEmail,
        password: defaultPassword,
        role: 'teacher'
      };

      // Check if teacher already exists
      const existingTeacher = await Teacher.findOne({ where: { id: teacherData.id } });
      if (existingTeacher) {
        teachersToUpdate.push({
          id: teacherData.id,
          update: {
            name: teacherData.name,
            email: teacherData.email,
          }
        });
      } else {
        teachersToCreate.push(teacherData);
      }
    }

    // Create new teachers
    if (teachersToCreate.length > 0) {
      await Teacher.bulkCreate(teachersToCreate);
    }

    // Update existing teachers
    for (const teacher of teachersToUpdate) {
      await Teacher.update(
        teacher.update,
        { where: { id: teacher.id } }
      );
    }

    // Send confirmation emails (in a real application)
    // This would be handled by a separate service

    res.status(200).json({
      message: 'Teachers imported successfully',
      totalImported: teachersToCreate.length + teachersToUpdate.length,
      created: teachersToCreate.length,
      updated: teachersToUpdate.length,
      errors: errors
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500);
    throw new Error('Error processing Excel file: ' + error.message);
  }
});

/**
 * @desc    Auth teacher & get token
 * @route   POST /api/teachers/login
 * @access  Public
 */
const authTeacher = asyncHandler(async (req, res) => {
  const { id, password } = req.body;

  const teacher = await Teacher.findOne({ 
    where: { id },
    include: [{
      model: Subject,
      through: { attributes: [] }
    }]
  });

  if (teacher && (await teacher.matchPassword(password))) {
    res.json({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      subjects: teacher.Subjects || [],
      role: teacher.role,
      token: generateToken(teacher.id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid ID or password');
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

/**
 * @desc    Get students by teacher ID based on subjects taught
 * @route   GET /api/teachers/:id/students
 * @access  Private/Teacher
 */
const getStudentsByTeacher = asyncHandler(async (req, res) => {
  try {
    // Ensure all required models are available
    if (!Teacher || !Subject || !Student) {
      console.error('Required models not available', { 
        Teacher: !!Teacher, 
        Subject: !!Subject, 
        Student: !!Student,
        Batch: !!Batch 
      });
      res.status(500);
      throw new Error('Server configuration error - required models not available');
    }
    
    // Get the teacher ID from the request
    const teacherId = req.params.id;
    console.log(`Getting students for teacher ID: ${teacherId}`);
    
    // Verify the teacher exists
    const teacher = await Teacher.findByPk(teacherId, {
      include: [{
        model: Subject,
        through: { attributes: [] }
      }]
    });
    
    if (!teacher) {
      console.log(`Teacher with ID ${teacherId} not found`);
      res.status(404);
      throw new Error('Teacher not found');
    }

    console.log(`Found teacher: ${teacher.name}, with ${teacher.Subjects ? teacher.Subjects.length : 0} subjects`);

    // Check if the requesting user is the teacher or an admin
    if (req.user && req.user.role !== 'admin' && req.user.id !== teacherId) {
      console.log(`Unauthorized access attempt. User: ${req.user.id}, Role: ${req.user.role}, Requested: ${teacherId}`);
      res.status(403);
      throw new Error('Not authorized to access students for this teacher');
    }

    // Get all subject IDs taught by this teacher
    const subjectIds = teacher.Subjects ? teacher.Subjects.map(subject => subject.id) : [];
    console.log(`Subject IDs taught by teacher: ${subjectIds.join(', ') || 'None'}`);
    
    if (subjectIds.length === 0) {
      console.log('No subjects assigned to this teacher, returning empty array');
      return res.json([]);
    }

    // First, get all the teacher's subjects with their section details
    const teacherSubjects = await Subject.findAll({
      where: { id: { [Op.in]: subjectIds } },
      include: [
        Batch ? { model: Batch } : null,
        // Include semester so we can infer batch if subject has only semester linkage
        Semester ? { model: Semester, attributes: ['id','batchId'] } : null
      ].filter(Boolean)
    });

    console.log(`Found ${teacherSubjects.length} subjects with details`);
    teacherSubjects.forEach(subject => {
      console.log(`Subject ${subject.id}: ${subject.name}, Section: ${subject.section}`);
      if (subject.Batches) {
        console.log(`  Associated with batches: ${subject.Batches.map(b => b.id).join(', ')}`);
      }
      if (subject.Semester && subject.Semester.batchId) {
        console.log(`  Inferred batch from semester: ${subject.Semester.batchId}`);
      }
    });

    // Extract the unique sections taught by this teacher
    const taughtSections = [...new Set(teacherSubjects.map(subject => subject.section).filter(Boolean))];
    console.log(`Sections taught: ${taughtSections.join(', ') || 'None'}`);
    
    // Extract all batch IDs associated with the teacher's subjects
    const taughtBatches = new Set();
    teacherSubjects.forEach(subject => {
      if (subject.Batches && Array.isArray(subject.Batches) && subject.Batches.length > 0) {
        subject.Batches.forEach(batch => { if (batch && batch.id) taughtBatches.add(batch.id); });
      }
      // If no direct batch linkage but semester has batchId
      if ((!subject.Batches || subject.Batches.length === 0) && subject.Semester && subject.Semester.batchId) {
        taughtBatches.add(subject.Semester.batchId);
      }
      // Also fallback to legacy subject.batchId field
      if (subject.batchId) {
        taughtBatches.add(subject.batchId);
      }
    });
    const batchArray = [...taughtBatches];
    console.log(`Batches taught: ${batchArray.join(', ') || 'None'}`);

    if (taughtSections.length === 0 && batchArray.length === 0) {
      console.log('No sections or batches found, returning empty array');
      return res.json([]);
    }

    // Build the where clause based on what we have
    const whereClause = {};
    
    if (taughtSections.length > 0) {
      whereClause.section = {
        [Op.in]: taughtSections
      };
    }
    
    if (batchArray.length > 0) {
      whereClause.batch = {
        [Op.in]: batchArray
      };
    }
    
    // If we have both section and batch filters, use OR to include students from either
    const finalWhereClause = 
      taughtSections.length > 0 && batchArray.length > 0 
        ? { [Op.or]: [
            { section: { [Op.in]: taughtSections } },
            { batch: { [Op.in]: batchArray } }
          ]}
        : whereClause;

    // Now find students in those sections or batches
    let students = await Student.findAll({
      where: finalWhereClause,
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });

    // Fallback: if no students returned but we have taught batches, fetch by batch only.
    if (students.length === 0 && batchArray.length > 0) {
      console.log('Primary student search empty; applying batch-only fallback');
      students = await Student.findAll({
        where: { batch: { [Op.in]: batchArray } },
        attributes: { exclude: ['password'] },
        order: [['id', 'ASC']]
      });
    }

    console.log(`Found ${students.length} students`);

    // Get all batch ids
    const batchIds = [...new Set(students.map(s => s.batch).filter(Boolean))];
    console.log('Batch IDs found:', batchIds);

    // Get batch details if available
    let batches = [];
    try {
      if (batchIds.length > 0 && Batch) {
        batches = await Batch.findAll({
          where: {
            id: {
              [Op.in]: batchIds
            }
          }
        });
      }
      console.log(`Found ${batches.length} batches`);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }

    // Create a map of batch details for quick lookup
    const batchMap = batches.reduce((map, batch) => {
      map[batch.id] = batch;
      return map;
    }, {});

    // Process students with batch information
    const processedStudents = students.map(student => {
      const plainStudent = student.get({ plain: true });
      const batchId = plainStudent.batch;
      
      // Add batch information
      if (batchId) {
        const batchInfo = batchMap[batchId];
        if (batchInfo) {
          plainStudent.batchName = batchInfo.name;
        } else {
          plainStudent.batchName = `Batch ${batchId}`;
        }
      } else {
        // Assign default batch info if missing
        plainStudent.batch = 'default';
        plainStudent.batchName = 'Default Batch';
      }
      
      return plainStudent;
    });

    console.log('Processed students:', processedStudents.length);
    res.json(processedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
});

/**
 * @desc    Get current teacher's assigned subjects
 * @route   GET /api/teachers/subjects
 * @access  Private/Teacher
 */
const getTeacherSubjects = asyncHandler(async (req, res) => {
  try {
    // Check if user is logged in and has a valid ID
    if (!req.user || !req.user.id) {
      console.log('No valid user in request:', req.user);
      res.status(401);
      throw new Error('Not authenticated or invalid user');
    }
    
    // Get the logged-in teacher's ID from the JWT
    const teacherId = req.user.id;
    console.log(`Getting subjects for teacher ID: ${teacherId}`);
    
    // Find the teacher with their assigned subjects
    const teacher = await Teacher.findByPk(teacherId, {
      include: [{
        model: Subject,
        through: { attributes: [] }
      }]
    });
    
    if (!teacher) {
      console.log(`Teacher with ID ${teacherId} not found`);
      res.status(404);
      throw new Error('Teacher not found');
    }
    
    console.log(`Found teacher: ${teacher.name}, with ${teacher.Subjects ? teacher.Subjects.length : 0} subjects`);
    
    // If teacher is found but has no subjects
    if (!teacher.Subjects || teacher.Subjects.length === 0) {
      console.log('Teacher found but has no assigned subjects');
    } else {
      console.log('Subjects:', teacher.Subjects.map(s => `${s.id}: ${s.name}`).join(', '));
    }
    
    // Return the teacher's subjects (even if empty array)
    res.json(teacher.Subjects || []);
  } catch (error) {
    console.error('Error in getTeacherSubjects:', error);
    
    // If response has not been sent yet
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Server error fetching subjects',
        error: error.message
      });
    }
  }
});

/**
 * @desc    Create a test teacher account for development purposes
 * @route   POST /api/teachers/create-test-account
 * @access  Private/Admin
 */
const createTestTeacher = asyncHandler(async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      res.status(403);
      throw new Error('This endpoint is only available in development mode');
    }
    
    console.log('Creating test teacher account');
    
    // Use fixed data for test account
    const testData = {
      id: 'T0000',
      name: 'Test Teacher',
      email: req.body.email || 'teacher@test.com',
      password: 'password123', // Simple password for testing
      role: 'teacher'
    };
    
    console.log('Creating test account with email:', testData.email);
    
    // Check if test teacher already exists
    const existingTeacher = await Teacher.findOne({ 
      where: { 
        [Op.or]: [
          { id: testData.id },
          { email: testData.email }
        ]
      } 
    });
    
    if (existingTeacher) {
      // If exists, update the password
      existingTeacher.password = testData.password;
      await existingTeacher.save();
      
      console.log('Test teacher account updated');
      res.status(200).json({
        message: 'Test teacher account updated',
        id: existingTeacher.id,
        name: existingTeacher.name,
        email: existingTeacher.email,
        password: testData.password // Return password for testing purposes only
      });
    } else {
      // Create new test teacher
      const teacher = await Teacher.create(testData);
      
      console.log('Test teacher account created');
      res.status(201).json({
        message: 'Test teacher account created',
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        password: testData.password // Return password for testing purposes only
      });
    }
  } catch (error) {
    console.error('Error creating test teacher account:', error);
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Get students accessible to a teacher
 * @route   GET /api/teachers/students
 * @access  Private/Teacher
 */
const getAccessibleStudents = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    // Find all subjects assigned to the teacher along with their batch information
    const teacherWithSubjects = await Teacher.findByPk(teacherId, {
      include: [{
        model: Subject,
        include: [{
          model: Batch
        }]
      }]
    });
    
    if (!teacherWithSubjects) {
      res.status(404);
      throw new Error('Teacher not found');
    }
    
    // Extract unique batch IDs from teacher's subjects
    const batchIds = [...new Set(
      teacherWithSubjects.Subjects
        .map(subject => subject.batchId)
        .filter(id => id) // Filter out any undefined or null values
    )];
    
    if (batchIds.length === 0) {
      // Teacher has no assigned subjects with batches
      return res.json([]);
    }
    
    // Find all students from these batches
    const students = await Student.findAll({
      where: {
        batch: {
          [Op.in]: batchIds
        }
      },
      attributes: { exclude: ['password'] },
      include: [{
        model: Batch
      }]
    });
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching accessible students:', error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
});

/**
 * @desc    Get batches accessible to a teacher
 * @route   GET /api/teachers/batches
 * @access  Private/Teacher
 */
const getAccessibleBatches = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.user.id;
    const debug = req.query.debug === '1';

    // Step 1: Fetch subject IDs from join table (authoritative for assignments)
    const teacherSubjectLinks = await TeacherSubject.findAll({
      where: { teacherId },
      attributes: ['subjectId']
    });
    const subjectIds = teacherSubjectLinks.map(l => l.subjectId);

    if (subjectIds.length === 0) {
      if (debug) return res.json({ batches: [], debug: { subjectIds: [], note: 'No subject assignments for this teacher' } });
      return res.json([]);
    }

    // Step 2: Load subjects with minimal fields + Semester for batch linkage
    const subjects = await Subject.findAll({
      where: { id: { [Op.in]: subjectIds } },
      attributes: ['id','name','batchId','semesterId'],
      include: [ { model: Semester, attributes: ['id','batchId'] } ]
    });

    // Step 3: Derive batch IDs from multiple sources
    const batchIdSet = new Set();
    subjects.forEach(s => {
      if (s.batchId) batchIdSet.add(s.batchId);
      if (s.batch) batchIdSet.add(s.batch); // legacy
      if (s.Semester && s.Semester.batchId) batchIdSet.add(s.Semester.batchId);
    });

    // Step 4: Fallback raw query if still none (covers schema edge cases)
    if (batchIdSet.size === 0) {
      const [rows] = await sequelize.query(`
        SELECT DISTINCT COALESCE("Subjects"."batchId", "Semesters"."batchId") AS "batchId"
        FROM "TeacherSubjects"
        JOIN "Subjects" ON "Subjects"."id" = "TeacherSubjects"."subjectId"
        LEFT JOIN "Semesters" ON "Semesters"."id" = "Subjects"."semesterId"
        WHERE "TeacherSubjects"."teacherId" = :teacherId
      `, { replacements: { teacherId } });
      rows.forEach(r => r.batchId && batchIdSet.add(r.batchId));
    }

    const batchIds = [...batchIdSet];
    if (batchIds.length === 0) {
      if (debug) return res.json({ batches: [], debug: { subjectIds, subjects, note: 'No batchIds derivable from subjects/semesters' } });
      return res.json([]);
    }

    // Step 5: Fetch batch records
    const batches = await Batch.findAll({ where: { id: { [Op.in]: batchIds } } });
    const normalized = batches.map(b => ({ id: b.id, name: b.name || b.id, startYear: b.startYear, endYear: b.endYear }));

    if (debug) return res.json({ batches: normalized, debug: { subjectIds, subjects: subjects.map(s => ({ id: s.id, batchId: s.batchId, semesterId: s.semesterId, semesterBatch: s.Semester?.batchId })) } });

    res.json(normalized);
  } catch (error) {
    console.error('Error fetching accessible batches:', error);
    res.status(500).json({ message: 'Server error while fetching batches' });
  }
});

/**
 * @desc    Get teacher dashboard data
 * @route   GET /api/teachers/dashboard
 * @access  Private/Teacher
 */
const getTeacherDashboard = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    // Get teacher with subjects and their batches
    const teacher = await Teacher.findByPk(teacherId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Subject,
        include: [{
          model: Batch
        }]
      }]
    });
    
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher not found');
    }
    
    // Extract all batch IDs from the teacher's subjects
    const batchIds = [...new Set(
      teacher.Subjects
        .map(subject => subject.batchId)
        .filter(id => id)
    )];
    
    // Get students from these batches
    const studentsPromise = batchIds.length > 0 ? Student.findAll({
      where: { batch: { [Op.in]: batchIds } },
      attributes: { exclude: ['password'] },
      include: [{ model: Batch }]
    }) : Promise.resolve([]);
    
    // Get all submissions for the teacher's subjects
    const submissionsPromise = teacher.Subjects.length > 0 ? 
      Submission.findAll({
        where: { 
          subjectId: { 
            [Op.in]: teacher.Subjects.map(s => s.id) 
          } 
        },
        include: [
          { model: Student, attributes: { exclude: ['password'] } },
          { model: Subject }
        ]
      }) : Promise.resolve([]);
    
    // Wait for all promises to resolve
    const [students, submissions] = await Promise.all([studentsPromise, submissionsPromise]);
    
    // Organize students by batch
    const studentsByBatch = {};
    students.forEach(student => {
      const batchId = student.batch;
      if (!studentsByBatch[batchId]) {
        studentsByBatch[batchId] = [];
      }
      studentsByBatch[batchId].push(student);
    });
    
    // Organize submissions by subject
    const submissionsBySubject = {};
    submissions.forEach(submission => {
      const subjectId = submission.subjectId;
      if (!submissionsBySubject[subjectId]) {
        submissionsBySubject[subjectId] = [];
      }
      submissionsBySubject[subjectId].push(submission);
    });
    
    res.json({
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email
      },
      subjects: teacher.Subjects,
      studentsByBatch,
      submissionsBySubject
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignSubject,
  removeSubject,
  importTeachersFromExcel,
  authTeacher,
  getStudentsByTeacher,
  getTeacherSubjects,
  createTestTeacher,
  getAccessibleStudents,
  getAccessibleBatches,
  getTeacherDashboard
}; 