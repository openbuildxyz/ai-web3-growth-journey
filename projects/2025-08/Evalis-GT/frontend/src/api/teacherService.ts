import axios from 'axios';
import { Teacher } from '../types/university';
import config from '../config/environment';

// Get the appropriate API base URL based on user role
const getApiBaseUrl = () => {
  try {
    const currentUser = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      // Admin now uses same base URL; previously separate admin port removed.
      if (userData.role === 'admin') {
        return config.API_BASE_URL;
      }
    }
  } catch (e) {
    // Fallback to regular API
  }
  return config.API_BASE_URL;
};

const getApiUrl = () => `${getApiBaseUrl()}/teachers`;

// Get token from storage with better debugging
const getToken = () => {
  // First try the main token storage
  let token = localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
  
  console.log('Token lookup:');
  console.log('- Main token storage (' + config.AUTH.TOKEN_STORAGE_KEY + '):', !!token);
  
  // If not found, check if we have a currentUser with token
  if (!token) {
    const userData = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
    console.log('- Current user data exists:', !!userData);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.token) {
          token = user.token;
          console.log('- Found token in currentUser object, updating main storage');
          
          // Update the main token storage for future requests
          localStorage.setItem(config.AUTH.TOKEN_STORAGE_KEY, user.token);
        } else {
          console.log('- Current user object exists but has no token property');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }
  
  // Log final result without exposing actual token
  console.log('- Final token found:', !!token);
  
  return token;
};

