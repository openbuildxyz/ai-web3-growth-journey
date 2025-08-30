const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');
const { Student, Teacher, Subject, Batch, Submission, Admin, TeacherSubject, sequelize } = require('./models');
const { connectDB } = require('./config/db');

// Load env vars
dotenv.config();

// Sample data
const batches = [
  {
    id: '2023-2027',
    name: 'BTech 2023-2027',
    startYear: 2023,
    endYear: 2027,
    department: 'Computer Science Engineering',
    active: true
  },
  {
    id: '2022-2026',
    name: 'BTech 2022-2026',
    startYear: 2022,
    endYear: 2026,
    department: 'Computer Science Engineering',
    active: true
  },
  {
    id: '2021-2025',
    name: 'BTech 2021-2025',
    startYear: 2021,
    endYear: 2025,
    department: 'Computer Science Engineering',
    active: true
  }
];

const subjects = [
  {
    id: 'CSE101',
    name: 'Introduction to Programming',
    section: 'CSE-1',
    description: 'Basic programming concepts using C/C++',
    credits: 4
  },
  {
    id: 'CSE102',
    name: 'Data Structures',
    section: 'CSE-1',
    description: 'Fundamental data structures and algorithms',
    credits: 4
  },
  {
    id: 'CSE201',
    name: 'Object-Oriented Programming',
    section: 'CSE-2',
    description: 'OOP concepts using Java/Python',
    credits: 3
  },
  {
    id: 'CSE202',
    name: 'Database Management Systems',
    section: 'CSE-2',
    description: 'Relational databases, SQL, and database design',
    credits: 4
  },
  {
    id: 'CSE301',
    name: 'Web Technologies',
    section: 'CSE-3',
    description: 'Modern web development technologies',
    credits: 3
  }
];

const teachers = [
  {
    id: 'T001',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@university.edu',
    password: 'password123',
    role: 'teacher'
  },
  {
    id: 'T002',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@university.edu',
    password: 'password123',
    role: 'teacher'
  },
  {
    id: 'T003',
    name: 'Dr. Amit Verma',
    email: 'amit.verma@university.edu',
    password: 'password123',
    role: 'teacher'
  }
];

const teacherSubjects = [
  {
    teacherId: 'T001',
    subjectId: 'CSE101'
  },
  {
    teacherId: 'T001',
    subjectId: 'CSE102'
  },
  {
    teacherId: 'T002',
    subjectId: 'CSE201'
  },
  {
    teacherId: 'T002',
    subjectId: 'CSE202'
  },
  {
    teacherId: 'T003',
    subjectId: 'CSE301'
  }
];

const students = [
  {
    id: 'S00001',
    name: 'Aarav Patel',
    section: 'CSE-1',
    batch: '2023-2027',
    email: 'aarav.patel@university.edu',
    password: 'password123',
    role: 'student'
  },
  {
    id: 'S00002',
    name: 'Diya Sharma',
    section: 'CSE-1',
    batch: '2023-2027',
    email: 'diya.sharma@university.edu',
    password: 'password123',
    role: 'student'
  },
  {
    id: 'S00003',
    name: 'Arjun Singh',
    section: 'CSE-2',
    batch: '2022-2026',
    email: 'arjun.singh@university.edu',
    password: 'password123',
    role: 'student'
  },
  {
    id: 'S00004',
    name: 'Ananya Gupta',
    section: 'CSE-2',
    batch: '2022-2026',
    email: 'ananya.gupta@university.edu',
    password: 'password123',
    role: 'student'
  },
  {
    id: 'S00005',
    name: 'Rohan Joshi',
    section: 'CSE-3',
    batch: '2021-2025',
    email: 'rohan.joshi@university.edu',
    password: 'password123',
    role: 'student'
  }
];

const admins = [
  {
    username: 'admin',
    name: 'Admin User',
    email: 'admin@university.edu',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'zyExeKhXoMFtd1Gc',
    role: 'admin'
  }
];

