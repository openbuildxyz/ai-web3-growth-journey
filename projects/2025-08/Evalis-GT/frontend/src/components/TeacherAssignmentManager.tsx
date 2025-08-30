import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  ViewList,
  Grade,
  Assessment,
  FilterList
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  getTeacherAssignments,
  getAssignmentSubmissions,
  gradeSubmission,
  getSubmissionsByTeacher
} from '../api';
import TeacherAssignmentCreator from './TeacherAssignmentCreator';

interface Subject {
  id: string;
  name: string;
}

interface ExamType {
  id: string;
  name: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  subjectId: string;
  subject: {
    id: string;
    name: string;
  };
  examType: string;
  dueDate: string;
  fileUrl: string;
  createdAt: string;
}

interface Submission {
  id: number;
  studentId: string;
  student: {
    id: string;
    name: string;
    section: string;
  };
  submissionText: string;
  fileUrl: string;
  submissionDate: string;
  score: number | null;
  feedback: string;
  graded: boolean;
  examType: string;
  subjectId: string;
}

interface TeacherAssignmentManagerProps {
  subjects: Subject[];
  examTypes: ExamType[];
}

const TeacherAssignmentManager: React.FC<TeacherAssignmentManagerProps> = ({
  subjects,
  examTypes
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradeSuccess, setGradeSuccess] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('');
  const [selectedExamTypeFilter, setSelectedExamTypeFilter] = useState<string>('');
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  const [viewAssignmentDialogOpen, setViewAssignmentDialogOpen] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  // When subject or exam type filter changes, update the filtered submissions
  useEffect(() => {
    if (allSubmissions.length > 0) {
      filterSubmissions();
    }
  }, [selectedSubjectFilter, selectedExamTypeFilter, allSubmissions]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await getTeacherAssignments();
      setAssignments(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSelectedSubjectFilter(assignment.subjectId);
    setSelectedExamTypeFilter(assignment.examType);
    setSubmissionsDialogOpen(true);
    
    try {
      setSubmissionsLoading(true);
      const response = await getAssignmentSubmissions(assignment.id);
      setAllSubmissions(response.data);
      setFilteredSubmissions(response.data);
      setShowAllSubmissions(false);
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleViewAllSubmissions = async () => {
    setSelectedAssignment(null);
    setSelectedSubjectFilter('');
    setSelectedExamTypeFilter('');
    setSubmissionsDialogOpen(true);
    
    try {
      setSubmissionsLoading(true);
      // Use the teacher's ID to get all submissions across all subjects
      const response = await getSubmissionsByTeacher();
      setAllSubmissions(response.data);
      setFilteredSubmissions(response.data);
      setShowAllSubmissions(true);
    } catch (err: any) {
      console.error('Error fetching all submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...allSubmissions];
    
    if (selectedSubjectFilter) {
      filtered = filtered.filter(
        submission => submission.subjectId === selectedSubjectFilter
      );
    }
    
    if (selectedExamTypeFilter) {
      filtered = filtered.filter(
        submission => submission.examType === selectedExamTypeFilter
      );
    }
    
    // Sort by submission date (newest first)
    filtered.sort((a, b) => 
      new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
    );
    
    setFilteredSubmissions(filtered);
  };

  const handleSubjectFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedSubjectFilter(event.target.value);
  };

  const handleExamTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedExamTypeFilter(event.target.value);
  };

  const openGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score?.toString() || '');
    setFeedback(submission.feedback || '');
    setGradeDialogOpen(true);
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    try {
      setGrading(true);
      
      await gradeSubmission(selectedSubmission.id, {
        score: parseFloat(score),
        feedback
      });
      
      setGradeSuccess(true);
      
      // Update the submission in the lists
      const updatedSubmission = { 
        ...selectedSubmission, 
        score: parseFloat(score), 
        feedback, 
        graded: true 
      };
      
      setAllSubmissions(allSubmissions.map(sub => 
        sub.id === selectedSubmission.id ? updatedSubmission : sub
      ));
      
      setFilteredSubmissions(filteredSubmissions.map(sub => 
        sub.id === selectedSubmission.id ? updatedSubmission : sub
      ));
      
      setTimeout(() => {
        setGradeDialogOpen(false);
        setGradeSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error grading submission:', err);
    } finally {
      setGrading(false);
    }
  };

  const handleViewAssignmentDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setViewAssignmentDialogOpen(true);
  };

  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : subjectId;
  };

  const getExamTypeName = (examTypeId: string): string => {
    const examType = examTypes.find(t => t.id === examTypeId);
    return examType ? examType.name : examTypeId;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Assignment List" icon={<ViewList />} iconPosition="start" />
        <Tab label="Create Assignment" icon={<AssignmentIcon />} iconPosition="start" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              Your Assignments
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Grade />}
              onClick={handleViewAllSubmissions}
            >
              View All Submissions
            </Button>
          </Box>
          
          {assignments.length === 0 ? (
            <Alert severity="info">
              You haven't created any assignments yet. Use the "Create Assignment" tab to get started.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <AssignmentIcon sx={{ mr: 1 }} />
                          {assignment.title}
                        </Box>
                      </TableCell>
                      <TableCell>{assignment.subject.name}</TableCell>
                      <TableCell>{getExamTypeName(assignment.examType)}</TableCell>
                      <TableCell>
                        {assignment.dueDate ? (
                          format(new Date(assignment.dueDate), 'MMM d, yyyy h:mm a')
                        ) : (
                          'No deadline'
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(assignment.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Box display="flex">
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={() => handleViewAssignmentDetails(assignment)}
                            sx={{ mr: 1 }}
                          >
                            Details
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<ViewList />}
                            onClick={() => handleViewSubmissions(assignment)}
                          >
                            Submissions
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {tabValue === 1 && (
        <TeacherAssignmentCreator 
          subjects={subjects} 
          examTypes={examTypes} 
          onAssignmentCreated={fetchAssignments}
        />
      )}

      {/* View Assignment Details Dialog */}
      <Dialog
        open={viewAssignmentDialogOpen}
        onClose={() => setViewAssignmentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Assignment Details
        </DialogTitle>
        <DialogContent>
          {selectedAssignment && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedAssignment.title}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Subject</Typography>
                <Typography variant="body1">{getSubjectName(selectedAssignment.subjectId)}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Assignment Type</Typography>
                <Typography variant="body1">{getExamTypeName(selectedAssignment.examType)}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Due Date</Typography>
                <Typography variant="body1">
                  {selectedAssignment.dueDate ? 
                    format(new Date(selectedAssignment.dueDate), 'MMM d, yyyy h:mm a') : 
                    'No deadline'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Created On</Typography>
                <Typography variant="body1">
                  {format(new Date(selectedAssignment.createdAt), 'MMM d, yyyy h:mm a')}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                <Paper elevation={0} sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedAssignment.description || 'No description provided.'}
                  </Typography>
                </Paper>
              </Grid>
              
              {selectedAssignment.fileUrl && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Attachment</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button 
                      variant="outlined" 
                      href={selectedAssignment.fileUrl} 
                      target="_blank"
                      startIcon={<AssignmentIcon />}
                    >
                      Download Attachment
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewAssignmentDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setViewAssignmentDialogOpen(false);
              if (selectedAssignment) {
                handleViewSubmissions(selectedAssignment);
              }
            }}
          >
            View Submissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog
        open={submissionsDialogOpen}
        onClose={() => setSubmissionsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {showAllSubmissions ? 'All Submissions' : `Submissions for: ${selectedAssignment?.title}`}
        </DialogTitle>
        <DialogContent>
          {submissionsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Filters */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <FilterList sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Filter Submissions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Subject</InputLabel>
                      <Select
                        value={selectedSubjectFilter}
                        onChange={handleSubjectFilterChange}
                        label="Subject"
                      >
                        <MenuItem value="">All Subjects</MenuItem>
                        {subjects.map((subject) => (
                          <MenuItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Assignment Type</InputLabel>
                      <Select
                        value={selectedExamTypeFilter}
                        onChange={handleExamTypeFilterChange}
                        label="Assignment Type"
                      >
                        <MenuItem value="">All Types</MenuItem>
                        {examTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {filteredSubmissions.length === 0 ? (
                <Alert severity="info">No submissions match your filter criteria.</Alert>
              ) : (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Showing {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
                  </Typography>
                  
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell>Section</TableCell>
                          {showAllSubmissions && <TableCell>Subject</TableCell>}
                          {showAllSubmissions && <TableCell>Assignment Type</TableCell>}
                          <TableCell>Submission Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>{submission.student.name}</TableCell>
                            <TableCell>{submission.student.section}</TableCell>
                            {showAllSubmissions && (
                              <TableCell>
                                {getSubjectName(submission.subjectId)}
                              </TableCell>
                            )}
                            {showAllSubmissions && (
                              <TableCell>
                                {getExamTypeName(submission.examType)}
                              </TableCell>
                            )}
                            <TableCell>
                              {format(new Date(submission.submissionDate), 'MMM d, yyyy h:mm a')}
                            </TableCell>
                            <TableCell>
                              {submission.graded ? (
                                <Chip label="Graded" color="success" size="small" />
                              ) : (
                                <Chip label="Not Graded" color="warning" size="small" />
                              )}
                            </TableCell>
                            <TableCell>
                              {submission.graded ? submission.score : '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                startIcon={<Grade />}
                                onClick={() => openGradeDialog(submission)}
                              >
                                {submission.graded ? 'Update Grade' : 'Grade'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmissionsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog
        open={gradeDialogOpen}
        onClose={() => !grading && setGradeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Grade Submission
        </DialogTitle>
        <DialogContent>
          {gradeSuccess ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Submission graded successfully!
            </Alert>
          ) : (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Student: {selectedSubmission?.student.name}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Section: {selectedSubmission?.student.section}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Submitted: {selectedSubmission?.submissionDate && 
                  format(new Date(selectedSubmission.submissionDate), 'MMM d, yyyy h:mm a')}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Student's Submission:
              </Typography>
              <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
                <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedSubmission?.submissionText}
                </Typography>
              </Paper>
              
              <TextField
                label="Score"
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                fullWidth
                margin="normal"
                required
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                disabled={grading}
              />
              
              <TextField
                label="Feedback"
                multiline
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Provide feedback on the submission..."
                disabled={grading}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setGradeDialogOpen(false)} 
            disabled={grading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGradeSubmission} 
            variant="contained" 
            color="primary"
            disabled={grading || !score || gradeSuccess}
            startIcon={grading ? <CircularProgress size={20} /> : <Assessment />}
          >
            {grading ? 'Submitting...' : 'Submit Grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAssignmentManager; 