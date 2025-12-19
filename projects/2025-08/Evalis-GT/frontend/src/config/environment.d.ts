// This file provides type definitions for the environment configuration

export interface Config {
  API_BASE_URL: string;
  FILE_BASE_URL: string;
  ADMIN_API_BASE_URL: string;
  API_ENDPOINTS: {
    AUTH: {
      STUDENT_LOGIN: string;
      TEACHER_LOGIN: string;
      TEACHER_SETUP_PASSWORD: string;
      ADMIN_LOGIN: string;
      PROFILE: string;
    };
    TEACHERS: {
      BASE: string;
      IMPORT: string;
    };
    STUDENTS: {
      BASE: string;
      IMPORT: string;
    };
    SUBJECTS: string;
    BATCHES: string;
    ASSIGNMENTS: string;
    SUBMISSIONS: string;
    SEMESTERS: string;
    AI_ANALYZER: {
      BASE: string;
      STUDENT_ANALYSIS: string;
      SUBJECT_ANALYSIS: string;
      RECOMMENDATIONS: string;
      COMPREHENSIVE_DATA: string;
      PREDICTIVE_ANALYSIS: string;
    };
  };
  AUTH: {
    TOKEN_STORAGE_KEY: string;
    USER_STORAGE_KEY: string;
    CURRENT_USER_KEY: string;
  };
  AI: {
    GOOGLE_API_KEY: string;
    GOOGLE_API_URL: string;
  };
  getFileUrl: (fileUrl: string) => string;
}

declare const config: Config;
export default config; 