import axios from 'axios';
import config from '../config/environment.js';
import { getToken as getPreferredToken } from './authUtils.ts';

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Runtime safety: if we are on a deployed (non-localhost) origin but the baseURL still points to localhost, override to relative /api
if (typeof window !== 'undefined') {
  const hostIsLocal = /localhost|127\.0\.0\.1/.test(window.location.host);
  const baseIsLocal = /localhost|127\.0\.0\.1/.test(api.defaults.baseURL || '');
  if (!hostIsLocal && baseIsLocal) {
    // eslint-disable-next-line no-console
    console.warn('[api] Overriding localhost API base in deployed environment -> /api');
    api.defaults.baseURL = '/api';
  }
  // Log final base for debugging (only once)
  // eslint-disable-next-line no-console
  console.log('[api] Effective baseURL:', api.defaults.baseURL);
}

// Get the latest token from storage (Clerk JWT only)
const getAuthToken = () => getPreferredToken();

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle network errors separately - these usually indicate the server is down
    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      console.error('Network error detected. Server might be down or unreachable.');
      // You could dispatch an event or set a global state here to show a server status indicator
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to add auth token to headers
api.interceptors.request.use(
  async (reqConfig) => {
    // Get the latest token (Clerk only)
    const token = getAuthToken();
    
    if (token) {
      console.log('Adding token to request:', token.substring(0, 15) + '...');
      reqConfig.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token available for request');
    }
    
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple token refresh attempts at once
let isRefreshing = false;
// Queue of requests to retry after token refresh
let failedRequestsQueue = [];

// Function to process the queue of failed requests
const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedRequestsQueue = [];
};

// Add response interceptor to handle token expiration or authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (unauthorized) and we haven't tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add request to queue
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      // Try backend token refresh with stored refresh token
      try {
        // Try to get the user data with refresh token
        const userData = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
        if (userData) {
          try {
            const user = JSON.parse(userData);
            
            // If we have a stored refresh token, try to use it
            if (user.refreshToken) {
              try {
                console.log('Attempting token refresh through API');
                const response = await axios.post(
                  `${config.API_BASE_URL}/auth/refresh`,
                  { refreshToken: user.refreshToken }
                );
                
                if (response.status === 200 && response.data.token) {
                  console.log('Token refresh successful through API');
                  // Update tokens
                  const newToken = response.data.token;
                  localStorage.setItem(config.AUTH.TOKEN_STORAGE_KEY, newToken);
                  
                  // Update user object
                  user.token = newToken;
                  if (response.data.refreshToken) {
                    user.refreshToken = response.data.refreshToken;
                  }
                  
                  localStorage.setItem(config.AUTH.CURRENT_USER_KEY, JSON.stringify(user));
                  
                  // Update auth header and retry the original request
                  originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                  
                  // Process any requests that came in while refreshing
                  processQueue(null, newToken);
                  isRefreshing = false;
                  
                  return axios(originalRequest);
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                processQueue(refreshError, null);
              }
            }
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
          }
        }
      } catch (err) {
        processQueue(err, null);
      }
      
      isRefreshing = false;
      
      // If all refresh attempts failed, clear auth data and reject
      // This will force the user to login again
      console.warn('All token refresh attempts failed, clearing auth data');
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const loginStudent = (id, password) => api.post('/auth/student/login', { id, password });
export const loginTeacher = (identifier, password) => {
  // Check if identifier is an email or ID
  const isEmail = identifier.includes('@');
  if (isEmail) {
    return api.post('/auth/teacher/login', { email: identifier, password });
  } else {
    return api.post('/auth/teacher/login', { id: identifier, password });
  }
};
export const setupTeacherPassword = (email, currentPassword, newPassword) => 
  api.post('/auth/teacher/setup-password', { email, currentPassword, newPassword });
export const loginAdmin = (username, password) => api.post('/auth/admin/login', { username, password });
export const getUserProfile = () => api.get('/auth/profile');
export const resetStudentPassword = (studentId, newPassword) => 
  api.post('/auth/student/reset-password', { studentId, newPassword });

// Student API
export const getStudents = (batch = '', page = 1) => 
  api.get('/students', { params: { batch, page } });
export const getStudentById = (id) => api.get(`/students/${id}`);
export const getStudentSubmissions = (id) => {
  // If no ID is provided, get current student's submissions
  if (!id) {
    return api.get('/students/submissions');
  }
  // Otherwise get specific student's submissions (for admin/teacher use)
  return api.get(`/students/${id}/submissions`);
};
export const createStudent = (studentData) => api.post('/students', studentData);
export const updateStudent = (id, studentData) => api.put(`/students/${id}`, studentData);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const importStudents = (formData) => api.post('/students/import', formData);
export const importStudentsFromExcel = (file, batchId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('batchId', batchId);
  
  console.log(`Uploading file ${file.name} to batch ${batchId}`);
  
  return api.post('/students/import-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // Add timeout and additional error handling
    timeout: 60000, // Increase timeout to 60 seconds for large files
    validateStatus: (status) => {
      console.log(`Response status: ${status}`);
      return status >= 200 && status < 300; // Default validate function
    }
  }).catch(error => {
    console.error('Excel import error details:', error.response?.data || error.message);
    throw error; // Re-throw to let the component handle it
  });
};

// Teacher API
export const getTeachers = () => api.get('/teachers');
export const getTeacherById = (id) => api.get(`/teachers/${id}`);
export const createTeacher = (teacherData) => api.post('/teachers', teacherData);
export const updateTeacher = (id, teacherData) => api.put(`/teachers/${id}`, teacherData);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

// Subject API
export const getSubjects = () => api.get('/subjects');
export const getSubjectById = (id) => api.get(`/subjects/${id}`);
export const createSubject = (subjectData) => api.post('/subjects', subjectData);
export const updateSubject = (id, subjectData) => api.put(`/subjects/${id}`, subjectData);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// Batch API
export const getBatches = () => api.get('/batches');
export const getBatchById = (id) => api.get(`/batches/${id}`);
export const createBatch = (batchData) => api.post('/batches', batchData);
export const updateBatch = (id, batchData) => api.put(`/batches/${id}`, batchData);
export const deleteBatch = (id) => api.delete(`/batches/${id}`);
export const getBatchStudents = (id) => api.get(`/batches/${id}/students`);

// Submission API
export const createSubmission = (submissionData) => api.post('/submissions', submissionData);
export const getSubmissionById = (id) => api.get(`/submissions/${id}`);
export const gradeSubmission = (id, gradeData) => api.put(`/submissions/${id}`, gradeData);
export const getSubmissionsBySubject = (subjectId) => api.get(`/submissions/subject/${subjectId}`);
export const getSubmissionsByTeacher = (teacherId) => api.get(`/submissions/teacher/${teacherId}`);
export const submitAssignment = (assignmentId, submissionData) => api.post(`/submissions/assignment/${assignmentId}`, submissionData);

// Assignment API
export const getAssignments = () => api.get('/assignments');
export const getStudentAssignments = () => api.get('/assignments/student');
export const getTeacherAssignments = () => api.get('/assignments/teacher');
export const getAssignmentById = (id) => api.get(`/assignments/${id}`);
export const createAssignment = (assignmentData) => api.post('/assignments', assignmentData);
export const updateAssignment = (id, assignmentData) => api.put(`/assignments/${id}`, assignmentData);
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`);
export const getAssignmentSubmissions = (assignmentId) => api.get(`/assignments/${assignmentId}/submissions`);

// Teacher Submission Upload API
export const uploadTeacherSubmission = (formData) => {
  return api.post('/submissions/teacher-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60 seconds timeout for large files
  });
};

// Student Portal API
export const getStudentProfile = () => api.get('/students/profile');
export const getStudentGrades = (studentId) => api.get(`/students/${studentId}/grades`);
export const getStudentSubjects = (studentId) => api.get(`/students/${studentId}/subjects`);

export const sendBulkPasswordResetEmails = (studentEmails) => api.post('/auth/bulk-password-reset', { emails: studentEmails });

// Add new function for teachers to get students by batch
export const getStudentsByBatch = (batchId) => api.get(`/batches/${batchId}/students`);

// Allow teachers to get student submissions by subject
export const getStudentSubmissionsBySubject = (studentId, subjectId) => 
  api.get(`/students/${studentId}/submissions`, { params: { subject: subjectId } });

// Allow teachers to see their assigned subjects
export const getTeacherSubjects = () => api.get('/teachers/subjects');

export default api;