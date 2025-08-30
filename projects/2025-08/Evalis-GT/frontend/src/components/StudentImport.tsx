import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { BATCHES } from '../data/universityData';
import { importStudents, sendBulkPasswordResetEmails } from '../api';

interface StudentImportProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (batchId: string, students: any[]) => void;
}

interface StudentData {
  id: string;
  name: string;
  section: string;
  email?: string;
}

const StudentImport: React.FC<StudentImportProps> = ({ open, onClose, onSuccess }) => {
  const [batch, setBatch] = useState<string>(BATCHES[0]?.id || '');
  const [studentData, setStudentData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importedStudents, setImportedStudents] = useState<StudentData[]>([]);
  const [sendPasswordResetEmails, setSendPasswordResetEmails] = useState<boolean>(true);
  const [processingEmails, setProcessingEmails] = useState<boolean>(false);
  const [emailResults, setEmailResults] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const handleBatchChange = (event: SelectChangeEvent) => {
    setBatch(event.target.value);
  };

  const handleDataChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStudentData(event.target.value);
  };

  const handleImport = async () => {
    if (!batch) {
      setError('Please select a batch');
      return;
    }

    if (!studentData.trim()) {
      setError('Please enter student data');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Parse student data (assumed comma or tab separated, or JSON)
      let parsedStudents: StudentData[] = [];
      
      try {
        // Try parsing as JSON first
        parsedStudents = JSON.parse(studentData);
      } catch (parseError) {
        // If not JSON, try parsing as CSV/TSV
        const lines = studentData.trim().split('\n');
        const headerLine = lines[0];
        const hasTabs = headerLine.includes('\t');
        const separator = hasTabs ? '\t' : ',';
        
        const headers = headerLine.split(separator).map(h => h.trim().toLowerCase());
        const idIndex = headers.findIndex(h => h === 'id' || h === 'student id');
        const nameIndex = headers.findIndex(h => h === 'name' || h === 'student name');
        const sectionIndex = headers.findIndex(h => h === 'section');
        const emailIndex = headers.findIndex(h => h === 'email');
        
        if (idIndex === -1 || nameIndex === -1) {
          throw new Error('CSV/TSV data must include id and name columns');
        }
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(separator);
          
          parsedStudents.push({
            id: values[idIndex].trim(),
            name: values[nameIndex].trim(),
            section: sectionIndex !== -1 ? values[sectionIndex].trim() : 'CSE-1',
            email: emailIndex !== -1 ? values[emailIndex].trim() : undefined
          });
        }
      }
      
      if (parsedStudents.length === 0) {
        throw new Error('No valid student data found');
      }
      
      // Send the data to the API
      await importStudents({
        students: parsedStudents,
        batch
      });
      
      setImportedStudents(parsedStudents);
      
      // Send password reset emails if requested and there are students with email addresses
      if (sendPasswordResetEmails) {
        const studentsWithEmail = parsedStudents.filter(s => s.email);
        
        if (studentsWithEmail.length > 0) {
          setProcessingEmails(true);
          
          try {
            const emailResponse = await sendBulkPasswordResetEmails(
              studentsWithEmail.map(s => s.email as string)
            );
            
            setEmailResults({
              success: emailResponse.data.results.success,
              failed: emailResponse.data.results.failed
            });
          } catch (emailError) {
            console.error('Error sending password reset emails:', emailError);
          } finally {
            setProcessingEmails(false);
          }
        }
      }
      
      // Call onSuccess with the imported data
      onSuccess(batch, parsedStudents);
    } catch (error: any) {
      console.error('Import error:', error);
      setError(error.message || 'Failed to import students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Students</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Batch</InputLabel>
            <Select
              value={batch}
              label="Batch"
              onChange={handleBatchChange}
              disabled={loading}
            >
              {BATCHES.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle1" gutterBottom>
            Enter student data as CSV, TSV, or JSON
          </Typography>
          
          <Typography variant="caption" color="text.secondary" paragraph>
            CSV/TSV format requires headers: id, name, section (optional), email (optional)
          </Typography>

          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder="id,name,section,email
E23CSE005,John Doe,CSE-1,john.doe@example.com
E23CSE006,Jane Smith,CSE-2,jane.smith@example.com"
            value={studentData}
            onChange={handleDataChange}
            disabled={loading || importedStudents.length > 0}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={sendPasswordResetEmails}
                onChange={(e) => setSendPasswordResetEmails(e.target.checked)}
                disabled={loading || importedStudents.length > 0}
              />
            }
            label="Send password reset emails to students with email addresses"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {importedStudents.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Import Results
              </Typography>
              <Typography>
                Successfully imported {importedStudents.length} students to {
                  BATCHES.find(b => b.id === batch)?.name || batch
                }
              </Typography>
              
              {emailResults && (
                <Alert 
                  severity={emailResults.failed > 0 ? "warning" : "success"}
                  sx={{ mt: 2 }}
                >
                  Password reset emails: {emailResults.success} sent successfully, {emailResults.failed} failed
                </Alert>
              )}
              
              {processingEmails && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography>Sending password reset emails...</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading || processingEmails}>
          Close
        </Button>
        <Button 
          onClick={handleImport} 
          color="primary" 
          disabled={loading || processingEmails || importedStudents.length > 0}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Importing...' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentImport; 