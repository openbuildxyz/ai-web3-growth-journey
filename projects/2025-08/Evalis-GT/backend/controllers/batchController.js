const asyncHandler = require('express-async-handler');
const { Batch, Student } = require('../models');

/**
 * @desc    Get all batches
 * @route   GET /api/batches
 * @access  Private/Admin, Teacher
 */
const getAllBatches = asyncHandler(async (req, res) => {
  const batches = await Batch.findAll({
    order: [['startYear', 'DESC']]
  });
  res.json(batches);
});

/**
 * @desc    Get batch by ID
 * @route   GET /api/batches/:id
 * @access  Private/Admin, Teacher
 */
const getBatchById = asyncHandler(async (req, res) => {
  const batch = await Batch.findByPk(req.params.id);
  
  if (batch) {
    res.json(batch);
  } else {
    res.status(404);
    throw new Error('Batch not found');
  }
});

/**
 * @desc    Create a new batch
 * @route   POST /api/batches
 * @access  Private/Admin
 */
const createBatch = asyncHandler(async (req, res) => {
  const { id: requestedId, name, department, startYear, endYear, active } = req.body;

  // Basic validation (treat 0 as invalid year, ensure numbers)
  if (!name || !department || startYear == null || endYear == null) {
    res.status(400);
    throw new Error('Required fields: name, department, startYear, endYear');
  }

  if (isNaN(Number(startYear)) || isNaN(Number(endYear))) {
    res.status(400);
    throw new Error('startYear and endYear must be numeric');
  }

  // Validate years
  if (endYear <= startYear) {
    res.status(400);
    throw new Error('End year must be greater than start year');
  }

  // Prefer provided ID, otherwise generate canonical format `${startYear}-${endYear}`
  // This aligns with front-end expectation (e.g. 2023-2027) and avoids legacy BTech2023 pattern.
  let id = (requestedId || '').trim();
  if (!id) {
    id = `${startYear}-${endYear}`;
  }

  // Ensure ID uniqueness
  const existingById = await Batch.findByPk(id);
  if (existingById) {
    res.status(400);
    throw new Error(`Batch with id '${id}' already exists`);
  }

  // Ensure name uniqueness (allow same name only if pointing to same id)
  const existingByName = await Batch.findOne({ where: { name } });
  if (existingByName) {
    res.status(400);
    throw new Error(`Batch with name '${name}' already exists`);
  }

  const batch = await Batch.create({
    id,
    name,
    department,
    startYear,
    endYear,
    active: active !== undefined ? active : true
  });

  return res.status(201).json(batch);
});

/**
 * @desc    Update a batch
 * @route   PUT /api/batches/:id
 * @access  Private/Admin
 */
const updateBatch = asyncHandler(async (req, res) => {
  const { name, department, startYear, endYear, active } = req.body;

  const batch = await Batch.findByPk(req.params.id);
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found');
  }

  // Validate years if provided
  const newStart = startYear != null ? Number(startYear) : batch.startYear;
  const newEnd = endYear != null ? Number(endYear) : batch.endYear;
  if (isNaN(newStart) || isNaN(newEnd)) {
    res.status(400);
    throw new Error('startYear and endYear must be numeric');
  }
  if (newEnd <= newStart) {
    res.status(400);
    throw new Error('End year must be greater than start year');
  }

  // Ensure name uniqueness
  if (name && name !== batch.name) {
    const conflict = await Batch.findOne({ where: { name } });
    if (conflict) {
      res.status(400);
      throw new Error(`Batch with name '${name}' already exists`);
    }
  }

  batch.name = name || batch.name;
  batch.department = department || batch.department;
  batch.startYear = newStart;
  batch.endYear = newEnd;
  if (active !== undefined) batch.active = active;

  const updatedBatch = await batch.save();
  return res.json(updatedBatch);
});

/**
 * @desc    Delete a batch
 * @route   DELETE /api/batches/:id
 * @access  Private/Admin
 */
const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByPk(req.params.id);
  
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found');
  }
  
  // TODO: Check if there are students or submissions associated with this batch
  // before deletion, or implement soft delete
  
  await batch.destroy();
  res.json({ message: 'Batch removed' });
});

/**
 * @desc    Get students in batch
 * @route   GET /api/batches/:id/students
 * @access  Private/Admin, Teacher
 */
const getBatchStudents = asyncHandler(async (req, res) => {
  const batch = await Batch.findByPk(req.params.id);

  if (!batch) {
    res.status(404);
    throw new Error('Batch not found');
  }

  const students = await Student.findAll({
    where: { batch: req.params.id },
    attributes: { exclude: ['password'] }
  });
  
  res.json(students);
});

module.exports = {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchStudents,
}; 