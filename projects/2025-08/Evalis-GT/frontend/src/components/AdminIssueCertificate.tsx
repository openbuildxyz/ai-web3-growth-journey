import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import axios from 'axios';
import config from '../config/environment';

const AdminIssueCertificate: React.FC = () => {
  const [submissionId, setSubmissionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [tokenUri, setTokenUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const authHeaders = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const issue = async () => {
    setError(null); setSuccess(null);
    if (!submissionId || !tokenUri || !studentId) { setError('Provide submissionId, studentId, tokenUri (ipfs://...)'); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${config.API_BASE_URL}/certificates/issue`, { submissionId: Number(submissionId), studentId, tokenUri }, { withCredentials: true, headers: authHeaders() });
      setSuccess(`Issued. Tx: ${res.data.txHash}`);
    } catch (e: any) { setError(e?.response?.data?.message || e?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Issue Certificate NFT</CardTitle>
        <CardDescription>Mint ERC721 certificate to a student’s linked wallet</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (<Alert className="mb-4 border-red-200 bg-red-50"><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>)}
        {success && (<Alert className="mb-4 border-green-200 bg-green-50"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>)}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input placeholder="Submission ID" value={submissionId} onChange={e => setSubmissionId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md" />
          <input placeholder="Student ID (e.g., S0001)" value={studentId} onChange={e => setStudentId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md" />
          <input placeholder="tokenUri (ipfs://...)" value={tokenUri} onChange={e => setTokenUri(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md" />
          <Button onClick={issue} disabled={loading} className="bg-black text-white">Issue</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminIssueCertificate;