// Check if session is valid and try to recover if possible
export const checkSessionValidity = async (): Promise<boolean> => {
  const token = getToken();
  if (!token) {
    console.warn('No token found, session is invalid');
    return false;
  }
  
  try {
    // Make a lightweight API call to check if the token is still valid
    const response = await axios.get(
      `${config.API_BASE_URL}/auth/profile`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.status === 200) {
      console.log('Session is valid');
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('Session validation failed:', error);
    return false;
  }
};

// Create a silent session recovery function
export const attemptSessionRecovery = async (): Promise<boolean> => {
  console.log('Attempting silent session recovery...');
  
  const userData = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
  if (!userData) {
    console.warn('No user data found for recovery');
    return false;
  }
  
  try {
    const user = JSON.parse(userData);
    
    // If we have a stored refresh token, try to use it
    if (user.refreshToken) {
      console.log('Found refresh token, attempting refresh');
      try {
        const response = await axios.post(
          `${config.API_ENDPOINTS.AUTH}/refresh`,
          { refreshToken: user.refreshToken }
        );
        
        if (response.status === 200 && response.data.token) {
          // Update tokens
          localStorage.setItem(config.AUTH.TOKEN_STORAGE_KEY, response.data.token);
          
          // Update user object
          user.token = response.data.token;
          if (response.data.refreshToken) {
            user.refreshToken = response.data.refreshToken;
          }
          
          localStorage.setItem(config.AUTH.CURRENT_USER_KEY, JSON.stringify(user));
          console.log('Session refreshed successfully');
          return true;
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error during session recovery:', error);
    return false;
  }
};

// Set auth header with improved error handling
const authConfig = () => {
  const token = getToken();
  if (!token) {
    console.warn('No authentication token found');
    
    // Try to get the token from other storage locations
    const userToken = localStorage.getItem('userToken');
    const currentUser = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
    
    console.log('Alternative token sources checked:');
    console.log('- userToken:', !!userToken);
    console.log('- currentUser:', !!currentUser);
    
    // If we found a user but no token, that's a sign of potential auth issues
    if (currentUser && !token) {
      console.warn('User data found but no token, might need to re-authenticate');
      
      // Instead of immediately triggering a logout, set a flag so the UI can handle it gracefully
      sessionStorage.setItem('auth:tokenMissing', 'true');
      
      // Only dispatch an auth error event if we're not already in recovery mode
      if (!sessionStorage.getItem('auth:recovering')) {
        window.dispatchEvent(new CustomEvent('auth:warning', {
          detail: { message: 'Your session may have expired. Please log in again.' }
        }));
      }
    }
    
    // Throw an error to prevent API calls without authentication
    throw new Error('Authentication required - no token available');
  }
  
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

// Set multipart form config
const multipartConfig = () => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required for file uploads');
  }
  
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all teachers
export const getTeachers = async () => {
  try {
    const API_URL = getApiUrl();
    console.log('Fetching teachers from:', API_URL);
    const response = await axios.get(API_URL, authConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get teacher by ID
export const getTeacherById = async (id: string) => {
  try {
    const API_URL = getApiUrl();
    const response = await axios.get(`${API_URL}/${id}`, authConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create teacher
export const createTeacher = async (teacher: Teacher) => {
  try {
    const API_URL = getApiUrl();
    const response = await axios.post(API_URL, teacher, authConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update teacher
export const updateTeacher = async (id: string, teacher: Partial<Teacher>) => {
  try {
    const API_URL = getApiUrl();
    const response = await axios.put(`${API_URL}/${id}`, teacher, authConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete teacher
export const deleteTeacher = async (id: string) => {
  try {
    const API_URL = getApiUrl();
    const response = await axios.delete(`${API_URL}/${id}`, authConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Assign subject to teacher
export const assignSubject = async (teacherId: string, subjectId: string) => {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const response = await axios.post(
      `${API_BASE_URL}/admin/assign/subject`,
      { teacherId, subjectId },
      authConfig()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove subject from teacher
export const removeSubject = async (teacherId: string, subjectId: string) => {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const response = await axios.delete(
      `${API_BASE_URL}/teachers/${teacherId}/subjects/${subjectId}`,
      authConfig()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Import teachers from Excel
export const importTeachersFromExcel = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const API_URL = getApiUrl();
    const response = await axios.post(
      `${API_URL}/import-excel`,
      formData,
      multipartConfig()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get students by teacher ID
export const getStudentsByTeacher = async (teacherId?: string) => {
  try {
    // If teacherId not provided, derive from current user
    if (!teacherId) {
      const userData = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.id) {
            teacherId = user.id;
          }
        } catch (e) {
          console.error('Failed parsing user data for teacherId:', e);
        }
      }
    }

    if (!teacherId) {
      throw new Error('Teacher ID is missing. Please re-login.');
    }

    console.log(`Fetching students for teacher ID: ${teacherId}`);
    
    // Check if we have a token
    const token = getToken();
    console.log('Auth token available:', !!token);
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication token missing. Please log in again.');
    }
    
    const authHeaders = authConfig();
    console.log('Request headers:', authHeaders.headers);
    
  const API_URL = getApiUrl();
  const response = await axios.get(`${API_URL}/${teacherId}/students`, authHeaders);
    
    console.log(`API returned ${response.data ? response.data.length : 0} students`);
    return response.data || [];
  } catch (error: any) {
    console.error('Error fetching students by teacher:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      
      // If unauthorized, redirect to login
      if (error.response.status === 401 || error.response.status === 403) {
        console.error('Authentication error, should redirect to login');
        // Dispatch a login error event
        window.dispatchEvent(new CustomEvent('auth:error', {
          detail: { message: 'Your session has expired. Please log in again.' }
        }));
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    throw error;
  }
};

// Get submissions by teacher ID
export const getSubmissionsByTeacher = async (teacherId: string) => {
  try {
    const response = await axios.get(
      `${config.API_ENDPOINTS.SUBMISSIONS}/teacher/${teacherId}`,
      authConfig()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get subjects assigned to the current teacher
export const getTeacherSubjects = async () => {
  try {
    console.log('Fetching teacher subjects...');
    
    // Get current user info
    const userData = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
    const teacherInfo = userData ? JSON.parse(userData) : null;
    
    if (!teacherInfo || !teacherInfo.id) {
      console.error('No teacher info found in localStorage');
      throw new Error('Authentication information missing. Please log in again.');
    }
    
    const teacherId = teacherInfo.id;
    console.log('Teacher ID from localStorage:', teacherId);
  const API_URL = getApiUrl();
  console.log('API URL:', `${API_URL}/subjects`);
    
    // Check if we have a token
    const token = getToken();
    console.log('Auth token available:', !!token);
    
    if (!token) {
      throw new Error('Authentication token missing. Please log in again.');
    }
    
    const authHeaders = authConfig();
    console.log('Request headers:', authHeaders.headers);
    
    const response = await axios.get(
  `${API_URL}/subjects`,
      authHeaders
    );
    
    console.log(`API returned ${response.data ? response.data.length : 0} subjects`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching teacher subjects:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      
      // If unauthorized, dispatch an auth error event
      if (error.response.status === 401 || error.response.status === 403) {
        window.dispatchEvent(new CustomEvent('auth:error', {
          detail: { message: 'Your session has expired. Please log in again.' }
        }));
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    throw error;
  }
};

// Get batches accessible to current teacher (based on their assigned subjects)
export const getAccessibleBatches = async () => {
  try {
    const token = getToken();
    if (!token) throw new Error('Authentication token missing. Please log in again.');
    const authHeaders = authConfig();
  const API_URL = getApiUrl();
  const response = await axios.get(`${API_URL}/batches`, authHeaders);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Error fetching accessible batches:', error);
    throw error;
  }
};

// Create assignment
export const createAssignment = async (assignmentData: {
  title: string;
  description: string;
  subjectId: string;
  dueDate: string;
  maxMarks?: number;
}) => {
  try {
    const API_URL = `${getApiBaseUrl()}/assignments`;
    console.log('Creating assignment at:', API_URL);
    const response = await axios.post(API_URL, assignmentData, authConfig());
    return response.data;
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

// Get assignments for the current teacher
export const getTeacherAssignments = async () => {
  try {
    console.log('Fetching teacher assignments...');
    
    const response = await axios.get(
      `${config.API_ENDPOINTS.ASSIGNMENTS}/teacher`,
      authConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    throw error;
  }
};

// Get submissions for the current teacher
export const getTeacherSubmissions = async () => {
  try {
    console.log('Fetching teacher submissions...');
    
    // Get current user info
    const userData = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
    const teacherInfo = userData ? JSON.parse(userData) : null;
    
    if (!teacherInfo || !teacherInfo.id) {
      console.error('No teacher info found in localStorage');
      throw new Error('Teacher information not available');
    }
    
    console.log('Using teacher ID:', teacherInfo.id);
    
    const response = await axios.get(
      `${config.API_ENDPOINTS.SUBMISSIONS}/teacher/${teacherInfo.id}`,
      authConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher submissions:', error);
    throw error;
  }
};

// Grade a submission with optional EVT token awarding
export const gradeSubmission = async (submissionId: number, score: number, feedback: string, tokenAward?: {
  awardTokens: boolean;
  tokenAmount: number;
  tokenReason?: string;
}) => {
  try {
    console.log('Grading submission:', submissionId, score, feedback, tokenAward);
    const requestBody: any = {
      score,
      feedback,
      plagiarismScore: 0 // Default for now
    };

    // Add token awarding parameters if provided
    if (tokenAward?.awardTokens && tokenAward.tokenAmount > 0) {
      requestBody.awardTokens = true;
      requestBody.tokenAmount = tokenAward.tokenAmount;
      requestBody.tokenReason = tokenAward.tokenReason;
    }

    const response = await axios.put(
      `${config.API_ENDPOINTS.SUBMISSIONS}/${submissionId}`,
      requestBody,
      authConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error grading submission:', error);
    throw error;
  }
};

// Delete assignment
export const deleteAssignment = async (assignmentId: string) => {
  try {
    console.log('Deleting assignment:', assignmentId);
    const response = await axios.delete(
      `${config.API_ENDPOINTS.ASSIGNMENTS}/${assignmentId}`,
      authConfig()
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    
    // Handle authentication errors specifically
    if (error.message === 'Authentication required - no token available') {
      throw new Error('Please log in again to delete assignments');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw error;
  }
};

// Save annotated PDF for a submission
export const saveAnnotatedPDF = async (submissionId: number, annotations: any[], gradedPdfUrl: string) => {
  try {
    console.log('Saving annotated PDF for submission:', submissionId);
    const response = await axios.post(
      `${config.API_ENDPOINTS.SUBMISSIONS}/${submissionId}/annotated-pdf`,
      {
        annotations,
        gradedPdfUrl
      },
      authConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error saving annotated PDF:', error);
    throw error;
  }
};

// Web3 Rewards Functions

// Award EVT tokens to a student
export const awardEvtTokens = async (studentId: string, amount: number, reason?: string) => {
  try {
    console.log('Awarding EVT tokens:', studentId, amount, reason);
    const response = await axios.post(
      `${config.API_BASE_URL}/web3/award/tokens`,
      {
        studentId,
        amount,
        reason
      },
      authConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error awarding EVT tokens:', error);
    throw error;
  }
};

// Award NFT certificate to a student
export const awardNftCertificate = async (submissionId: number, metadataUri: string) => {
  try {
    console.log('Awarding NFT certificate:', submissionId, metadataUri);
    const response = await axios.post(
      `${config.API_BASE_URL}/web3/award/certificate`,
      {
        submissionId,
        metadataUri
      },
      authConfig()
    );
    return response.data;
  } catch (error: any) {
    console.error('Error awarding NFT certificate:', error);
    
    // Handle authentication errors specifically
    if (error.message === 'Authentication required - no token available') {
      throw new Error('Please log in again to award NFT certificates');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw error;
  }
};

// Award badge-based EVT tokens and optional NFT certificate based on grade
export const awardBadgeBasedRewards = async (submissionId: number, awardCertificate: boolean = false) => {
  try {
    console.log('Awarding badge-based rewards:', submissionId, awardCertificate);
    const response = await axios.post(
      `${config.API_BASE_URL}/web3/award/badge-rewards`,
      {
        submissionId,
        awardCertificate
      },
      authConfig()
    );
    return response.data;
  } catch (error: any) {
    console.error('Error awarding badge-based rewards:', error);
    
    // Handle authentication errors specifically
    if (error.message === 'Authentication required - no token available') {
      throw new Error('Please log in again to award badge rewards');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw error;
  }
};

// Award manual NFT certificate (can be used regardless of grade)
export const awardManualCertificate = async (submissionId: number, reason?: string) => {
  try {
    console.log('Awarding manual NFT certificate:', submissionId, reason);
    const response = await axios.post(
      `${config.API_BASE_URL}/web3/award/certificate/manual`,
      {
        submissionId,
        reason
      },
      authConfig()
    );
    return response.data;
  } catch (error: any) {
    console.error('Error awarding manual NFT certificate:', error);
    
    // Handle authentication errors specifically
    if (error.message === 'Authentication required - no token available') {
      throw new Error('Please log in again to award certificates');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw error;
  }
};

// Get available badge tiers
export const getBadgeTiers = async () => {
  try {
    const response = await axios.get(`${config.API_BASE_URL}/web3/badges`);
    return response.data;
  } catch (error) {
    console.error('Error fetching badge tiers:', error);
    throw error;
  }
};

// Get badge for specific grade
export const getBadgeForGrade = async (grade: number) => {
  try {
    const response = await axios.get(`${config.API_BASE_URL}/web3/badge/grade/${grade}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching badge for grade:', error);
    throw error;
  }
};

// Get student's token balance
export const getStudentTokenBalance = async (studentId: string) => {
  try {
    const response = await axios.get(
      `${config.API_BASE_URL}/web3/student/${studentId}/balance`,
      authConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching student token balance:', error);
    throw error;
  }
};

// Get student's certificates
export const getStudentCertificates = async (studentId: string) => {
  try {
    const response = await axios.get(
      `${config.API_BASE_URL}/web3/student/${studentId}/certificates`,
      authConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching student certificates:', error);
    throw error;
  }
};

// Batch award tokens to multiple students
export const batchAwardTokens = async (awards: Array<{
  studentId: string;
  amount: number;
  reason?: string;
}>) => {
  try {
    console.log('Batch awarding EVT tokens:', awards);
    const response = await axios.post(
      `${config.API_BASE_URL}/web3/award/tokens/batch`,
      { awards },
      authConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error batch awarding tokens:', error);
    throw error;
  }
};

export default {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignSubject,
  removeSubject,
  importTeachersFromExcel,
  getStudentsByTeacher,
  getSubmissionsByTeacher,
  getTeacherSubjects,
  getAccessibleBatches,
  createAssignment,
  getTeacherAssignments,
  getTeacherSubmissions,
  gradeSubmission,
  deleteAssignment,
  saveAnnotatedPDF,
  awardBadgeBasedRewards,
  getBadgeTiers,
  getBadgeForGrade
};

// Debug function to check authentication state
export const checkAuthState = () => {
  const token = localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
  const currentUser = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
  
  console.log('=== Authentication State Debug ===');
  console.log('Token in storage:', !!token);
  console.log('Current user in storage:', !!currentUser);
  
  if (currentUser) {
    try {
      const userData = JSON.parse(currentUser);
      console.log('User role:', userData.role);
      console.log('User has token property:', !!userData.token);
      console.log('Token matches storage:', userData.token === token);
    } catch (e) {
      console.log('Error parsing user data:', e);
    }
  }
  
  return {
    hasToken: !!token,
    hasUser: !!currentUser,
    isValid: !!(token && currentUser)
  };
};

// Function to restore authentication from user data
export const restoreAuthFromUser = () => {
  const currentUser = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
  if (currentUser) {
    try {
      const userData = JSON.parse(currentUser);
      if (userData.token) {
        localStorage.setItem(config.AUTH.TOKEN_STORAGE_KEY, userData.token);
        console.log('Auth restored from user data');
        return true;
      }
    } catch (e) {
      console.error('Error restoring auth:', e);
    }
  }
  return false;
}; 