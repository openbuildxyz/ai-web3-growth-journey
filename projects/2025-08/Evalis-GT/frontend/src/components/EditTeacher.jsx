import { useState, useEffect } from 'react';
import { getTeacherById, updateTeacher, createTeacher, getSubjects } from '../api';
import config from '../config/environment';

export default function EditTeacher({ teacherId, onClose, onSuccess }) {
  const [teacher, setTeacher] = useState({
    id: '',
    name: '',
    email: '',
    subjects: [],
    password: '',
    role: 'teacher'  // Explicitly set the role
  });
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subjects for assignment
        const subjectsResponse = await getSubjects();
        setAllSubjects(subjectsResponse.data);
        
        // Fetch teacher data if editing existing teacher
        if (teacherId) {
          const teacherResponse = await getTeacherById(teacherId);
          setTeacher({
            ...teacherResponse.data,
            role: teacherResponse.data.role || 'teacher' // Ensure role is set
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load teacher data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeacher(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubjectChange = (e) => {
    const options = e.target.options;
    const selectedSubjects = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedSubjects.push(options[i].value);
      }
    }
    
    setTeacher(prev => ({ ...prev, subjects: selectedSubjects }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Validate required fields
      if (!teacher.id || !teacher.name || !teacher.email) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }
      
      // Check token is present
      const token = localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        setSaving(false);
        return;
      }
      
      // Prepare teacher data with role always set
      const teacherData = { 
        ...teacher,
        role: 'teacher', // Always ensure role is set correctly
        subjects: teacher.subjects || []
      };
      
      // Remove password if it's empty (for updates)
      if (teacherId && !teacherData.password) {
        delete teacherData.password;
      }
      
      console.log('Submitting teacher data:', teacherData);
      
      let response;
      if (teacherId) {
        // Update existing teacher
        console.log('Updating teacher with ID:', teacherId);
        response = await updateTeacher(teacherId, teacherData);
      } else {
        // Create new teacher using API service
        console.log('Creating new teacher');
        response = await createTeacher(teacherData);
      }
      
      console.log('API response:', response);
      
      // Call success callback with a slight delay
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
      
      // Close modal
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving teacher:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
      setError(err.message || err.response?.data?.message || 'Failed to save teacher. Please try again.');
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
          {teacherId ? 'Edit Teacher' : 'Add New Teacher'}
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
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">Teacher ID</label>
            <input
              type="text"
              id="id"
              name="id"
              value={teacher.id}
              onChange={handleChange}
              required
              disabled={!!teacherId} // Disable ID field when editing
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={teacher.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={teacher.email || ''}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="subjects" className="block text-sm font-medium text-gray-700">Assigned Subjects</label>
            <select
              id="subjects"
              name="subjects"
              multiple
              value={teacher.subjects || []}
              onChange={handleSubjectChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              size="5"
            >
              {allSubjects.map(subject => (
                <option key={subject._id || subject.id} value={subject.id}>
                  {subject.name} ({subject.id})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple subjects</p>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {teacherId ? 'New Password (optional)' : 'Password'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={teacher.password || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={teacherId ? "Leave blank to keep current password" : "Enter password"}
              required={!teacherId}
            />
            {teacherId && (
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to keep the current password.
              </p>
            )}
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