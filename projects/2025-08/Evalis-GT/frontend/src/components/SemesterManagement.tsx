import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { green, grey } from '@mui/material/colors';

import { 
  getAllSemesters, 
  getBatchSemesters, 
  Semester 
} from '../api/semesterService';
import { getAllBatches } from '../api/batchService';
import { generateSemestersForBatch, setActiveSemesterForBatch, activateSemester, deactivateSemester } from '../api/adminService';

// Define a Batch interface if not available from batchService
interface Batch {
  id: string;
  name: string;
  department: string;
  startYear: string;
  endYear: string;
}

interface SemesterManagementProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const SemesterManagement: React.FC<SemesterManagementProps> = ({ onSuccess, onError }) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [generatingSemesters, setGeneratingSemesters] = useState<boolean>(false);
  const [settingActive, setSettingActive] = useState<boolean>(false);
  const [activeSettingId, setActiveSettingId] = useState<string | null>(null);
  
  // State for the set active semester dialog
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  
  const loadBatches = async () => {
    try {
      const batchData = await getAllBatches();
      setBatches(batchData);
      
      if (batchData.length > 0 && !selectedBatch) {
        setSelectedBatch(batchData[0].id);
      }
    } catch (error) {
      console.error('Error loading batches', error);
      onError('Failed to load batches');
    }
  };
  
  const loadSemesters = async (batchId?: string) => {
    setLoading(true);
    try {
      let semesterData;
      
      if (batchId) {
        semesterData = await getBatchSemesters(batchId);
      } else {
        semesterData = await getAllSemesters();
      }
      
      setSemesters(semesterData);
    } catch (error) {
      console.error('Error loading semesters', error);
      onError('Failed to load semesters');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadBatches();
  }, []);
  
  useEffect(() => {
    if (selectedBatch) {
      loadSemesters(selectedBatch);
    }
  }, [selectedBatch]);
  
  const handleBatchChange = (event: SelectChangeEvent) => {
    setSelectedBatch(event.target.value);
  };
  
  const handleGenerateSemesters = async () => {
    if (!selectedBatch) {
      onError('Please select a batch first');
      return;
    }
    
    setGeneratingSemesters(true);
    try {
      const result = await generateSemestersForBatch(selectedBatch);
      
      if (result.success) {
        onSuccess(`Successfully created ${result.created} semesters for batch`);
        loadSemesters(selectedBatch);
      } else {
        onError(result.message || 'Failed to generate semesters');
      }
    } catch (error: any) {
      console.error('Error generating semesters', error);
      const status = error.status || error.response?.status;
      const backendMsg = error.message || error.response?.data?.message;
      if (status === 401) {
        onError('Not authenticated. Please log out and log back in as an admin.');
      } else if (status === 403) {
        onError('Permission denied. Your token is not an admin token.');
      } else {
        onError(backendMsg || 'Failed to generate semesters');
      }
    } finally {
      setGeneratingSemesters(false);
    }
  };
  
  const handleOpenSetActiveDialog = (semesterId: string) => {
    setSelectedSemester(semesterId);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSemester('');
  };
  
  const handleSetActiveSemester = async () => {
    if (!selectedBatch || !selectedSemester) return;
    
    setSettingActive(true);
    setActiveSettingId(selectedSemester);
    
    try {
      const result = await setActiveSemesterForBatch(selectedSemester, selectedBatch);
      
      if (result.success) {
        onSuccess(result.message || 'Successfully updated active semester');
        loadSemesters(selectedBatch);
        handleCloseDialog();
      } else {
        onError(result.message || 'Failed to set active semester');
      }
    } catch (error: any) {
      console.error('Error setting active semester', error);
      onError(error.response?.data?.message || 'Failed to set active semester');
    } finally {
      setSettingActive(false);
      setActiveSettingId(null);
    }
  };

  const handleToggleActive = async (semesterId: string, isActive: boolean) => {
    setSettingActive(true);
    setActiveSettingId(semesterId);
    try {
      if (isActive) {
        await deactivateSemester(semesterId);
        onSuccess('Semester deactivated');
      } else {
        await activateSemester(semesterId);
        onSuccess('Semester activated');
      }
      if (selectedBatch) {
        loadSemesters(selectedBatch);
      }
    } catch (e: any) {
      console.error('Toggle active error', e);
      const status = e.status || e.response?.status;
      if (status === 401) {
        onError('Not authenticated. Please re-login as admin.');
      } else if (status === 403) {
        onError('Access denied. Admin privileges required.');
      } else {
        onError(e.message || 'Failed to toggle semester');
      }
    } finally {
      setSettingActive(false);
      setActiveSettingId(null);
    }
  };
  
  const getActiveSemester = () => {
    return semesters.find(semester => semester.active);
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Semester Management</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="batch-select-label">Batch</InputLabel>
            <Select
              labelId="batch-select-label"
              id="batch-select"
              value={selectedBatch}
              onChange={handleBatchChange}
              label="Batch"
            >
              {batches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => loadSemesters(selectedBatch)}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleGenerateSemesters}
            disabled={generatingSemesters || !selectedBatch}
          >
            {generatingSemesters ? <CircularProgress size={24} color="inherit" /> : 'Generate Semesters'}
          </Button>
        </Box>
      </Box>
      
      {getActiveSemester() && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Current Active Semester for {batches.find(b => b.id === selectedBatch)?.name || 'this batch'}: 
          <strong> {getActiveSemester()?.name}</strong>
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Number</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : semesters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No semesters found. Generate semesters for this batch.
                </TableCell>
              </TableRow>
            ) : (
              semesters.map((semester) => (
                <TableRow key={semester.id}>
                  <TableCell>{semester.id}</TableCell>
                  <TableCell>{semester.name}</TableCell>
                  <TableCell>{semester.number}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={semester.active ? 'Active' : 'Inactive'} 
                      color={semester.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(semester.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(semester.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center" sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Set Active (updates students)">
                      <span>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenSetActiveDialog(semester.id)}
                          disabled={settingActive && activeSettingId === semester.id}
                        >
                          {activeSettingId === semester.id && settingActive ? (
                            <CircularProgress size={24} />
                          ) : (
                            <CheckCircleIcon sx={{ color: semester.active ? green[500] : grey[400] }} />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={semester.active ? 'Deactivate Semester' : 'Activate Semester (exclusive)'}>
                      <span>
                        <Button
                          variant="outlined"
                          size="small"
                          color={semester.active ? 'warning' : 'success'}
                          disabled={settingActive && activeSettingId === semester.id}
                          onClick={() => handleToggleActive(semester.id, semester.active)}
                        >
                          {settingActive && activeSettingId === semester.id ? 'Working...' : semester.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Dialog for setting active semester */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Set Active Semester</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to set {semesters.find(s => s.id === selectedSemester)?.name} as the active semester 
            for all students in batch {batches.find(b => b.id === selectedBatch)?.name}?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will update the active semester for all students in this batch and 
            change which subjects they can access.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSetActiveSemester} 
            color="primary" 
            variant="contained"
            disabled={settingActive}
          >
            {settingActive ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SemesterManagement; 