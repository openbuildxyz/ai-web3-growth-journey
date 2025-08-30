const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAssignments,
  getStudentAssignments,
  getTeacherAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions
} = require('../controllers/assignmentController');
const { protect, admin, teacher, student } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'assignments');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.originalname;
    console.log('Saving file as:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept images, PDFs, and office documents
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    console.log('File upload request:', file.originalname, 'mimetype:', file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, and office documents are allowed'));
  }
});

// Assignment routes
router.route('/')
  .get(protect, admin, getAssignments)
  .post(protect, teacher, createAssignment);

// File upload route
router.post('/upload', protect, teacher, upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request body:', req.body);
    console.log('File received:', req.file ? req.file.filename : 'No file attached');
    
    // If a file was uploaded, get the url
    const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : null;
    console.log('File URL:', fileUrl);
    
    // Add file URL to the request body
    req.body.fileUrl = fileUrl;
    
    // Call the same create assignment controller function
    await createAssignment(req, res);
  } catch (error) {
    console.error('Error in upload route:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Student assignments
router.route('/student')
  .get(protect, student, getStudentAssignments);

// Teacher assignments
router.route('/teacher')
  .get(protect, teacher, getTeacherAssignments);

// Assignment by ID
router.route('/:id')
  .get(protect, getAssignmentById)
  .put(protect, teacher, updateAssignment)
  .delete(protect, teacher, deleteAssignment);

// Assignment submissions
router.route('/:id/submissions')
  .get(protect, teacher, getAssignmentSubmissions);

module.exports = router; 