const asyncHandler = require('express-async-handler');
const { Subject, Teacher, TeacherSubject, Batch, Semester } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all subjects
 * @route   GET /api/subjects
 * @access  Private
 */
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.findAll({
    include: [
      {
        model: Teacher,
        through: { attributes: [] }
      },
      {
        model: Batch
      },
      {
        model: Semester
      }
    ]
  });
  res.json(subjects);
});

/**
 * @desc    Get subject by ID
 * @route   GET /api/subjects/:id
 * @access  Private
 */
const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findByPk(req.params.id, {
    include: [
      {
        model: Teacher,
        through: { attributes: [] }
      },
      {
        model: Batch
      },
      {
        model: Semester
      }
    ]
  });

  if (subject) {
    res.json(subject);
  } else {
    res.status(404);
    throw new Error('Subject not found');
  }
});

/**
 * @desc    Create a new subject
 * @route   POST /api/subjects
 * @access  Private/Admin
 */
const createSubject = asyncHandler(async (req, res) => {
  const { name, section, description, credits, id, batchId, semesterId } = req.body;

  console.log('Create subject request:', { name, section, batchId, semesterId });

  if (!name || !section) {
    res.status(400);
    throw new Error('Please provide name and section');
  }

  // Either batchId or semesterId should be provided
  if (!batchId && !semesterId) {
    res.status(400);
    throw new Error('Please provide either batchId or semesterId');
  }

  let finalBatchId = batchId;
  let finalSemesterId = semesterId;

  // If semesterId is provided, get the batch from the semester
  if (semesterId) {
    console.log(`Looking for semester with ID: ${semesterId}`);
    
    // Check if the semester exists with additional logging
    const allSemesters = await Semester.findAll();
    console.log(`Available semesters: ${allSemesters.map(s => s.id).join(', ')}`);
    
    const semester = await Semester.findByPk(semesterId);
    if (!semester) {
      console.error(`Semester with ID ${semesterId} not found in database`);
      res.status(400);
      throw new Error(`Semester with ID ${semesterId} not found`);
    }
    
    console.log(`Found semester ${semesterId}, associated with batch ${semester.batchId}`);
    finalBatchId = semester.batchId;
    finalSemesterId = semesterId;
  } 
  // If only batchId is provided, we need to check the batch exists
  else if (batchId) {
    const batchExists = await Batch.findByPk(batchId);
    if (!batchExists) {
      res.status(400);
      throw new Error('Batch not found');
    }
    console.log(`Found batch ${batchId}`);
    finalBatchId = batchId;
    
    // If we don't have a semesterId but need one, find the most recent semester for this batch
    if (!finalSemesterId) {
      const latestSemester = await Semester.findOne({
        where: { batchId: finalBatchId },
        order: [['number', 'DESC']]
      });
      
      if (latestSemester) {
        console.log(`Using latest semester ${latestSemester.id} for batch ${finalBatchId}`);
        finalSemesterId = latestSemester.id;
      } else {
        console.log(`Warning: No semesters found for batch ${finalBatchId}, subject will have null semesterId`);
      }
    }
  }

  // Generate a subject ID if not provided
  const subjectId = id || `${section.replace('-', '')}${Math.floor(Math.random() * 1000)}`;
  console.log(`Using subject ID: ${subjectId}`);

  // Check if subject already exists with the same ID
  const subjectExists = await Subject.findOne({ where: { id: subjectId } });

  if (subjectExists) {
    res.status(400);
    throw new Error('Subject with this ID already exists');
  }

  // Log the final values being used
  console.log(`Creating subject with: ID=${subjectId}, batchId=${finalBatchId}, semesterId=${finalSemesterId}`);

  try {
    const subject = await Subject.create({
      id: subjectId,
      name,
      section,
      description: description || '',
      credits: credits || 3,
      batchId: finalBatchId,
      semesterId: finalSemesterId,
    });

    if (subject) {
      console.log(`Subject created successfully: ${subject.id}`);
      // Load the subject with its batch and semester
      const createdSubject = await Subject.findByPk(subject.id, {
        include: [
          { model: Batch },
          { model: Semester }
        ]
      });
      res.status(201).json(createdSubject);
    } else {
      res.status(400);
      throw new Error('Invalid subject data');
    }
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(400);
    throw new Error(`Failed to create subject: ${error.message}`);
  }
});

