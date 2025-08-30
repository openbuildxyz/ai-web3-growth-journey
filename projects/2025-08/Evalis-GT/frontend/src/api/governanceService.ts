import axios from 'axios';
import config from '../config/environment';
import { getAuthConfig } from './authUtils';

const API_URL = `${config.API_BASE_URL}/governance`;

export interface Proposal {
  id: string;
  title: string;
  description: string;
  type: string;
  options: string[];
  status: 'active' | 'closed' | 'scheduled';
  startAt?: string | null;
  endAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const createProposal = async (data: Partial<Proposal>) => {
  const authConfig = getAuthConfig();
  console.log('Creating governance proposal with auth config:', {
    hasToken: !!(authConfig.headers?.Authorization),
    tokenPreview: authConfig.headers?.Authorization ? 
      authConfig.headers.Authorization.substring(0, 20) + '...' : 'none',
    apiUrl: `${API_URL}/proposals`,
    proposalData: data
  });
  
  try {
    const res = await axios.post(`${API_URL}/proposals`, data, authConfig);
    return res.data;
  } catch (error: any) {
    console.error('Governance API error:', error?.response?.data || error?.message);
    throw error;
  }
};

export const listProposals = async (status?: string): Promise<Proposal[]> => {
  const url = status ? `${API_URL}/proposals?status=${encodeURIComponent(status)}` : `${API_URL}/proposals`;
  const res = await axios.get(url, getAuthConfig());
  return res.data;
};

export interface ProposalVoter {
  teacherId: string;
  teacherName: string;
  teacherEmail?: string | null;
  choiceIndex: number;
  choiceLabel?: string;
  votedAt: string;
}

export const getProposal = async (id: string) => {
  const res = await axios.get(`${API_URL}/proposals/${id}`, getAuthConfig());
  return res.data as { 
    proposal: Proposal; 
    totals: number[]; 
    totalVotes: number; 
    myVote: number | null; 
    voters?: ProposalVoter[];
  };
};

export const castVote = async (id: string, choiceIndex: number) => {
  const res = await axios.post(`${API_URL}/proposals/${id}/vote`, { choiceIndex }, getAuthConfig());
  return res.data;
};

export const closeProposal = async (id: string) => {
  const res = await axios.post(`${API_URL}/proposals/${id}/close`, {}, getAuthConfig());
  return res.data;
};

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export const listNotifications = async (): Promise<NotificationItem[]> => {
  const res = await axios.get(`${API_URL}/notifications`, getAuthConfig());
  return res.data;
};

export const markNotificationRead = async (id: string) => {
  const res = await axios.post(`${API_URL}/notifications/${id}/read`, {}, getAuthConfig());
  return res.data;
};
