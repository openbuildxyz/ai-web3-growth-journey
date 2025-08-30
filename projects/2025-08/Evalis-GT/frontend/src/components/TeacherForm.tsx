import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  VpnKey as KeyIcon,
  ContentCopy as CopyIcon,
  Refresh as ResetIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { Teacher } from '../types/university';

interface TeacherFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
  teacher?: Teacher;
  title?: string;
  saving?: boolean;
  error?: string;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  open,
  onClose,
  onSave,
  teacher,
  title,
  saving = false,
  error
}) => {
  const [form, setForm] = useState<Teacher>({
    id: '',
    name: '',
    email: '',
    subjects: []
  });

  const [passwordResetStatus, setPasswordResetStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState<boolean>(false);

  useEffect(() => {
    if (teacher) {
      setForm(teacher);
      // Reset any previous password reset attempts
      setPasswordResetStatus({ loading: false });
      setGeneratedPassword('');
      setShowGeneratedPassword(false);
    } else {
      setForm({
        id: '',
        name: '',
        email: '',
        subjects: []
      });
      // Generate initial password for new teachers
      generateRandomPassword();
    }
  }, [teacher, open]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include the generated password in the submission if it's a new teacher
    if (!teacher && generatedPassword) {
      onSave({
        ...form, 
        initialPassword: generatedPassword,
        password: generatedPassword
      });
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
        message: 'Password reset functionality is disabled'
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
      <DialogTitle>
        {title || (teacher ? 'Edit Teacher' : 'Add New Teacher')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {passwordResetStatus.message && (
            <Alert 
              severity={passwordResetStatus.success ? "success" : "error"} 
              sx={{ mb: 2 }}
            >
              {passwordResetStatus.message}
            </Alert>
          )}

          <TextField
            margin="dense"
            label="Teacher ID"
            name="id"
            value={form.id}
            onChange={handleTextChange}
            fullWidth
            variant="outlined"
            required
            disabled={!!teacher}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={form.name}
            onChange={handleTextChange}
            fullWidth
            variant="outlined"
            required
            sx={{ mb: 2 }}
          />

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

          {!teacher && (
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
                This password will be required for the teacher's first login. 
                Make sure to share it securely.
              </Typography>
            </>
          )}

          {teacher && teacher.email && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EmailIcon />}
                onClick={handlePasswordReset}
                disabled={passwordResetStatus.loading || !form.email}
              >
                {passwordResetStatus.loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Sending...
                  </>
                ) : (
                  'Send Password Reset Email'
                )}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" disabled={saving}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            color="primary" 
            variant="contained" 
            disabled={saving}
          >
            {saving ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Saving...
              </>
            ) : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeacherForm; 