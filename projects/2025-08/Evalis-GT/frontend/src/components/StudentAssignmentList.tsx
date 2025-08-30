import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle,
  Cancel,
  CloudUpload,
  FilterList
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getStudentAssignments, submitAssignment } from '../api';

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
  teacherId: string;
  teacher: {
    id: string;
    name: string;
  };
  dueDate: string;
  fileUrl: string;
  createdAt: string;
  submitted: boolean;
  submissionId: number | null;
  grade: number | null;
  graded: boolean;
}

const StudentAssignmentList: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [assignmentDetailsOpen, setAssignmentDetailsOpen] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Get unique subjects from assignments
  const subjects = React.useMemo(() => {
    const subjectSet = new Set<string>();
    assignments.forEach(assignment => {
      if (assignment.subject && assignment.subject.name) {
        subjectSet.add(assignment.subject.id);
      }
    });
    return Array.from(subjectSet).map(id => {
      const subject = assignments.find(a => a.subject?.id === id)?.subject;
      return subject ? { id, name: subject.name } : { id, name: id };
    });
  }, [assignments]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await getStudentAssignments();
        // Process data to ensure subject and teacher always exist as objects
        const processedData = response.data.map((assignment: Assignment) => ({
          ...assignment,
          subject: assignment.subject || { id: '', name: '' },
          teacher: assignment.teacher || { id: '', name: '' }
        }));
        setAssignments(processedData);
        setFilteredAssignments(processedData);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load assignments');
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [submitSuccess]);

  useEffect(() => {
    filterAssignments();
  }, [subjectFilter, statusFilter, assignments]);

  const filterAssignments = () => {
    let filtered = [...assignments];
    
    // Filter by subject
    if (subjectFilter) {
      filtered = filtered.filter(assignment => 
        assignment.subject?.id === subjectFilter
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'submitted') {
        filtered = filtered.filter(assignment => assignment.submitted);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(assignment => 
          !assignment.submitted && !isPastDue(assignment.dueDate)
        );
      } else if (statusFilter === 'pastdue') {
        filtered = filtered.filter(assignment => 
          !assignment.submitted && isPastDue(assignment.dueDate)
        );
      } else if (statusFilter === 'graded') {
        filtered = filtered.filter(assignment => assignment.submitted && assignment.graded);
      }
    }
    
    // Sort by due date (closest first)
    filtered.sort((a, b) => {
      // Assignments with no due date go to the end
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    setFilteredAssignments(filtered);
  };

  const handleSubjectFilterChange = (event: SelectChangeEvent) => {
    setSubjectFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    
    try {
      setSubmitting(true);
      await submitAssignment(selectedAssignment.id, {
        submissionText
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmissionDialogOpen(false);
        setSubmitSuccess(false);
        setSubmissionText('');
        setSelectedAssignment(null);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
      console.error('Error submitting assignment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmissionDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionDialogOpen(true);
  };

  const closeSubmissionDialog = () => {
    setSubmissionDialogOpen(false);
    setSubmissionText('');
    setSelectedAssignment(null);
  };

  const openAssignmentDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setAssignmentDetailsOpen(true);
  };

  const isPastDue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    if (assignment.submitted) {
      if (assignment.graded) {
        return { 
          icon: <CheckCircle />,
          label: "Graded", 
          color: "success" as const
        };
      }
      return { 
        icon: <CheckCircle />,
        label: "Submitted", 
        color: "success" as const
      };
    } else if (isPastDue(assignment.dueDate)) {
      return { 
        icon: <Cancel />,
        label: "Past Due", 
        color: "error" as const
      };
    } else {
      return { 
        icon: <AssignmentIcon />,
        label: "Pending", 
        color: "primary" as const
      };
    }
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

  if (assignments.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">No assignments found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Your Assignments
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 3, py: 2, px: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FilterList sx={{ color: 'text.secondary' }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Subject</InputLabel>
              <Select
                value={subjectFilter}
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
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="graded">Graded</MenuItem>
                <MenuItem value="pastdue">Past Due</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="textSecondary">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </Typography>
          </Grid>
        </Grid>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssignments.map((assignment) => {
              const status = getAssignmentStatus(assignment);
              return (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <AssignmentIcon sx={{ mr: 1 }} />
                      {assignment.title}
                    </Box>
                  </TableCell>
                  <TableCell>{assignment.subject?.name || 'No subject'}</TableCell>
                  <TableCell>
                    {assignment.dueDate ? (
                      format(new Date(assignment.dueDate), 'MMM d, yyyy h:mm a')
                    ) : (
                      'No deadline'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={status.icon}
                      label={status.label}
                      color={status.color}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {assignment.submitted && assignment.graded ? (
                      assignment.grade
                    ) : assignment.submitted ? (
                      'Not graded yet'
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex">
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => openAssignmentDetails(assignment)}
                        sx={{ mr: 1 }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<CloudUpload />}
                        onClick={() => openSubmissionDialog(assignment)}
                        disabled={assignment.submitted || isPastDue(assignment.dueDate)}
                      >
                        Submit
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Assignment Details Dialog */}
      <Dialog
        open={assignmentDetailsOpen}
        onClose={() => setAssignmentDetailsOpen(false)}
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
                <Typography variant="body1">{selectedAssignment.subject?.name || 'No subject'}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Teacher</Typography>
                <Typography variant="body1">{selectedAssignment.teacher?.name || 'No teacher'}</Typography>
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
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Typography variant="body1">
                  <Chip 
                    icon={getAssignmentStatus(selectedAssignment).icon}
                    label={getAssignmentStatus(selectedAssignment).label}
                    color={getAssignmentStatus(selectedAssignment).color}
                    size="small" 
                    sx={{ mt: 0.5 }}
                  />
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
              
              {selectedAssignment.submitted && selectedAssignment.graded && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="textSecondary">Grade</Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>{selectedAssignment.grade}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDetailsOpen(false)}>
            Close
          </Button>
          {selectedAssignment && !selectedAssignment.submitted && !isPastDue(selectedAssignment.dueDate) && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                setAssignmentDetailsOpen(false);
                openSubmissionDialog(selectedAssignment);
              }}
            >
              Submit Assignment
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Assignment Submission Dialog */}
      <Dialog
        open={submissionDialogOpen}
        onClose={closeSubmissionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submit Assignment: {selectedAssignment?.title}
        </DialogTitle>
        <DialogContent>
          {submitSuccess ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Assignment submitted successfully!
            </Alert>
          ) : (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Subject: {selectedAssignment?.subject?.name || 'No subject'}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Teacher: {selectedAssignment?.teacher?.name || 'No teacher'}
              </Typography>
              {selectedAssignment?.dueDate && (
                <Typography variant="subtitle2" gutterBottom>
                  Due Date: {format(new Date(selectedAssignment.dueDate), 'MMM d, yyyy h:mm a')}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                {selectedAssignment?.description}
              </Typography>
              
              <TextField
                label="Your Solution"
                multiline
                rows={8}
                fullWidth
                variant="outlined"
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                margin="normal"
                placeholder="Type your answer or solution here..."
                required
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSubmissionDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAssignment} 
            variant="contained" 
            color="primary"
            disabled={submitting || !submissionText || submitSuccess}
            startIcon={submitting ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentAssignmentList; 