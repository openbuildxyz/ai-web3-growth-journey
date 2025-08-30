import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, File, X, Eye } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  allowedTypes?: string[];
  maxSizeInMB?: number;
  currentFile?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  maxSizeInMB = 10,
  currentFile,
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `File size must be less than ${maxSizeInMB}MB`;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && !allowedTypes.includes(fileExtension)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError('');
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPDF = (filename: string): boolean => {
    return filename.toLowerCase().endsWith('.pdf');
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Upload Assignment File</Label>
      
      {/* Drag and Drop Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-gray-500">
          Supported formats: {allowedTypes.join(', ')} (Max {maxSizeInMB}MB)
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={allowedTypes.map(type => `.${type}`).join(',')}
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      {/* Selected File Display */}
      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isPDF(selectedFile.name) && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Preview functionality for PDF files
                  const url = URL.createObjectURL(selectedFile);
                  window.open(url, '_blank');
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Current File (if editing) */}
      {currentFile && !selectedFile && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Current file: {currentFile}</p>
              <p className="text-xs text-blue-600">Previously uploaded</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(currentFile, '_blank')}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;
