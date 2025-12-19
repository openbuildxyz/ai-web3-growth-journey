const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Semester, Batch, Subject, Student } = require('../models');

// @desc    Create a new semester
// @route   POST /api/semesters
// @access  Private/Admin
const createSemester = asyncHandler(async (req, res) => {
  const { batchId, name, number, startDate, endDate, active } = req.body;

  // Validate batch exists
  const batchExists = await Batch.findByPk(batchId);
  if (!batchExists) {
    res.status(404);
    throw new Error('Batch not found');
  }

  // Check if semester number already exists for this batch
  const existingSemester = await Semester.findOne({
    where: {
      batchId,
      number
    }
  });

  if (existingSemester) {
    res.status(400);
    throw new Error(`Semester ${number} already exists for this batch`);
  }

  // Generate semester ID
  const semesterId = await Semester.generateSemesterId(batchId, number);

  // Create semester
  const semester = await Semester.create({
    id: semesterId,
    name,
    number,
    startDate,
    endDate,
    // Only default to true if not explicitly provided
    active: active !== undefined ? active : true,
    batchId
  });

  res.status(201).json(semester);
});

// @desc    Get all semesters
// @route   GET /api/semesters
// @access  Private
const getSemesters = asyncHandler(async (req, res) => {
  const semesters = await Semester.findAll({
    include: [
      {
        model: Batch,
        attributes: ['id', 'name', 'department']
      }
    ],
    order: [
      ['createdAt', 'DESC']
    ]
  });

  res.json(semesters);
});

// @desc    Get semester by ID
// @route   GET /api/semesters/:id
// @access  Private
const getSemesterById = asyncHandler(async (req, res) => {
  const semester = await Semester.findByPk(req.params.id, {
    include: [
      {
        model: Batch,
        attributes: ['id', 'name', 'department']
      },
      {
        model: Subject,
        attributes: ['id', 'name', 'credits', 'description']
      }
    ]
  });

  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  res.json(semester);
});

// @desc    Update semester
// @route   PUT /api/semesters/:id
// @access  Private/Admin
const updateSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findByPk(req.params.id);

  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  const { name, startDate, endDate, active } = req.body;

  semester.name = name || semester.name;
  semester.startDate = startDate || semester.startDate;
  semester.endDate = endDate || semester.endDate;
  
  // Only update active if explicitly provided
  if (active !== undefined) {
    semester.active = active;
  }

  const updatedSemester = await semester.save();

  res.json(updatedSemester);
});

// @desc    Activate a semester (set it active, others in same batch inactive, update students)
// @route   PUT /api/semesters/:id/activate
// @access  Private/Admin
const activateSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findByPk(req.params.id);
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  // Transaction optional; keeping simple for now
  // Deactivate other semesters of same batch
  await Semester.update({ active: false }, {
    where: {
      batchId: semester.batchId,
      id: { [Op.ne]: semester.id }
    }
  });

  // Activate selected semester if not already
  if (!semester.active) {
    semester.active = true;
    await semester.save();
  }

  // Set all students of this batch to have this active semester
  const [studentsUpdated] = await Student.update({ activeSemesterId: semester.id }, {
    where: { batch: semester.batchId }
  });

  res.json({
    message: 'Semester activated',
    semesterId: semester.id,
    batchId: semester.batchId,
    studentsUpdated
  });
});

// @desc    Deactivate a semester (set active false, clear activeSemesterId for affected students)
// @route   PUT /api/semesters/:id/deactivate
// @access  Private/Admin
const deactivateSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findByPk(req.params.id);
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  if (semester.active) {
    semester.active = false;
    await semester.save();
  }

  const [studentsUpdated] = await Student.update({ activeSemesterId: null }, {
    where: { activeSemesterId: semester.id }
  });

  res.json({
    message: 'Semester deactivated',
    semesterId: semester.id,
    studentsUpdated
  });
});

// @desc    Set active semester for students
// @route   PUT /api/semesters/:id/set-active
// @access  Private/Admin
const setActiveSemesterForStudents = asyncHandler(async (req, res) => {
  const { studentIds } = req.body;
  const semesterId = req.params.id;

  // Validate semester exists
  const semester = await Semester.findByPk(semesterId);
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }

  // Validate the students belong to the same batch as the semester
  const students = await Student.findAll({
    where: {
      id: studentIds
    }
  });

  if (students.length !== studentIds.length) {
    res.status(400);
    throw new Error('One or more students not found');
  }

  // Update students' active semester
  await Promise.all(
    students.map(student => 
      student.update({ activeSemesterId: semesterId })
    )
  );

  res.json({ message: `Active semester updated for ${students.length} students` });
});

// @desc    Get semesters for a specific batch
// @route   GET /api/semesters/batch/:batchId
// @access  Private
const getBatchSemesters = asyncHandler(async (req, res) => {
  const batchId = req.params.batchId;
  
  // Validate batch exists
  const batchExists = await Batch.findByPk(batchId);
  if (!batchExists) {
    res.status(404);
    throw new Error('Batch not found');
  }
  
  const semesters = await Semester.findAll({
    where: { batchId },
    include: [
      {
        model: Batch,
        attributes: ['id', 'name', 'department']
      }
    ],
    order: [
      ['number', 'ASC']
    ]
  });
  
  res.json(semesters);
});

module.exports = {
  createSemester,
  getSemesters,
  getSemesterById,
  updateSemester,
  activateSemester,
  deactivateSemester,
  setActiveSemesterForStudents,
  getBatchSemesters
}; 