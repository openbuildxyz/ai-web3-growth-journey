import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
  FormHelperText
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { Subject } from '../types/university';
import { Semester } from '../api/semesterService';
import { getAllSemesters } from '../api/semesterService';
import { getAllBatches } from '../api/batchService';

interface SubjectFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (subject: Partial<Subject>) => void;
  subject?: Subject;
  title?: string;
  saving?: boolean;
  error?: string;
}

const SubjectForm: React.FC<SubjectFormProps> = ({
  open,
  onClose,
  onSave,
  subject,
  title = 'Create Subject',
  saving = false,
  error
}) => {
  const [form, setForm] = useState<Partial<Subject>>({
    id: '',
    name: '',
    section: '',
    description: '',
    credits: 3,
    semesterId: '',
    batchId: ''
  });
  
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load semesters and batches on component mount
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  // Initialize form when subject prop changes
  useEffect(() => {
    if (subject) {
      setForm(subject);
    } else {
      setForm({
        id: '',
        name: '',
        section: '',
        description: '',
        credits: 3,
        semesterId: '',
        batchId: ''
      });
    }
  }, [subject, open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch semesters and batches in parallel
      const [semestersData, batchesData] = await Promise.all([
        getAllSemesters(),
        getAllBatches()
      ]);
      
      setSemesters(semestersData);
      setBatches(batchesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue)) {
      setForm(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If selecting a semester, automatically set the batchId
    if (name === 'semesterId' && value) {
      const selectedSemester = semesters.find(sem => sem.id === value);
      if (selectedSemester) {
        setForm(prev => ({
          ...prev,
          batchId: selectedSemester.batchId
        }));
      }
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.name) {
      errors.name = 'Subject name is required';
    }
    
    if (!form.section) {
      errors.section = 'Section is required';
    }
    
    if (!form.credits || form.credits < 1) {
      errors.credits = 'Credits must be at least 1';
    }
    
    if (!form.semesterId && !form.batchId) {
      errors.semesterId = 'Either semester or batch must be selected';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Subject ID"
                  name="id"
                  value={form.id || ''}
                  onChange={handleTextChange}
                  fullWidth
                  margin="normal"
                  placeholder="e.g., CS101"
                  disabled={!!subject}
                  helperText={formErrors.id || "Leave blank to auto-generate"}
                  error={!!formErrors.id}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Subject Name"
                  name="name"
                  value={form.name || ''}
                  onChange={handleTextChange}
                  fullWidth
                  margin="normal"
                  required
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!formErrors.section}>
                  <InputLabel>Section</InputLabel>
                  <Select
                    name="section"
                    value={form.section || ''}
                    label="Section"
                    onChange={handleSelectChange}
                    required
                  >
                    <MenuItem value="CSE-1">CSE-1</MenuItem>
                    <MenuItem value="CSE-2">CSE-2</MenuItem>
                    <MenuItem value="CSE-3">CSE-3</MenuItem>
                    <MenuItem value="ECE-1">ECE-1</MenuItem>
                    <MenuItem value="ECE-2">ECE-2</MenuItem>
                  </Select>
                  {formErrors.section && (
                    <FormHelperText>{formErrors.section}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Credits"
                  name="credits"
                  type="number"
                  value={form.credits || ''}
                  onChange={handleNumericChange}
                  fullWidth
                  margin="normal"
                  required
                  inputProps={{ min: 1, max: 6 }}
                  error={!!formErrors.credits}
                  helperText={formErrors.credits}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!formErrors.semesterId}>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    name="semesterId"
                    value={form.semesterId || ''}
                    label="Semester"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="">
                      <em>Select a semester</em>
                    </MenuItem>
                    {semesters.map((semester) => (
                      <MenuItem key={semester.id} value={semester.id}>
                        {semester.name} (Batch: {semester.Batch?.name || semester.batchId})
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.semesterId && (
                    <FormHelperText>{formErrors.semesterId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" disabled={!!form.semesterId}>
                  <InputLabel>Batch (Optional if semester selected)</InputLabel>
                  <Select
                    name="batchId"
                    value={form.batchId || ''}
                    label="Batch (Optional if semester selected)"
                    onChange={handleSelectChange}
                    disabled={!!form.semesterId}
                  >
                    <MenuItem value="">
                      <em>Select a batch</em>
                    </MenuItem>
                    {batches.map((batch) => (
                      <MenuItem key={batch.id} value={batch.id}>
                        {batch.name} ({batch.department})
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {form.semesterId 
                      ? "Batch is automatically set based on selected semester" 
                      : "Required if no semester is selected"}
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={form.description || ''}
                  onChange={handleTextChange}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={saving || loading}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubjectForm; 