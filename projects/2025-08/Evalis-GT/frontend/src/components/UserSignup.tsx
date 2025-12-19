import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { BATCHES } from '../data/universityData';

interface UserSignupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserSignup: React.FC<UserSignupProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    id: '',
    section: 'CSE-1',
    batch: '2023-2027'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name || !formData.id) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Firebase registration is disabled - using Clerk only
      setError('User registration is currently disabled. Please contact an administrator.');
      return;
      
      // Create student record in database would go here
      // await createStudent({
      //   id: formData.id,
      //   name: formData.name,
      //   email: formData.email,
      //   section: formData.section,
      //   batch: formData.batch
      // });
      
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Create New Account
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Account created successfully! You can now login.
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Student ID"
          name="id"
          value={formData.id}
          onChange={handleChange}
          margin="normal"
          required
          fullWidth
          disabled={loading || success}
        />
        
        <TextField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
          fullWidth
          disabled={loading || success}
        />
        
        <TextField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
          fullWidth
          disabled={loading || success}
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Section</InputLabel>
          <Select
            name="section"
            value={formData.section}
            label="Section"
            onChange={handleSelectChange}
            disabled={loading || success}
          >
            <MenuItem value="CSE-1">CSE-1</MenuItem>
            <MenuItem value="CSE-2">CSE-2</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Batch</InputLabel>
          <Select
            name="batch"
            value={formData.batch}
            label="Batch"
            onChange={handleSelectChange}
            disabled={loading || success}
          >
            {BATCHES.map((batch) => (
              <MenuItem key={batch.id} value={batch.id}>
                {batch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
          fullWidth
          disabled={loading || success}
        />
        
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          margin="normal"
          required
          fullWidth
          disabled={loading || success}
        />
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          {onCancel && (
            <Button 
              onClick={onCancel}
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
            disabled={loading || success}
            sx={{ ml: 'auto' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default UserSignup; 