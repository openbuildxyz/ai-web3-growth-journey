'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from './Web3Provider';
import { WebsiteRegistryABI } from './WebsiteRegistryABI';

// 导入本地ethers模块
// 注意：在实际部署时，可以替换为真实的ethers库
import ethers from '../ethers';

// 智能合约地址（部署后需要替换为实际地址）
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

// WebsiteOnChain组件属性
interface WebsiteOnChainProps {
  websiteId: string;
  websiteName: string;
  onClose: () => void;
}

/**
 * WebsiteOnChain组件
 * 处理网站上链操作
 */
const WebsiteOnChain: React.FC<WebsiteOnChainProps> = ({
  websiteId,
  websiteName,
  onClose
}) => {
  const { isConnected, account, connect, isLoading: isWeb3Loading } = useWeb3();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // 构建网站URL
  const websiteUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/websites/${websiteId}`;

  // 处理连接钱包
  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      setError('连接钱包失败，请重试');
      console.error('连接钱包错误:', err);
    }
  };

  // 处理上链操作
  const handleSubmit = async () => {
    if (!isConnected || !account) {
      setError('请先连接钱包');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 创建Web3提供者
      const provider = typeof window !== 'undefined' && window.ethereum
        ? new ethers.providers.Web3Provider(window.ethereum)
        : { getSigner: () => ({ getAddress: () => account }) };

      const signer = provider.getSigner();

      // 创建合约实例
      const contract = new ethers.Contract(CONTRACT_ADDRESS, WebsiteRegistryABI, signer);

      // 调用合约方法
      console.log('调用合约方法 registerWebsite:', { websiteId, websiteName, websiteUrl });
      const tx = await contract.registerWebsite(websiteId, websiteName, websiteUrl);

      // 等待交易确认
      console.log('等待交易确认...');
      await tx.wait();

      // 设置交易哈希
      console.log('交易已确认，哈希:', tx.hash);
      setTxHash(tx.hash);
      setSuccess(true);
    } catch (err) {
      console.error('上链失败:', err);
      setError('上链操作失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">官网上链</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 mb-2">将您的企业官网永久记录在区块链上，确保其真实性和不可篡改性。</p>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-500">网站名称: <span className="font-medium text-gray-700">{websiteName}</span></p>
          <p className="text-sm text-gray-500">网站ID: <span className="font-medium text-gray-700">{websiteId}</span></p>
          <p className="text-sm text-gray-500">网站URL: <span className="font-medium text-gray-700">{websiteUrl}</span></p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {success && txHash && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md">
          <p className="font-medium">上链成功！</p>
          <p className="text-sm mt-1">交易哈希: <span className="font-mono text-xs">{txHash}</span></p>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isWeb3Loading}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isWeb3Loading ? '连接中...' : '连接钱包'}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || success}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '处理中...' : success ? '上链成功' : '确认上链'}
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          {success ? '关闭' : '取消'}
        </button>
      </div>
    </div>
  );
};

export default WebsiteOnChain;
