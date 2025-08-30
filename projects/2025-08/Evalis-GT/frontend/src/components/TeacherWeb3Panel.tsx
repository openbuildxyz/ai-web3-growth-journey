import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { connectWallet } from '../lib/wallet';
import axios from 'axios';
import config from '../config/environment';

const TeacherWeb3Panel: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number>(18);
  const [manualAddress, setManualAddress] = useState<string>('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.API_BASE_URL}/web3/me`, { withCredentials: true, headers: authHeaders() });
      setAddress(res.data.walletAddress || null);
      if (res.data.onchain && res.data.onchain.balance) {
        setBalance(res.data.onchain.balance);
        if (typeof res.data.onchain.decimals === 'number') setDecimals(res.data.onchain.decimals);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load web3 profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const authHeaders = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const link = async () => {
    setError(null);
    const acc = await connectWallet();
    if (!acc) return;
    try {
      setLoading(true);
      await axios.post(`${config.API_BASE_URL}/web3/link-wallet`, { address: acc }, { withCredentials: true, headers: authHeaders() });
      await loadProfile();
    } catch (e: any) { setError(e?.message || 'Failed to link wallet'); }
    finally { setLoading(false); }
  };

  const linkManual = async () => {
    if (!manualAddress || !/^0x[a-fA-F0-9]{40}$/.test(manualAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    setError(null);
    try {
      setLoading(true);
      await axios.post(`${config.API_BASE_URL}/web3/link-wallet`, { address: manualAddress }, { withCredentials: true, headers: authHeaders() });
      await loadProfile();
      setManualAddress('');
    } catch (e: any) { setError(e?.message || 'Failed to link wallet'); }
    finally { setLoading(false); }
  };

  const mintEVLT = async () => {
    if (!address) {
      setError('Please link your wallet first');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      // Call test mint endpoint that any authenticated user can use
      const response = await axios.post(
        `${config.API_BASE_URL}/web3/test-mint`, 
        {}, // No body needed, will mint to current user's wallet
        { 
          withCredentials: true, 
          headers: authHeaders() 
        }
      );
      
      if (response.data.txHash) {
        setError(`✅ Success! Minted 100 EVLT tokens. TX: ${response.data.txHash.slice(0, 10)}...`);
        // Reload balance after successful mint
        setTimeout(() => loadProfile(), 3000);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to mint EVLT');
    } finally { 
      setLoading(false); 
    }
  };

  const formatted = () => {
    if (!balance) return '0';
    try {
      const bi = BigInt(balance);
      const base = 10n ** BigInt(decimals);
      const whole = bi / base; const frac = bi % base;
      const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/,'').slice(0,4);
      return fracStr ? `${whole}.${fracStr}` : whole.toString();
    } catch { return balance; }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Web3 Rewards</CardTitle>
        <CardDescription>Link your wallet to receive EVLT and participate in on-chain votes</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50"><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>
        )}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-600">Linked wallet</div>
            <div className="font-mono text-sm break-all">{address || 'Not linked'}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={link} disabled={loading} className="bg-black text-white">{address ? 'Relink' : 'Link Wallet'}</Button>
            <Button onClick={mintEVLT} variant="outline" disabled={loading || !address}>
              {address ? 'Mint 100 EVLT' : 'Link wallet first'}
            </Button>
          </div>
        </div>
        
        {/* Manual wallet input for testing without MetaMask */}
        {!address && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Or manually enter wallet address for testing:</div>
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="flex-1"
              />
              <Button onClick={linkManual} disabled={loading} variant="outline">
                Link Address
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Use: 0x101B5675aE6899b708F2a31EC490E528a0e98D53 (your test wallet)
            </div>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-700">EVLT Balance: <span className="font-mono">{formatted()}</span></div>
      </CardContent>
    </Card>
  );
};

export default TeacherWeb3Panel;
