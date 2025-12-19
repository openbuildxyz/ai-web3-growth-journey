import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  getUserProfile, 
  getTeacherById, 
  getSubjects, 
  getStudents, 
  getBatches, 
  getStudentSubmissions,
  getStudentsByBatch,
  getTeacherSubjects
} from '../api';
import SubmissionChecker from './SubmissionChecker';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const SubjectCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const TeacherPortal = () => {
  const [teacher, setTeacher] = useState(null);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch teacher profile
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['teacherProfile'],
    queryFn: getUserProfile,
  });

  // Fetch teacher's assigned subjects
  const { data: teacherSubjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['teacherSubjects'],
    queryFn: getTeacherSubjects,
    enabled: !!profile?.id,
  });

  // Fetch all batches
  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: getBatches,
  });

  // Update teacher data when profile and subjects are loaded
  useEffect(() => {
    if (profile?.id && teacherSubjects) {
      setTeacher(profile);
      setAssignedSubjects(teacherSubjects);
      if (teacherSubjects.length > 0 && !selectedSubject) {
        setSelectedSubject(teacherSubjects[0]);
      }
    }
  }, [profile, teacherSubjects]);

  // Fetch students when a batch is selected
  useEffect(() => {
    const fetchStudentsByBatch = async () => {
      if (!selectedBatch) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await getStudentsByBatch(selectedBatch);
        
        // If a subject is selected, filter students by section
        if (selectedSubject) {
          const filteredStudents = response.filter(student => 
            student.section === selectedSubject.section
          );
          setStudents(filteredStudents);
        } else {
          setStudents(response);
        }
      } catch (err) {
        console.error('Error fetching students by batch:', err);
        setError('Failed to load students for this batch');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsByBatch();
  }, [selectedBatch, selectedSubject]);

  // Fetch submissions when a student is selected
  useEffect(() => {
    if (selectedStudent?.id && selectedSubject?.id) {
      setLoading(true);
      getStudentSubmissions(selectedStudent.id, { subject: selectedSubject.id })
        .then(response => {
          setSubmissions(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching submissions:', error);
          setError('Failed to load student submissions');
          setLoading(false);
        });
    }
  }, [selectedStudent, selectedSubject]);

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
    setSelectedStudent(null); // Reset selected student when batch changes
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setSelectedStudent(null); // Reset selected student when subject changes
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // Reset selections when changing tabs
    if (newValue === 2 && !selectedStudent) {
      setError('Please select a student first');
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedTab(2); // Switch to submissions tab
  };

  const handleGradeSubmission = async (submissionId, gradeData) => {
    try {
      // Call your API to update the submission grade
      await gradeSubmission(submissionId, gradeData);
      // Refresh submissions
      if (selectedStudent?.id) {
        const response = await getStudentSubmissions(selectedStudent.id);
        setSubmissions(response.data);
      }
    } catch (error) {
      console.error('Error grading submission:', error);
    }
  };

  if (profileLoading || subjectsLoading || batchesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (profileError) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Error loading profile. Please try again later.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Teacher Portal
        </Typography>

        <Grid container spacing={3}>
          {/* Teacher Profile */}
          <Grid item xs={12} md={4}>
            <ProfileCard>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                  <Avatar
                    sx={{ width: 120, height: 120, mb: 2 }}
                    alt={teacher?.name}
                    src="/static/images/avatar/1.jpg"
                  />
                  <Typography variant="h5" component="h2" gutterBottom>
                    {teacher?.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {teacher?.email}
                  </Typography>
                  <Chip
                    label={teacher?.role}
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Email: {teacher?.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {teacher?.id}
                  </Typography>
                </Box>
              </CardContent>
            </ProfileCard>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Batch</InputLabel>
                  <Select
                    value={selectedBatch}
                    onChange={handleBatchChange}
                    label="Select Batch"
                  >
                    <MenuItem value="">
                      <em>Select a batch</em>
                    </MenuItem>
                    {batches?.map((batch) => (
                      <MenuItem key={batch.id} value={batch.id}>
                        {batch.name} ({batch.id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{ mb: 3 }}
              >
                <Tab label="Assigned Subjects" />
                <Tab label="Students" />
                <Tab label="Submissions" />
              </Tabs>

              {selectedTab === 0 && (
                <Grid container spacing={2}>
                  {assignedSubjects.map((subject) => (
                    <Grid item xs={12} sm={6} key={subject.id}>
                      <SubjectCard
                        onClick={() => setSelectedSubject(subject)}
                        sx={{
                          cursor: 'pointer',
                          border: selectedSubject?.id === subject.id ? '2px solid' : 'none',
                          borderColor: 'primary.main',
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {subject.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Code: {subject.id}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            Section: {subject.section}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            Credits: {subject.credits}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {subject.description}
                          </Typography>
                        </CardContent>
                      </SubjectCard>
                    </Grid>
                  ))}
                  {assignedSubjects.length === 0 && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        No subjects assigned yet. Please contact the administrator.
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              )}

              {selectedTab === 1 && (
                <Box>
                  {selectedSubject ? (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Students in {selectedSubject.name} ({selectedSubject.section})
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>ID</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Batch</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {students.map((student) => (
                              <TableRow 
                                key={student.id}
                                sx={{
                                  cursor: 'pointer',
                                  backgroundColor: selectedStudent?.id === student.id ? 'action.selected' : 'inherit',
                                }}
                                onClick={() => handleStudentSelect(student)}
                              >
                                <TableCell>{student.id}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.batch}</TableCell>
                                <TableCell>
                                  <Chip
                                    label="View Submissions"
                                    color="primary"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStudentSelect(student);
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  ) : (
                    <Alert severity="info">
                      Please select a subject to view students
                    </Alert>
                  )}
                </Box>
              )}

              {selectedTab === 2 && (
                <Box>
                  {selectedStudent ? (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Submissions for {selectedStudent.name}
                      </Typography>
                      {submissions.length > 0 ? (
                        submissions.map((submission) => (
                          <Box key={submission.id} mb={3}>
                            <SubmissionChecker
                              submission={submission}
                              onGrade={(gradeData) => handleGradeSubmission(submission.id, gradeData)}
                            />
                          </Box>
                        ))
                      ) : (
                        <Alert severity="info">
                          No submissions found for this student
                        </Alert>
                      )}
                    </>
                  ) : (
                    <Alert severity="info">
                      Please select a student to view their submissions
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TeacherPortal; 