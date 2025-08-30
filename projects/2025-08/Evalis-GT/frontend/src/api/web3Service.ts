import axios from 'axios';
import config from '../config/environment';

function authHeaders() {
  const token = localStorage.getItem('authToken') || localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function linkWallet(address: string) {
  const res = await axios.post(`${config.API_BASE_URL}/web3/link-wallet`, { address }, { withCredentials: true, headers: authHeaders() });
  return res.data;
}

export async function myWeb3Profile() {
  const res = await axios.get(`${config.API_BASE_URL}/web3/me`, { withCredentials: true, headers: authHeaders() });
  return res.data as { walletAddress: string | null, onchain?: { balance?: string, decimals?: number } };
}

export async function adminMint(role: 'teacher'|'student', userId: string, amountWei: string) {
  const res = await axios.post(`${config.API_BASE_URL}/web3/admin/mint`, { role, userId, amount: amountWei }, { withCredentials: true, headers: authHeaders() });
  return res.data;
}
