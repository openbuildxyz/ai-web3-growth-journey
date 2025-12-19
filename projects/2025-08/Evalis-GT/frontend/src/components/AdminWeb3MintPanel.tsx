import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import axios from 'axios';
import config from '../config/environment';

const AdminWeb3MintPanel: React.FC = () => {
  const [role, setRole] = useState<'teacher'|'student'>('teacher');
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('1000000000000000000'); // 1 EVLT @ 18 decimals
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const authHeaders = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const mint = async () => {
    setError(null); setSuccess(null);
    if (!userId) { setError('Provide user ID'); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${config.API_BASE_URL}/web3/admin/mint`, { role, userId, amount }, { withCredentials: true, headers: authHeaders() });
      setSuccess(`Minted. Tx: ${res.data.txHash}`);
    } catch (e:any) { setError(e?.response?.data?.message || e?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Web3 Mint (Admin)</CardTitle>
        <CardDescription>Mint EVLT to a linked wallet. Ensure TOKEN_ADDRESS and MINTER_PRIVATE_KEY are configured on the server.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (<Alert className="mb-4 border-red-200 bg-red-50"><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>)}
        {success && (<Alert className="mb-4 border-green-200 bg-green-50"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>)}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={role} onChange={e => setRole(e.target.value as any)} className="px-3 py-2 border border-gray-200 rounded-md">
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
          <input placeholder="User ID (e.g., T0001 or S0001)" value={userId} onChange={e => setUserId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md" />
          <input placeholder="Amount (wei)" value={amount} onChange={e => setAmount(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-md font-mono" />
          <Button onClick={mint} disabled={loading} className="bg-black text-white">Mint</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminWeb3MintPanel;
