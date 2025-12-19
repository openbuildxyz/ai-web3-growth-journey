import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  AlertTitle,
  Paper,
  CircularProgress
} from '@mui/material';

interface PasswordResetFormProps {
  onClose?: () => void;
  email?: string;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ 
  onClose,
  email: initialEmail = ''
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setResult({
        success: false,
        message: 'Please enter an email address'
      });
      return;
    }

    setLoading(true);
    try {
      // Firebase password reset is disabled - using Clerk only
      setResult({
        success: false,
        message: 'Password reset is currently disabled. Please contact an administrator.'
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Password reset functionality is disabled'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Reset Password
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Enter your email address to receive a password reset link.
      </Typography>

      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
        >
          <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
          {result.message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
          disabled={loading || result?.success}
        />
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          {onClose && (
            <Button 
              onClick={onClose} 
              color="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || result?.success || !email}
            sx={{ ml: 'auto' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PasswordResetForm; 