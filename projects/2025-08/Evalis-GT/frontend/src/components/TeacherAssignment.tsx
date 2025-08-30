import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Edit, Cancel, Delete } from '@mui/icons-material';
import { Teacher, Subject, ExamType } from '../types/university';
import TeacherForm from './TeacherForm';
import SubmissionUploader from './SubmissionUploader';

export interface SubmissionData {
  subjectId: string;
  examTypeId: string;
  title: string;
  description: string;
  file: File;
  dueDate?: string;
}

interface TeacherAssignmentProps {
  teachers: Teacher[];
  subjects: Subject[];
  onAssignSubject: (teacherId: string, subjectId: string) => void;
  onRemoveSubject: (teacherId: string, subjectId: string) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher?: (teacherId: string) => void;
}

const TeacherAssignment: React.FC<TeacherAssignmentProps> = ({
  teachers,
  subjects,
  onAssignSubject,
  onRemoveSubject,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAssign = async () => {
    if (!selectedTeacher || !selectedSubject) {
      setNotification({
        open: true,
        message: 'Please select both a teacher and a subject',
        severity: 'error'
      });
      return;
    }

    // Check if teacher already has this subject
    const teacher = teachers.find(t => t.id === selectedTeacher);
    if (teacher && teacher.subjects.includes(selectedSubject)) {
      setNotification({
        open: true,
        message: 'This teacher already has this subject assigned',
        severity: 'error'
      });
      return;
    }

    setIsAssigning(true);
    
    try {
      await onAssignSubject(selectedTeacher, selectedSubject);
      
      // Reset selections
      setSelectedSubject('');
    } catch (error) {
      console.error("Error in handleAssign:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveSubject = (teacherId: string, subjectId: string) => {
    onRemoveSubject(teacherId, subjectId);
  };

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setOpenDialog(true);
  };

  const handleSaveTeacher = async (teacher: Teacher) => {
    setIsSaving(true);
    try {
      if (editingTeacher) {
        await onEditTeacher(teacher);
      } else {
        await onAddTeacher(teacher);
      }
      
      // Show success notification with password info if available
      if (!editingTeacher && 'initialPassword' in teacher) {
        setNotification({
          open: true,
          message: `Teacher ${teacher.name} added successfully. Initial password: ${teacher.initialPassword}. A password reset link has been sent to their email.`,
          severity: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: `Teacher ${teacher.name} ${editingTeacher ? 'updated' : 'added'} successfully.`,
          severity: 'success'
        });
      }
      
      // Reset form and close dialog
      setEditingTeacher(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving teacher:", error);
      setNotification({
        open: true,
        message: `Failed to ${editingTeacher ? 'update' : 'add'} teacher. Please try again.`,
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setOpenDialog(true);
  };

  const openDeleteDialog = (teacherId: string) => {
    setTeacherToDelete(teacherId);
    setDeleteConfirmDialog(true);
  };

  const handleDeleteTeacher = () => {
    if (onDeleteTeacher && teacherToDelete) {
      onDeleteTeacher(teacherToDelete);
      setDeleteConfirmDialog(false);
      setTeacherToDelete('');
    }
  };

  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : subjectId;
  };

  const getTeacherName = (teacherId: string): string => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : teacherId;
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assign Subjects to Teachers
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Teacher</InputLabel>
                <Select
                  value={selectedTeacher}
                  label="Select Teacher"
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  disabled={isAssigning}
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Subject</InputLabel>
                <Select
                  value={selectedSubject}
                  label="Select Subject"
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedTeacher || isAssigning}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleAssign}
                disabled={!selectedTeacher || !selectedSubject || isAssigning}
                startIcon={isAssigning ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isAssigning ? "Assigning..." : "Assign Subject"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Teacher Management
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddTeacher}
                >
                  Add Teacher
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                Add new teachers or edit existing teacher information.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Assigned Subjects</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.id}</TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      {teacher.subjects.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {teacher.subjects.map((subjectId) => (
                            <Chip
                              key={subjectId}
                              label={getSubjectName(subjectId)}
                              size="small"
                              onDelete={() => handleRemoveSubject(teacher.id, subjectId)}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No subjects assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit Teacher">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openEditDialog(teacher)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {onDeleteTeacher && (
                          <Tooltip title="Delete Teacher">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDeleteDialog(teacher.id)}
                              sx={{ ml: 1 }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {teachers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No teachers found. Add a teacher to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Replace the existing dialog with TeacherForm */}
      <TeacherForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveTeacher}
        teacher={editingTeacher || undefined}
        saving={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete teacher: <strong>{getTeacherName(teacherToDelete)}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone. All associated data including subject assignments will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog(false)} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button onClick={handleDeleteTeacher} color="error" variant="contained" startIcon={<Delete />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

interface TeacherAssignmentViewProps {
  subjects: Subject[];
  onAssignmentUploaded: (data: SubmissionData) => Promise<boolean>;
  examTypes: ExamType[];
}

export const TeacherAssignmentView: React.FC<TeacherAssignmentViewProps> = ({
  subjects,
  onAssignmentUploaded,
  examTypes
}) => {
  return (
    <Box>
      <SubmissionUploader
        subjects={subjects}
        examTypes={examTypes}
        onUploadSubmission={onAssignmentUploaded}
      />
    </Box>
  );
};

export default TeacherAssignment; 