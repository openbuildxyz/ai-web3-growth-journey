const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionsBySubject,
  getSubmissionsByTeacher,
  submitAssignment,
  saveAnnotatedPDF
} = require('../controllers/submissionController');
const { protect, admin, teacher, student } = require('../middleware/authMiddleware');

// Configure multer for graded PDF uploads
const gradedPdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'graded');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Graded PDF upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'graded-' + uniqueSuffix + '.pdf';
    console.log('Saving graded PDF file as:', filename);
    cb(null, filename);
  }
});

const uploadGradedPdf = multer({ 
  storage: gradedPdfStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept only PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  }
});

// Configure multer for submission file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'submissions');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Submission upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.originalname;
    console.log('Saving submission file as:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept images, PDFs, and office documents
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    console.log('Submission file upload request:', file.originalname, 'mimetype:', file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, documents, and text files are allowed'));
  }
});

// Submission routes
router.route('/')
  .get(protect, admin, getSubmissions)
  .post(protect, student, createSubmission);

router.route('/:id')
  .get(protect, getSubmissionById)
  .put(protect, teacher, updateSubmission)
  .delete(protect, admin, deleteSubmission);

router.route('/subject/:subjectId')
  .get(protect, teacher, getSubmissionsBySubject);

// New route to get submissions by teacher
router.route('/teacher/:teacherId')
  .get(protect, teacher, getSubmissionsByTeacher);

// New route to submit an assignment
router.route('/assignment/:id')
  .post(protect, student, upload.single('file'), submitAssignment);

// New route to save annotated PDF
router.route('/:id/annotated-pdf')
  .post(protect, teacher, saveAnnotatedPDF);

// New route to upload graded PDF files
router.route('/upload/graded-pdf')
  .post(protect, teacher, uploadGradedPdf.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Return the file URL
      const fileUrl = `/uploads/graded/${req.file.filename}`;
      res.json({ 
        message: 'Graded PDF uploaded successfully',
        fileUrl: fileUrl 
      });
    } catch (error) {
      console.error('Error uploading graded PDF:', error);
      res.status(500).json({ message: 'Failed to upload graded PDF' });
    }
  });

module.exports = router; 