import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  Checkbox,
  Paper
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { BATCHES } from '../data/universityData';
import { sendBulkPasswordResetEmails } from '../api';
import axios from 'axios';
import config from '../config/environment';

interface StudentExcelImportProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (batchId: string, importData: any) => void;
}

const StudentExcelImport: React.FC<StudentExcelImportProps> = ({ open, onClose, onSuccess }) => {
  const [batch, setBatch] = useState<string>(BATCHES[0]?.id || '');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<{
    created: number;
    updated: number;
    totalImported: number;
    emails: string[];
  } | null>(null);
  const [sendPasswordResetEmails, setSendPasswordResetEmails] = useState<boolean>(true);
  const [processingEmails, setProcessingEmails] = useState<boolean>(false);
  const [emailResults, setEmailResults] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const handleBatchChange = (event: SelectChangeEvent) => {
    setBatch(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!batch) {
      setError('Please select a batch');
      return;
    }

    if (!file) {
      setError('Please select a file to import');
      return;
    }

    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['xlsx', 'xls', 'csv'].includes(fileExt)) {
      setError('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('batchId', batch);

      // Set up request with token
      const token = localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
      const response = await axios.post(
        `${config.API_ENDPOINTS.STUDENTS}/import-excel`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Set import results
      setImportResults({
        created: response.data.created,
        updated: response.data.updated,
        totalImported: response.data.totalImported,
        emails: response.data.emails || []
      });

      // Send password reset emails if requested and there are emails
      if (sendPasswordResetEmails && response.data.emails && response.data.emails.length > 0) {
        setProcessingEmails(true);
        
        try {
          const emailResponse = await sendBulkPasswordResetEmails(response.data.emails);
          
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

      // Call onSuccess with the imported data
      onSuccess(batch, { 
        created: response.data.created,
        updated: response.data.updated,
        totalImported: response.data.totalImported
      });
    } catch (error: any) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to import students';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Students from Excel</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Batch</InputLabel>
            <Select
              value={batch}
              label="Batch"
              onChange={handleBatchChange}
              disabled={loading || !!importResults}
            >
              {BATCHES.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              mb: 3, 
              textAlign: 'center',
              cursor: !loading && !importResults ? 'pointer' : 'default',
              bgcolor: !loading && !importResults && file ? 'action.selected' : 'background.paper',
              '&:hover': {
                bgcolor: !loading && !importResults ? 'action.hover' : undefined
              }
            }}
            onClick={() => {
              if (!loading && !importResults) {
                document.getElementById('upload-file-input')?.click();
              }
            }}
          >
            <input
              id="upload-file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={loading || !!importResults}
            />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              {file ? file.name : 'Click to upload Excel or CSV file'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: .xlsx, .xls, .csv
            </Typography>
            {file && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                File size: {(file.size / 1024).toFixed(2)} KB
              </Typography>
            )}
          </Paper>

          <FormControlLabel
            control={
              <Checkbox
                checked={sendPasswordResetEmails}
                onChange={(e) => setSendPasswordResetEmails(e.target.checked)}
                disabled={loading || !!importResults}
              />
            }
            label="Send password reset emails to students with email addresses"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {importResults && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Import Results
              </Typography>
              <Typography paragraph>
                Successfully imported {importResults.totalImported} students to {
                  BATCHES.find(b => b.id === batch)?.name || batch
                }:
              </Typography>
              <Typography>• {importResults.created} new students created</Typography>
              <Typography>• {importResults.updated} existing students updated</Typography>
              
              {importResults.emails.length > 0 ? (
                <Typography sx={{ mt: 1 }}>
                  • {importResults.emails.length} students with email addresses
                </Typography>
              ) : (
                <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                  • No email addresses found in the imported data
                </Typography>
              )}
              
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
          variant="contained"
          disabled={loading || processingEmails || !file || !!importResults}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Importing...' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentExcelImport; 