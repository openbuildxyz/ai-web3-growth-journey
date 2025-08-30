import axios from 'axios';
import { Subject } from '../types/university';
import config from '../config/environment';

const API_URL = config.API_ENDPOINTS.SUBJECTS;

// Get token from storage
const getToken = () => {
  const token = localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
  return token;
};

// Set auth header
const authConfig = () => {
  const token = getToken();
  if (!token) {
    console.warn('No authentication token found');
  }
  
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// Get all subjects
export const getAllSubjects = async () => {
  if (!API_URL) {
    throw new Error('API URL not configured');
  }
  
  try {
    const response = await axios.get(API_URL, authConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

// Get subject by ID
export const getSubjectById = async (id: string) => {
  if (!API_URL) {
    throw new Error('API URL not configured');
  }
  
  try {
    const response = await axios.get(`${API_URL}/${id}`, authConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching subject:', error);
    throw error;
  }
};

// Create subject
export const createSubject = async (subject: Partial<Subject>) => {
  if (!API_URL) {
    throw new Error('API URL not configured');
  }
  
  try {
    const response = await axios.post(API_URL, subject, authConfig());
    return response.data;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

// Update subject
export const updateSubject = async (id: string, subject: Partial<Subject>) => {
  if (!API_URL) {
    throw new Error('API URL not configured');
  }
  
  try {
    const response = await axios.put(`${API_URL}/${id}`, subject, authConfig());
    return response.data;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

// Delete subject
export const deleteSubject = async (id: string) => {
  if (!API_URL) {
    throw new Error('API URL not configured');
  }
  
  try {
    const response = await axios.delete(`${API_URL}/${id}`, authConfig());
    return response.data;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

// Get subjects by section
export const getSubjectsBySection = async (section: string) => {
  if (!API_URL) {
    throw new Error('API URL not configured');
  }
  
  try {
    const response = await axios.get(`${API_URL}/section/${section}`, authConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching subjects by section:', error);
    throw error;
  }
};

export default {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsBySection
}; 