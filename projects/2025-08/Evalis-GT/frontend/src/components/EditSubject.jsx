import { useState, useEffect } from 'react';
import { getSubjectById, updateSubject, createSubject } from '../api';
import { getAllBatches } from '../api/batchService';
import { getAllSemesters } from '../api/semesterService';

export default function EditSubject({ subjectId, onClose, onSuccess }) {
  const [subject, setSubject] = useState({
    id: '',
    name: '',
    section: '',
    description: '',
    credits: 3,
    batchId: '',
    semesterId: ''
  });
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch batches and semesters for dropdowns
        const [batchRes, semesterRes] = await Promise.all([
          getAllBatches(),
          getAllSemesters()
        ]);
        setBatches(batchRes);
        setSemesters(semesterRes);

        if (subjectId) {
          // Fetch subject data if editing existing subject
          const subjectResponse = await getSubjectById(subjectId);
          setSubject(subjectResponse.data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load subject data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSubject(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Log the subject payload for debugging
    console.log('Submitting subject:', subject);
    // Basic validation for required fields
    if (!subject.name || !subject.section || !subject.batchId) {
      setError('Name, Section, and Batch are required.');
      return;
    }
    try {
      setSaving(true);
      let response;
      if (subjectId) {
        // Update existing subject
        response = await updateSubject(subjectId, subject);
      } else {
        // Create new subject
        response = await createSubject(subject);
      }
      // Log response for debugging
      console.log('Subject API response:', response);
      if (onSuccess) {
        onSuccess();
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving subject:', err);
      // Show detailed error if available
      setError(err.response?.data?.message || err.message || 'Failed to save subject. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div className="text-lg font-medium text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {subjectId ? 'Edit Subject' : 'Add New Subject'}
        </h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">Subject ID</label>
            <input
              type="text"
              id="id"
              name="id"
              value={subject.id}
              onChange={handleChange}
              required
              disabled={!!subjectId}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={subject.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section</label>
            <input
              type="text"
              id="section"
              name="section"
              value={subject.section}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="batchId" className="block text-sm font-medium text-gray-700">Batch</label>
            <select
              id="batchId"
              name="batchId"
              value={subject.batchId}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Batch</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name || batch.id}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="semesterId" className="block text-sm font-medium text-gray-700">Semester</label>
            <select
              id="semesterId"
              name="semesterId"
              value={subject.semesterId}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Semester (optional)</option>
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>{sem.name || sem.id}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={subject.description || ''}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>

          <div>
            <label htmlFor="credits" className="block text-sm font-medium text-gray-700">Credits</label>
            <input
              type="number"
              id="credits"
              name="credits"
              value={subject.credits}
              onChange={handleChange}
              required
              min="1"
              max="6"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
} 