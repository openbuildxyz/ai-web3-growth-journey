import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  FilePresent as FileIcon
} from '@mui/icons-material';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<any>;
  title?: string;
  accept?: string;
  maxSize?: number; // in MB
  description?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  title = 'Upload File',
  accept = '.pdf,.doc,.docx,.zip,.txt',
  maxSize = 10, // 10MB default
  description = 'Drag and drop a file here, or click to select file'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds the maximum limit of ${maxSize}MB`);
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setError(null);
    setSuccess(false);
    
    if (!event.dataTransfer.files || event.dataTransfer.files.length === 0) {
      return;
    }
    
    const file = event.dataTransfer.files[0];
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds the maximum limit of ${maxSize}MB`);
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      // Perform actual upload
      await onUpload(selectedFile);
      
      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);
      
      // Clear file after successful upload
      setTimeout(() => {
        setSelectedFile(null);
      }, 3000);
    } catch (err) {
      setError('An error occurred during upload. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Box
        sx={{
          border: '2px dashed',
          borderColor: error ? 'error.main' : 'primary.light',
          borderRadius: 2,
          p: 3,
          mb: 2,
          textAlign: 'center',
          bgcolor: 'background.paper',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !uploading && document.getElementById('file-input')?.click()}
      >
        {selectedFile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <FileIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              {selectedFile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </Typography>
            {!uploading && (
              <Tooltip title="Remove file">
                <IconButton 
                  color="error" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleRemoveFile(); 
                  }}
                  sx={{ mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ) : (
          <Box>
            <UploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body1">
              {description}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Supported file types: {accept.split(',').join(', ')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Maximum file size: {maxSize}MB
            </Typography>
          </Box>
        )}
        
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          File uploaded successfully!
        </Alert>
      )}
      
      {uploading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Uploading: {Math.round(progress)}%
          </Typography>
        </Box>
      )}
      
      <Button
        variant="contained"
        color="primary"
        startIcon={<UploadIcon />}
        disabled={!selectedFile || uploading}
        onClick={handleUpload}
        fullWidth
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </Button>
    </Paper>
  );
};

export default FileUploader; 