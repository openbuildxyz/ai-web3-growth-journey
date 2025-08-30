# Free Assignment Submission Database Recommendations

## Current Problem
- Neon DB free tier has storage limitations
- Submissions table contains large data (files, text, feedback)
- Need to offload submissions while keeping core entities (Students, Teachers, Subjects) in Neon DB

## Recommended Free Database Solutions

### 1. **MongoDB Atlas (Recommended)**
**Free Tier:** 512MB storage, shared clusters
**Best for:** Document-based submission data with flexible schema

```javascript
// Submission Document Structure
{
    
  _id: ObjectId,
  submissionId: "auto-generated",
  studentId: "E23CSEU0324", // Reference to Neon DB
  subjectId: "CSET201",     // Reference to Neon DB  
  assignmentId: 123,        // Reference to Neon DB
  examType: "assignment",
  submissionText: "Large text content...",
  fileUrl: "cloud-storage-url",
  submissionDate: ISODate,
  score: 85.5,
  letterGrade: "A",
  gradePoints: 8.0,
  plagiarismScore: 12.5,
  feedback: "Good work...",
  graded: true,
  gradedBy: "T001",
  gradedDate: ISODate,
  gradedFileUrl: "graded-file-url",
  annotations: "Teacher annotations...",
  metadata: {
    fileSize: 1024,
    submissionAttempts: 1,
    lastModified: ISODate
  }
}
```

**Pros:**
- Flexible schema for varying submission types
- Excellent for storing large text content
- Built-in aggregation for analytics
- Easy integration with Node.js
- Automatic scaling

**Setup:**
```bash
npm install mongodb mongoose
```

### 2. **Firebase Firestore**
**Free Tier:** 1GB storage, 50K reads, 20K writes per day
**Best for:** Real-time submissions with offline support

```javascript
// Collection: submissions/{submissionId}
{
  studentId: "E23CSEU0324",
  subjectId: "CSET201", 
  assignmentId: 123,
  examType: "assignment",
  submissionText: "Content...",
  fileUrl: "firebase-storage-url",
  submissionDate: Timestamp,
  grading: {
    score: 85.5,
    letterGrade: "A", 
    gradePoints: 8.0,
    feedback: "Good work...",
    graded: true,
    gradedBy: "T001",
    gradedDate: Timestamp
  },
  files: {
    original: "submission-file-url",
    graded: "graded-file-url"
  }
}
```

**Pros:**
- Real-time updates
- Integrates perfectly with existing Firebase Auth
- Offline support
- Strong security rules
- Automatic backups

### 3. **Supabase (PostgreSQL)**
**Free Tier:** 500MB database, 2GB bandwidth
**Best for:** SQL-like queries with JSON support

```sql
-- submissions table in Supabase
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR REFERENCES neon_students(id),
  subject_id VARCHAR REFERENCES neon_subjects(id), 
  assignment_id INTEGER REFERENCES neon_assignments(id),
  exam_type VARCHAR NOT NULL,
  submission_data JSONB, -- Large flexible data
  files JSONB,           -- File URLs and metadata
  grading JSONB,         -- All grading information
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Pros:**
- SQL interface (familiar for current setup)
- JSONB for flexible data
- Real-time subscriptions
- Row Level Security (RLS)
- Auto-generated APIs

### 4. **PlanetScale (MySQL)**
**Free Tier:** 5GB storage, 1 billion row reads
**Best for:** High-performance MySQL with branching

```sql
-- Similar structure to current but optimized
CREATE TABLE submissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  subject_id VARCHAR(50) NOT NULL,
  assignment_id BIGINT,
  submission_data JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_subject (student_id, subject_id),
  INDEX idx_assignment (assignment_id)
);
```

**Pros:**
- Most generous free tier storage
- MySQL compatibility
- Database branching (great for development)
- Excellent performance

## Hybrid Architecture Recommendation

### **Option A: MongoDB Atlas + Neon DB (Recommended)**

**Neon DB (Core entities):**
- Students, Teachers, Subjects, Batches, Semesters
- Assignments (metadata only)
- User authentication data

**MongoDB Atlas (Submission data):**
- Complete submission documents
- File metadata and URLs
- Grading information
- Analytics data

### Implementation Example:

```javascript
// submission.service.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  subjectId: { type: String, required: true, index: true },
  assignmentId: { type: Number, required: true },
  examType: { type: String, required: true },
  submissionText: { type: String, required: true },
  fileUrl: String,
  submissionDate: { type: Date, default: Date.now },
  score: Number,
  letterGrade: String,
  gradePoints: Number,
  plagiarismScore: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  graded: { type: Boolean, default: false },
  gradedBy: String,
  gradedDate: Date,
  gradedFileUrl: String,
  annotations: String
}, { 
  timestamps: true,
  // Optimize for queries
  indexes: [
    { studentId: 1, subjectId: 1 },
    { assignmentId: 1 },
    { submissionDate: -1 }
  ]
});