const submissions = [
  {
    studentId: 'S00001',
    subjectId: 'CSE101',
    examType: 'midterm',
    submissionText: 'This is a sample midterm submission for Introduction to Programming.',
    submissionDate: new Date(),
    score: null,
    plagiarismScore: 0,
    feedback: '',
    graded: false,
    gradedBy: null,
    gradedDate: null
  },
  {
    studentId: 'S00002',
    subjectId: 'CSE101',
    examType: 'midterm',
    submissionText: 'This is another sample midterm submission for Introduction to Programming.',
    submissionDate: new Date(),
    score: 85,
    plagiarismScore: 2,
    feedback: 'Good work overall. Some minor issues with code optimization.',
    graded: true,
    gradedBy: 'T001',
    gradedDate: new Date()
  }
];

// Import data
const importData = async () => {
  let conn;
  try {
    console.log('Connecting to database...'.yellow);
    conn = await connectDB();
    console.log('Connection established, starting import...'.green);
    
    // Clear existing data - use Sequelize's truncate method to reset sequences
    console.log('Clearing existing data...'.cyan);
    await sequelize.transaction(async (transaction) => {
      await Submission.destroy({ truncate: { cascade: true }, transaction });
      await TeacherSubject.destroy({ truncate: { cascade: true }, transaction });
      await Student.destroy({ truncate: { cascade: true }, transaction });
      await Teacher.destroy({ truncate: { cascade: true }, transaction });
      await Subject.destroy({ truncate: { cascade: true }, transaction });
      await Batch.destroy({ truncate: { cascade: true }, transaction });
      await Admin.destroy({ truncate: { cascade: true }, transaction });
    });
    console.log('Existing data cleared'.green);

    // Insert new data
    console.log('Importing new data...'.cyan);
    await Batch.bulkCreate(batches);
    await Subject.bulkCreate(subjects);
    
    // Hash passwords for teachers before insert
    const teachersWithHashedPasswords = await Promise.all(
      teachers.map(async (teacher) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(teacher.password, salt);
        return { ...teacher, password: hashedPassword };
      })
    );
    await Teacher.bulkCreate(teachersWithHashedPasswords);

    // Hash passwords for students before insert
    const studentsWithHashedPasswords = await Promise.all(
      students.map(async (student) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(student.password, salt);
        return { ...student, password: hashedPassword };
      })
    );
    await Student.bulkCreate(studentsWithHashedPasswords);

    // Hash passwords for admins before insert
    const adminsWithHashedPasswords = await Promise.all(
      admins.map(async (admin) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password, salt);
        return { ...admin, password: hashedPassword };
      })
    );
    await Admin.bulkCreate(adminsWithHashedPasswords);

    // Insert teacher-subject relationships
    await TeacherSubject.bulkCreate(teacherSubjects);
    
    // Insert submissions
    await Submission.bulkCreate(submissions);

    console.log('Data imported successfully'.green.inverse);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    console.error(`Full error: ${error.stack}`.red);
    process.exit(1);
  }
};

// Delete data
const destroyData = async () => {
  try {
    console.log('Connecting to database...'.yellow);
    await connectDB();
    console.log('Connection established, starting data deletion...'.green);
    
    // Clear all data
    console.log('Deleting all data...'.cyan);
    await sequelize.transaction(async (transaction) => {
      await Submission.destroy({ truncate: { cascade: true }, transaction });
      await TeacherSubject.destroy({ truncate: { cascade: true }, transaction });
      await Student.destroy({ truncate: { cascade: true }, transaction });
      await Teacher.destroy({ truncate: { cascade: true }, transaction });
      await Subject.destroy({ truncate: { cascade: true }, transaction });
      await Batch.destroy({ truncate: { cascade: true }, transaction });
      await Admin.destroy({ truncate: { cascade: true }, transaction });
    });

    console.log('Data destroyed successfully'.red.inverse);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Check if we should destroy data
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 