/**
 * @desc    Update subject
 * @route   PUT /api/subjects/:id
 * @access  Private/Admin
 */
const updateSubject = asyncHandler(async (req, res) => {
  const { name, section, description, credits, batchId, semesterId } = req.body;

  const subject = await Subject.findByPk(req.params.id);

  if (subject) {
    // If changing the semester, verify it exists
    if (semesterId && semesterId !== subject.semesterId) {
      const semester = await Semester.findByPk(semesterId);
      if (!semester) {
        res.status(400);
        throw new Error('Semester not found');
      }
      // If semester is changing, update batch to match semester's batch
      subject.batchId = semester.batchId;
    }
    // If only batch is changing, verify it exists
    else if (batchId && batchId !== subject.batchId && !semesterId) {
      const batchExists = await Batch.findByPk(batchId);
      if (!batchExists) {
        res.status(400);
        throw new Error('Batch not found');
      }
    }

    subject.name = name || subject.name;
    subject.section = section || subject.section;
    subject.description = description !== undefined ? description : subject.description;
    subject.credits = credits !== undefined ? credits : subject.credits;
    
    // Only update batchId if semesterId is not being updated
    if (batchId && !semesterId) {
      subject.batchId = batchId;
    }
    
    // Update semesterId if provided
    if (semesterId) {
      subject.semesterId = semesterId;
    }

    const updatedSubject = await subject.save();
    
    // Load the updated subject with its batch and semester
    const refreshedSubject = await Subject.findByPk(updatedSubject.id, {
      include: [
        { model: Batch },
        { model: Semester }
      ]
    });
    
    res.json(refreshedSubject);
  } else {
    res.status(404);
    throw new Error('Subject not found');
  }
});

/**
 * @desc    Delete subject
 * @route   DELETE /api/subjects/:id
 * @access  Private/Admin
 */
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByPk(req.params.id);

  if (subject) {
    // First remove all teacher-subject associations
    await TeacherSubject.destroy({
      where: { subjectId: subject.id }
    });
    
    // Then delete the subject
    await subject.destroy();
    res.json({ message: 'Subject removed' });
  } else {
    res.status(404);
    throw new Error('Subject not found');
  }
});

/**
 * @desc    Get subjects by section
 * @route   GET /api/subjects/section/:sectionId
 * @access  Private
 */
const getSubjectsBySection = asyncHandler(async (req, res) => {
  const subjects = await Subject.findAll({
    where: { section: req.params.sectionId },
    include: [
      {
        model: Teacher,
        through: { attributes: [] }
      },
      {
        model: Batch
      },
      {
        model: Semester
      }
    ]
  });
  
  res.json(subjects);
});

/**
 * @desc    Get subjects by batch
 * @route   GET /api/subjects/batch/:batchId
 * @access  Private
 */
const getSubjectsByBatch = asyncHandler(async (req, res) => {
  const subjects = await Subject.findAll({
    where: { batchId: req.params.batchId },
    include: [
      {
        model: Teacher,
        through: { attributes: [] }
      },
      {
        model: Batch
      },
      {
        model: Semester
      }
    ]
  });
  
  res.json(subjects);
});

/**
 * @desc    Get subjects by semester
 * @route   GET /api/subjects/semester/:semesterId
 * @access  Private
 */
const getSubjectsBySemester = asyncHandler(async (req, res) => {
  const subjects = await Subject.findAll({
    where: { semesterId: req.params.semesterId },
    include: [
      {
        model: Teacher,
        through: { attributes: [] }
      },
      {
        model: Batch
      },
      {
        model: Semester
      }
    ]
  });
  
  res.json(subjects);
});

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsBySection,
  getSubjectsByBatch,
  getSubjectsBySemester
}; 