module.exports = mongoose.model('Submission', submissionSchema);
```

```javascript
// Dual database controller
class SubmissionController {
  // Create submission in MongoDB
  async createSubmission(req, res) {
    try {
      // Validate assignment exists in Neon DB
      const assignment = await Assignment.findByPk(req.body.assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      // Create submission in MongoDB
      const submission = new MongoSubmission(req.body);
      await submission.save();

      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get student submissions (MongoDB + Neon DB join)
  async getStudentSubmissions(req, res) {
    try {
      const { studentId } = req.params;

      // Get submissions from MongoDB
      const submissions = await MongoSubmission
        .find({ studentId })
        .sort({ submissionDate: -1 });

      // Get assignment details from Neon DB
      const assignmentIds = submissions.map(s => s.assignmentId);
      const assignments = await Assignment.findAll({
        where: { id: assignmentIds },
        include: [{ model: Subject }]
      });

      // Merge data
      const enrichedSubmissions = submissions.map(submission => ({
        ...submission.toObject(),
        assignment: assignments.find(a => a.id === submission.assignmentId)
      }));

      res.json(enrichedSubmissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

## Migration Plan

### Phase 1: Setup MongoDB Atlas
1. Create MongoDB Atlas account (free tier)
2. Set up cluster and database
3. Install MongoDB dependencies
4. Create submission schema

### Phase 2: Dual Write Implementation
1. Modify submission endpoints to write to both databases
2. Keep existing Neon DB reads as fallback
3. Test thoroughly with new submissions

### Phase 3: Data Migration
1. Export existing submissions from Neon DB
2. Transform and import to MongoDB
3. Verify data integrity
4. Update all read operations to use MongoDB

### Phase 4: Cleanup
1. Switch all operations to MongoDB for submissions
2. Drop submission tables from Neon DB
3. Monitor storage usage improvements

## Code Changes Required

### 1. Environment Configuration
```javascript
// .env additions
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/evalis-submissions
MONGODB_DB_NAME=evalis_submissions
```

### 2. Database Connection
```javascript
// config/mongodb.js
const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
```

### 3. Updated API Endpoints
```javascript
// routes/submissions.js - Updated to use MongoDB
router.get('/students/:studentId/submissions', async (req, res) => {
  // Use MongoDB instead of Sequelize
  const submissions = await MongoSubmission.find({ 
    studentId: req.params.studentId 
  });
  res.json(submissions);
});
```

## Cost Comparison

| Solution | Storage | Reads/Writes | Best For |
|----------|---------|--------------|----------|
| MongoDB Atlas | 512MB | Unlimited | Document storage |
| Firebase Firestore | 1GB | 50K reads/20K writes daily | Real-time features |
| Supabase | 500MB | 2GB bandwidth | SQL familiarity |
| PlanetScale | 5GB | 1B row reads | Large datasets |

## Recommendation Summary

**Go with MongoDB Atlas** because:
1. ✅ Perfect for submission documents with varying schemas
2. ✅ Excellent text search capabilities for submission content
3. ✅ Strong Node.js ecosystem
4. ✅ Easy aggregation for analytics and CGPA calculations
5. ✅ Can handle file metadata efficiently
6. ✅ Scales automatically as your platform grows

This hybrid approach will:
- Reduce Neon DB storage by ~70-80%
- Improve submission query performance
- Provide better scalability for submission data
- Maintain existing user/course management in Neon DB
