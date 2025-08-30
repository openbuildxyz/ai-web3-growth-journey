import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  SelectChangeEvent,
  Divider,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  KeyRounded as KeyIcon,
  RefreshRounded as ResetIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { Student } from '../types/university';
import { resetStudentPassword } from '../api';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  student?: Student;
  title: string;
  saving?: boolean;
  error?: string;
  selectedBatch?: string;
  availableBatches?: Array<{ id: string; name: string; }>;
}

const StudentForm: React.FC<StudentFormProps> = ({
  open,
  onClose,
  onSave,
  student,
  title,
  saving = false,
  error,
  selectedBatch,
  availableBatches = []
}) => {
  // Get the batch to use (selectedBatch or first available)
  const defaultBatch = selectedBatch || (availableBatches.length > 0 ? availableBatches[0].id : '');
  
  const [form, setForm] = useState<Student>({
    id: '',
    name: '',
    section: 'CSE-1',
    email: '',
    batch: defaultBatch,
    role: 'student'
  });

  const [passwordResetStatus, setPasswordResetStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState<boolean>(false);

  useEffect(() => {
    const currentDefaultBatch = selectedBatch || (availableBatches.length > 0 ? availableBatches[0].id : '');
    
    if (student) {
      setForm(student);
      // Reset any previous password reset attempts
      setPasswordResetStatus({ loading: false });
      setGeneratedPassword('');
      setShowGeneratedPassword(false);
    } else {
      setForm({
        id: '',
        name: '',
        section: 'CSE-1',
        email: '',
        batch: currentDefaultBatch,
        role: 'student'
      });
      // Generate initial password for new students
      generateRandomPassword();
    }
  }, [student, open, selectedBatch, availableBatches]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include the generated password in the submission if it's a new student
    if (!student && generatedPassword) {
      onSave({...form, initialPassword: generatedPassword});
    } else {
      onSave(form);
    }
  };

  const handlePasswordReset = async () => {
    if (!form.email) {
      setPasswordResetStatus({
        loading: false,
        success: false,
        message: 'Email address is required for password reset'
      });
      return;
    }

    setPasswordResetStatus({ loading: true });
    try {
      // First check if student exists and can have password reset via our API
      if (form.id) {
        await resetStudentPassword(form.id, null);
      }
      
      // Firebase password reset is disabled - using Clerk only
      setPasswordResetStatus({
        loading: false,
        success: false,
        message: 'Password reset is currently disabled. Please contact an administrator.'
      });
    } catch (error) {
      setPasswordResetStatus({
        loading: false,
        success: false,
        message: 'An error occurred while sending the password reset email'
      });
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    setShowGeneratedPassword(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Student ID"
            name="id"
            value={form.id}
            onChange={handleTextChange}
            fullWidth
            variant="outlined"
            required
            disabled={!!student}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleTextChange}
            fullWidth
            variant="outlined"
            required
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Section</InputLabel>
            <Select
              name="section"
              value={form.section}
              label="Section"
              onChange={handleSelectChange}
              required
            >
              <MenuItem value="CSE-1">CSE-1</MenuItem>
              <MenuItem value="CSE-2">CSE-2</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Batch</InputLabel>
            <Select
              name="batch"
              value={form.batch}
              label="Batch"
              onChange={handleSelectChange}
              required
            >
              {availableBatches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Email Address"
            name="email"
            value={form.email || ''}
            onChange={handleTextChange}
            fullWidth
            variant="outlined"
            type="email"
            required
            sx={{ mb: 2 }}
          />

          {!student && (
            <>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Initial Password
                </Typography>
              </Divider>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  margin="dense"
                  label="Generated Password"
                  value={generatedPassword}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <KeyIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    ),
                    endAdornment: (
                      <Tooltip title="Copy to clipboard">
                        <IconButton onClick={copyToClipboard} edge="end">
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                  type={showGeneratedPassword ? 'text' : 'password'}
                />
                <Tooltip title="Generate new password">
                  <IconButton onClick={generateRandomPassword} sx={{ ml: 1 }}>
                    <ResetIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                This password will be required for the student's first login. 
                Make sure to share it securely.
              </Typography>
            </>
          )}

          {student && (
            <>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Password Management
                </Typography>
              </Divider>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ResetIcon />}
                  onClick={handlePasswordReset}
                  disabled={!form.email || passwordResetStatus.loading}
                  fullWidth
                >
                  {passwordResetStatus.loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Send Password Reset Link'
                  )}
                </Button>
              </Box>

              {passwordResetStatus.message && (
                <Alert
                  severity={passwordResetStatus.success ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                >
                  {passwordResetStatus.message}
                </Alert>
              )}
            </>
          )}

          {error && (
            <Box mt={2}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StudentForm; 