import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { CloudUpload, Save, Cancel, Download } from '@mui/icons-material';
import { read, utils, write } from 'xlsx';
import { Student } from '../types/university';
// @ts-ignore
import { importStudentsFromExcel } from '../api';

interface StudentImporterProps {
  batches: { id: string; name: string }[];
  onImportStudents: (batchId: string, students: Student[]) => void;
}

const StudentImporter: React.FC<StudentImporterProps> = ({ batches, onImportStudents }) => {
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [importedStudents, setImportedStudents] = useState<Student[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBatch) {
      setNotification({
        open: true,
        message: !file ? "Please select a file" : "Please select a batch",
        severity: "error"
      });
      return;
    }

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileType || '')) {
      setNotification({
        open: true,
        message: "Please upload a valid Excel file (.xlsx, .xls) or CSV file (.csv)",
        severity: "error"
      });
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setNotification({
        open: true,
        message: "File size exceeds the limit of 10MB",
        severity: "error"
      });
      return;
    }

    setIsUploading(true);
    setSelectedFile(file);

    try {
      const data = await file.arrayBuffer();
      let workbook;
      
      try {
        workbook = read(data, { type: 'array' });
      } catch (parseError) {
        console.error("Excel parsing error:", parseError);
        throw new Error("Failed to parse Excel file. The file might be corrupted or in an unsupported format.");
      }
      
      // Verify we have at least one sheet
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("The Excel file does not contain any sheets");
      }
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      if (!worksheet) {
        throw new Error("Could not read worksheet from the Excel file");
      }
      
      const jsonData = utils.sheet_to_json<any>(worksheet);

      // Basic validation to ensure we have data and required columns
      if (jsonData.length === 0) {
        throw new Error("The Excel file contains no data");
      }

      // Log first row to debug column issues
      console.log("First row data:", jsonData[0]);

      // Validate required columns are present in at least one format
      const firstRow = jsonData[0];
      const hasId = firstRow.StudentID !== undefined || firstRow.ID !== undefined || 
                    firstRow.Id !== undefined || firstRow.StudentId !== undefined;
      const hasName = firstRow.Name !== undefined || firstRow.StudentName !== undefined || 
                    (firstRow.FirstName !== undefined && firstRow.LastName !== undefined);
      
      if (!hasId) {
        throw new Error("Excel file is missing ID column. Please ensure it has StudentID, ID, Id, or StudentId column.");
      }
      
      if (!hasName) {
        throw new Error("Excel file is missing Name column. Please ensure it has Name, StudentName, or FirstName & LastName columns.");
      }

      // Map Excel data to student format
      const students: Student[] = jsonData.map((row: any, index: number) => ({
        id: row.StudentID || row.ID || row.Id || row.StudentId || `S${String(index).padStart(3, '0')}`,
        name: row.Name || row.StudentName || `${row.FirstName || ''} ${row.LastName || ''}`.trim(),
        section: row.Section || selectedBatch.split('-')[0] || 'CSE-1',
        email: row.Email || row.StudentEmail || '',
        batch: selectedBatch
      }));

      setImportedStudents(students);
      setShowPreview(true);
    } catch (error: any) {
      console.error("Error processing Excel file:", error);
      setNotification({
        open: true,
        message: error.message || "Failed to process Excel file. Check format and try again.",
        severity: "error"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const confirmImport = async () => {
    if (importedStudents.length === 0 || !selectedFile) {
      setNotification({
        open: true,
        message: "No students to import or file missing",
        severity: "error"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Use the API to upload the Excel file
      console.log('Starting file upload...');
      const result = await importStudentsFromExcel(selectedFile, selectedBatch);
      console.log('Import result:', result.data);
      
      // Call the parent component's callback
      onImportStudents(selectedBatch, importedStudents);
      
      setNotification({
        open: true,
        message: `Successfully imported ${result.data.totalImported} students (${result.data.created} new, ${result.data.updated} updated)`,
        severity: "success"
      });
      
      // Reset state
      setShowPreview(false);
      setImportedStudents([]);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error importing students:", error);
      
      // Enhanced error handling
      let errorMessage = "Failed to import students. Please try again.";
      
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx range
        console.error('Server response error:', error.response);
        errorMessage = error.response.data?.message || 
                      `Server error (${error.response.status}): ${error.response.statusText}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = "No response from server. Check your connection and try again.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        errorMessage = `Error: ${error.message}`;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Generate a sample Excel template for users
  const generateSampleTemplate = () => {
    // Create sample data
    const sampleData = [
      {
        StudentID: '2023CSE001',
        Name: 'John Doe',
        Section: 'CSE-1',
        Email: 'john.doe@example.com'
      },
      {
        StudentID: '2023CSE002',
        Name: 'Jane Smith',
        Section: 'CSE-1',
        Email: 'jane.smith@example.com'
      }
    ];

    // Create a new workbook and add the sample data
    const ws = utils.json_to_sheet(sampleData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Students');

    // Generate the file and trigger download
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setNotification({
      open: true,
      message: "Sample template downloaded. Fill it with your student data.",
      severity: "success"
    });
  };

  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Import Students from Excel
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload an Excel file containing student data. The file should have columns for student ID, name, and section.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Batch</InputLabel>
                <Select
                  value={selectedBatch}
                  label="Select Batch"
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  {batches.map((batch) => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUpload />}
                disabled={!selectedBatch || isUploading}
                sx={{ mb: 2 }}
                fullWidth
              >
                {isUploading ? "Processing..." : "Upload Excel File"}
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={!selectedBatch || isUploading}
                />
              </Button>

              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={generateSampleTemplate}
                sx={{ mb: 2 }}
                fullWidth
              >
                Download Sample Template
              </Button>

              {isUploading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress />
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Excel Format Instructions:
                </Typography>
                <Typography variant="body2" component="div">
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      First row should contain column headers
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      Required columns: StudentID (or Id), Name (or FirstName & LastName), Section
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      If Section is missing, the selected batch's default section will be used
                    </Box>
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Student Import Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Review Students to Import</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The following students will be imported to {batches.find(b => b.id === selectedBatch)?.name}. 
            Default password will be the last 4 digits of their ID.
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    <TableCell>{student.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowPreview(false)} 
            startIcon={<Cancel />} 
            color="error"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmImport} 
            startIcon={<Save />} 
            color="primary"
            variant="contained"
          >
            Import Students
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentImporter; 