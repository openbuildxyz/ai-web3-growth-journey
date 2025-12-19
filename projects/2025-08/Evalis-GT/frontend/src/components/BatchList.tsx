import React, { useState, useEffect } from 'react';
import { 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Chip,
  IconButton,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  Sort as SortIcon, 
  KeyboardArrowUp as SortUpIcon, 
  KeyboardArrowDown as SortDownIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon
} from '@mui/icons-material';
import { getAllBatches, createBatch, updateBatch, deleteBatch } from '../api/batchService';

interface Batch {
  id: string;
  name: string;
  department: string;
  startYear: number;
  endYear: number;
  active: boolean;
}

interface BatchFormData {
  name: string;
  department: string;
  startYear: number;
  endYear: number;
  active: boolean;
}

interface BatchListProps {
  onBatchChange?: () => void;
}

const BatchList: React.FC<BatchListProps> = ({ onBatchChange }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [sortField, setSortField] = useState<keyof Batch>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState<BatchFormData>({
    name: '',
    department: 'BTech',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 4,
    active: true
  });

  // Fetch batches when component mounts
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBatches();
      setBatches(response);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Failed to load batches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (field: keyof Batch) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedBatches = [...batches].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Render sort icon
  const renderSortIcon = (field: keyof Batch) => {
    if (sortField !== field) return <SortIcon sx={{ fontSize: 16, ml: 0.5 }} />;
    return sortDirection === 'asc' ? 
      <SortUpIcon sx={{ fontSize: 16, ml: 0.5 }} /> : 
      <SortDownIcon sx={{ fontSize: 16, ml: 0.5 }} />;
  };

  // Form handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    });
  };

  // Add batch handlers
  const handleShowAddModal = () => {
    const currentYear = new Date().getFullYear();
    setFormData({
      name: '',
      department: 'BTech',
      startYear: currentYear,
      endYear: currentYear + 4,
      active: true
    });
    setShowAddModal(true);
  };

  const handleAddBatch = async () => {
    try {
      setLoading(true);
      // Auto-generate name if left blank
      const payload = { ...formData } as BatchFormData;
      if (!payload.name.trim()) {
        payload.name = `${payload.department} ${payload.startYear}-${payload.endYear}`;
      }
      if (payload.endYear <= payload.startYear) {
        throw new Error('End year must be greater than start year');
      }
      await createBatch(payload);
      await fetchBatches();
      setShowAddModal(false);
      setError(null);
      // Notify parent component about the change
      if (onBatchChange) {
        onBatchChange();
      }
    } catch (err) {
      console.error('Error adding batch:', err);
      const message = (err as any)?.response?.data?.message || (err as Error).message || 'Failed to add batch. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Edit batch handlers
  const handleShowEditModal = (batch: Batch) => {
    setCurrentBatch(batch);
    setFormData({
      name: batch.name,
      department: batch.department,
      startYear: batch.startYear,
      endYear: batch.endYear,
      active: batch.active
    });
    setShowEditModal(true);
  };

  const handleEditBatch = async () => {
    if (!currentBatch) return;
    
    try {
      setLoading(true);
      const payload = { ...formData } as BatchFormData;
      if (!payload.name.trim()) {
        payload.name = `${payload.department} ${payload.startYear}-${payload.endYear}`;
      }
      if (payload.endYear <= payload.startYear) {
        throw new Error('End year must be greater than start year');
      }
      await updateBatch(currentBatch.id, payload);
      await fetchBatches();
      setShowEditModal(false);
      setError(null);
      // Notify parent component about the change
      if (onBatchChange) {
        onBatchChange();
      }
    } catch (err) {
      console.error('Error updating batch:', err);
      const message = (err as any)?.response?.data?.message || (err as Error).message || 'Failed to update batch. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Delete batch handlers
  const handleShowDeleteModal = (batch: Batch) => {
    setCurrentBatch(batch);
    setShowDeleteModal(true);
  };

  const handleDeleteBatch = async () => {
    if (!currentBatch) return;
    
    try {
      setLoading(true);
      await deleteBatch(currentBatch.id);
      await fetchBatches();
      setShowDeleteModal(false);
      setError(null);
      // Notify parent component about the change
      if (onBatchChange) {
        onBatchChange();
      }
    } catch (err) {
      console.error('Error deleting batch:', err);
      setError('Failed to delete batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Batches</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleShowAddModal}
        >
          Add Batch
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !batches.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('id')} 
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    ID {renderSortIcon('id')}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('name')} 
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Name {renderSortIcon('name')}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('department')} 
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Department {renderSortIcon('department')}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('startYear')} 
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Start Year {renderSortIcon('startYear')}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('endYear')} 
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    End Year {renderSortIcon('endYear')}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('active')} 
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Status {renderSortIcon('active')}
                  </Box>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No batches found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>{batch.id}</TableCell>
                    <TableCell>{batch.name}</TableCell>
                    <TableCell>{batch.department}</TableCell>
                    <TableCell>{batch.startYear}</TableCell>
                    <TableCell>{batch.endYear}</TableCell>
                    <TableCell>
                      <Chip 
                        label={batch.active ? 'Active' : 'Inactive'}
                        color={batch.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small"
                        onClick={() => handleShowEditModal(batch)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleShowDeleteModal(batch)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Batch Dialog */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Batch</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Batch Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., BTech 2022-26"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Start Year"
              name="startYear"
              type="number"
              value={formData.startYear}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Year"
              name="endYear"
              type="number"
              value={formData.endYear}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={handleInputChange}
                  name="active"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button onClick={handleAddBatch} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add Batch'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Batch</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Batch Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Start Year"
              name="startYear"
              type="number"
              value={formData.startYear}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Year"
              name="endYear"
              type="number"
              value={formData.endYear}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={handleInputChange}
                  name="active"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleEditBatch} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the batch "{currentBatch?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button onClick={handleDeleteBatch} variant="contained" color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchList;
