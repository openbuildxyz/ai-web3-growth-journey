import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import { read, utils } from 'xlsx';

interface ExcelImporterProps {
  onDataImported: (data: any[]) => void;
  acceptedFormats?: string[];
  instructions?: React.ReactNode;
  maxFileSize?: number; // in MB
  buttonText?: string;
}

const ExcelImporter: React.FC<ExcelImporterProps> = ({
  onDataImported,
  acceptedFormats = ['.xlsx', '.xls', '.csv'],
  instructions,
  maxFileSize = 5, // 5MB default
  buttonText = 'Upload Excel File'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
    rows: number;
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File size exceeds the maximum limit of ${maxFileSize}MB`);
      return;
    }

    // Check file extension
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExt)) {
      setError(`Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json<any>(worksheet);

      // Set file info
      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        rows: jsonData.length
      });

      // Call the callback with the parsed data
      onDataImported(jsonData);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      setError("Failed to process the file. Make sure it's a valid Excel/CSV file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box>
      {instructions && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
          {instructions}
        </Paper>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button
          component="label"
          variant="contained"
          startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
          disabled={isUploading}
          sx={{ mb: 2 }}
        >
          {isUploading ? "Processing..." : buttonText}
          <input
            type="file"
            hidden
            accept={acceptedFormats.join(',')}
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </Button>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, width: '100%' }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {fileInfo && !error && (
          <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                File Uploaded Successfully
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <List dense>
              <ListItem>
                <ListItemText primary="File Name" secondary={fileInfo.name} />
              </ListItem>
              <ListItem>
                <ListItemText primary="File Size" secondary={fileInfo.size} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Records" secondary={`${fileInfo.rows} rows processed`} />
              </ListItem>
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ExcelImporter; 