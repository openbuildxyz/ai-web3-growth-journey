import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
import { CloudUpload, Save, Cancel } from '@mui/icons-material';
import { read, utils } from 'xlsx';
import { Teacher } from '../types/university';
import { importTeachersFromExcel } from '../api/teacherService';

interface TeacherImporterProps {
  onImportTeachers: (teachers: Teacher[]) => void;
}

const TeacherImporter: React.FC<TeacherImporterProps> = ({ onImportTeachers }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importedTeachers, setImportedTeachers] = useState<Teacher[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setSelectedFile(file);

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json<any>(worksheet);

      // Validate the Excel format has required columns
      const hasRequiredColumns = jsonData.length > 0 && (
        (jsonData[0].TeacherID !== undefined || jsonData[0].ID !== undefined) &&
        (jsonData[0].Name !== undefined || jsonData[0].TeacherName !== undefined) 
      );

      if (!hasRequiredColumns) {
        throw new Error("Excel file missing required columns. Please ensure it has TeacherID/ID and Name/TeacherName columns.");
      }

      // Map Excel data to teacher format
      const teachers: Teacher[] = jsonData.map((row: any, index: number) => ({
        id: row.TeacherID || row.ID || `T${String(index).padStart(3, '0')}`,
        name: row.Name || row.TeacherName || '',
        email: row.Email || row.TeacherEmail || '',
        subjects: []
      }));

      setImportedTeachers(teachers);
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
    if (importedTeachers.length === 0 || !selectedFile) {
      setNotification({
        open: true,
        message: "No teachers to import or file missing",
        severity: "error"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to import teachers
      const result = await importTeachersFromExcel(selectedFile);
      console.log("Import result:", result);
      
      // Update UI with imported teachers
      onImportTeachers(importedTeachers);
      
      // Show success notification
      setNotification({
        open: true,
        message: `Successfully imported ${result.totalImported} teachers (${result.created} created, ${result.updated} updated)`,
        severity: "success"
      });
      
      // Reset state
      setShowPreview(false);
      setImportedTeachers([]);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error importing teachers:", error);
      setNotification({
        open: true,
        message: error.response?.data?.message || "Failed to import teachers. Please try again.",
        severity: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Import Teachers from Excel
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload an Excel file containing teacher data. The file should have columns for Teacher ID, Name, and Email.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUpload />}
                disabled={isUploading}
                sx={{ mb: 2 }}
                fullWidth
              >
                {isUploading ? "Processing..." : "Upload Excel File"}
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
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
                      Required columns: TeacherID (or ID), Name (or TeacherName), Email (or TeacherEmail)
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      Teacher passwords will be set to the last 4 digits of their ID
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      Emails will be used to send login credentials to teachers automatically
                    </Box>
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Teacher Import Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => !isSubmitting && setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Review Teachers to Import</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Teacher ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importedTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.id}</TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmImport} 
            startIcon={<Save />} 
            color="primary"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Importing...
              </>
            ) : 'Import Teachers'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherImporter; 