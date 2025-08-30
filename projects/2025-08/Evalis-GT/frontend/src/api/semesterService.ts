import axios from 'axios';
import config from '../config/environment';
import { getAuthConfig } from './authUtils';

const API_URL = config.API_ENDPOINTS.SEMESTERS || '/api/semesters';

// Types
export interface Semester {
  id: string;
  name: string;
  number: number;
  startDate: string | Date;
  endDate: string | Date;
  active: boolean;
  batchId: string;
  Batch?: {
    id: string;
    name: string;
    department: string;
  };
}

// Get all semesters
export const getAllSemesters = async (): Promise<Semester[]> => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get semester by ID
export const getSemesterById = async (id: string): Promise<Semester> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get semesters for a specific batch
export const getBatchSemesters = async (batchId: string): Promise<Semester[]> => {
  try {
    const response = await axios.get(`${API_URL}/batch/${batchId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create semester
export const createSemester = async (semesterData: any): Promise<any> => {
  try {
    const response = await axios.post(API_URL, semesterData, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update semester
export const updateSemester = async (id: string, semesterData: Partial<Semester>): Promise<Semester> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, semesterData, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Set active semester for students
export const setActiveSemesterForStudents = async (semesterId: string, studentIds: string[]): Promise<any> => {
  try {
    const response = await axios.put(
      `${API_URL}/${semesterId}/set-active`, 
      { studentIds }, 
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllSemesters,
  getSemesterById,
  createSemester,
  updateSemester,
  setActiveSemesterForStudents
}; 