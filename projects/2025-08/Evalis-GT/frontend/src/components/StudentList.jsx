import { useState, useEffect } from 'react';
import { getStudents, getBatches, deleteStudent } from '../api';
import EditStudent from './EditStudent';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch batches on component mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await getBatches();
        setBatches(response.data);
      } catch (err) {
        console.error('Error fetching batches:', err);
      }
    };

    fetchBatches();
  }, []);

  // Fetch students whenever batch or page changes
  useEffect(() => {
    fetchStudents();
  }, [selectedBatch, page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getStudents(selectedBatch, page);
      
      // Handle the data structure from the API
      if (response.data.students) {
        setStudents(response.data.students);
        setTotalPages(response.data.pages);
        setTotalStudents(response.data.total);
      } else {
        setStudents(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
    // Reset to page 1 when changing batch
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleDeleteConfirmation = (student) => {
    setDeleteConfirm(student);
  };

  const handleDelete = async () => {
    try {
      if (!deleteConfirm) return;
      
      await deleteStudent(deleteConfirm.id);
      setDeleteConfirm(null);
      // Refresh the student list
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const handleSuccess = () => {
    // Close modals
    setShowEditModal(false);
    setShowAddModal(false);
    setEditingStudent(null);
    
    // Refresh student list
    fetchStudents();
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Get batch name from batch ID
  const getBatchName = (batchId) => {
    if (!batchId || !batches.length) return 'Unknown';
    const batch = batches.find(b => b.id === batchId);
    return batch ? batch.name : batchId;
  };

  // Sort students based on current sort field and order
  const sortedStudents = [...students].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Special case for batch (show names instead of IDs)
    if (sortField === 'batch') {
      aValue = getBatchName(a.batch);
      bValue = getBatchName(b.batch);
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Column header with sort indicator
  const SortableHeader = ({ field, label }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {sortField === field && (
          <span className="ml-1">
            {sortOrder === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </th>
  );

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-medium text-gray-500">Loading students...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <label htmlFor="batch-filter" className="font-medium">Filter by Batch:</label>
          <select
            id="batch-filter"
            value={selectedBatch}
            onChange={handleBatchChange}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">All Batches</option>
            {batches.map(batch => (
              <option key={batch.id || batch._id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Add New Student
        </button>
      </div>

      {students.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">No students found for the selected criteria.</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader field="id" label="ID" />
                  <SortableHeader field="name" label="Name" />
                  <SortableHeader field="section" label="Section" />
                  <SortableHeader field="batch" label="Batch" />
                  <SortableHeader field="email" label="Email" />
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.map((student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getBatchName(student.batch)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteConfirmation(student)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1 || loading}
                  className="px-3 py-1 border border-gray-300 rounded bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages || loading}
                  className="px-3 py-1 border border-gray-300 rounded bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <EditStudent 
              studentId={editingStudent?.id} 
              onClose={() => setShowEditModal(false)} 
              onSuccess={handleSuccess} 
            />
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <EditStudent 
              onClose={() => setShowAddModal(false)} 
              onSuccess={handleSuccess} 
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete {deleteConfirm.name} ({deleteConfirm.id})? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 