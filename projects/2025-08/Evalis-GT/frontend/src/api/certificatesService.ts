import axios from 'axios';
import config from '../config/environment';

function authHeaders() {
  const token = localStorage.getItem('authToken') || localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listMyCertificates() {
  const res = await axios.get(`${config.API_BASE_URL}/certificates/student`, { withCredentials: true, headers: authHeaders() });
  return res.data as Array<{ id: string; tokenId: string; tokenUri: string; lastVerificationOk?: boolean | null }>;
}

export async function verifyCertificate(idOrTokenId: string) {
  const res = await axios.get(`${config.API_BASE_URL}/certificates/verify/${idOrTokenId}`);
  return res.data as { ok: boolean, details: any };
}
