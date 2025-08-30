import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  SelectChangeEvent,
  Button,
  Alert
} from '@mui/material';
import { Subject, ExamType } from '../types/university';
import FileUploader from './FileUploader';

interface SubmissionUploaderProps {
  subjects: Subject[];
  examTypes: ExamType[];
  onUploadSubmission: (data: SubmissionData) => Promise<any>;
}

export interface SubmissionData {
  subjectId: string;
  examTypeId: string;
  title: string;
  description: string;
  file: File;
  dueDate?: string;
}

const SubmissionUploader: React.FC<SubmissionUploaderProps> = ({
  subjects,
  examTypes,
  onUploadSubmission
}) => {
  const [subjectId, setSubjectId] = useState<string>('');
  const [examTypeId, setExamTypeId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSubjectId(event.target.value);
  };
  
  const handleExamTypeChange = (event: SelectChangeEvent) => {
    setExamTypeId(event.target.value);
  };
  
  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    return Promise.resolve(); // Just store the file, don't actually upload yet
  };
  
  const handleSubmit = async () => {
    // Validate form
    if (!subjectId || !examTypeId || !title || !file) {
      setError('Please fill in all required fields and upload a file');
      return;
    }
    
    setError(null);
    try {
      // Pass data to parent component for actual upload
      await onUploadSubmission({
        subjectId,
        examTypeId,
        title,
        description,
        file,
        dueDate: dueDate || undefined
      });
      
      setSuccess(true);
      
      // Reset form after successful upload
      setTimeout(() => {
        setSubjectId('');
        setExamTypeId('');
        setTitle('');
        setDescription('');
        setDueDate('');
        setFile(null);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error uploading submission:', err);
      setError('Failed to create submission. Please try again.');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create New Submission
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Submission created successfully!
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subjectId}
                label="Subject"
                onChange={handleSubjectChange}
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.id} - {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Exam Type</InputLabel>
              <Select
                value={examTypeId}
                label="Exam Type"
                onChange={handleExamTypeChange}
              >
                {examTypes.map((examType) => (
                  <MenuItem key={examType.id} value={examType.id}>
                    {examType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Assignment Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Due Date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FileUploader
              title="Upload Assignment File"
              onUpload={handleFileUpload}
              accept=".pdf,.doc,.docx,.zip,.txt,.ppt,.pptx"
              description="Upload assignment instructions, exam paper, or study materials"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={!subjectId || !examTypeId || !title || !file}
            >
              Create Submission
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SubmissionUploader; 