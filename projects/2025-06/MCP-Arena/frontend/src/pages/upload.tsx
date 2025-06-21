import { useState } from 'react';
import type { NextPage } from 'next';
import { useAccount, useWriteContract } from 'wagmi';
import Layout from '../components/Layout';
import styles from '../styles/Upload.module.css';

// This would be the actual contract ABI and address in a real application
const MCPStakingABI = [
  {
    inputs: [
      { name: 'mcpId', type: 'string' },
      { name: 'mcpData', type: 'string' }
    ],
    name: 'stakeMCP',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'payable',
    type: 'function'
  }
] as const;

const MCPStakingAddress = '0x0000000000000000000000000000000000000000'; // Replace with actual contract address

const Upload: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [mcpId, setMcpId] = useState('');
  const [mcpData, setMcpData] = useState('');
  const [stakeAmount, setStakeAmount] = useState('0.01');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const { writeContractAsync } = useWriteContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setUploadError('Please connect your wallet first');
      return;
    }

    if (!mcpId || !mcpData) {
      setUploadError('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      await writeContractAsync({
        address: MCPStakingAddress,
        abi: MCPStakingABI,
        functionName: 'stakeMCP',
        args: [mcpId, mcpData],
        value: BigInt(parseFloat(stakeAmount) * 10**18)
      });

      setUploadSuccess(true);
      setMcpId('');
      setMcpData('');
    } catch (error) {
      console.error('Error staking MCP:', error);
      setUploadError('Failed to stake MCP. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout title="MCP Arena - Upload MCP">
      <div className={styles.uploadContainer}>
        <h1 className={styles.title}>Upload Your MCP</h1>
        
        <div className={styles.walletStatus}>
          {isConnected ? (
            <p className={styles.connected}>Connected: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}</p>
          ) : (
            <p className={styles.notConnected}>Please connect your wallet to upload an MCP</p>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="mcpId">MCP ID</label>
            <input
              type="text"
              id="mcpId"
              value={mcpId}
              onChange={(e) => setMcpId(e.target.value)}
              placeholder="Enter MCP ID"
              disabled={!isConnected || isUploading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="mcpData">MCP Data</label>
            <textarea
              id="mcpData"
              value={mcpData}
              onChange={(e) => setMcpData(e.target.value)}
              placeholder="Enter MCP data or configuration"
              rows={6}
              disabled={!isConnected || isUploading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="stakeAmount">Stake Amount (ETH)</label>
            <input
              type="number"
              id="stakeAmount"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              step="0.001"
              min="0.001"
              disabled={!isConnected || isUploading}
            />
          </div>

          {uploadError && <p className={styles.error}>{uploadError}</p>}
          {uploadSuccess && <p className={styles.success}>MCP uploaded successfully!</p>}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!isConnected || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Stake and Upload MCP'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Upload;
