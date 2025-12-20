import { ethers } from 'ethers';
import InsuranceManagerABI from '@/abi/InsuranceManager.abi.json';
import MockUSDCABI from '@/abi/MockUSDC.abi.json';

// 合约地址 - anvil本地部署地址
export const CONTRACTS = {
  INSURANCE_MANAGER: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // 部署后填入
  MOCK_USDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // 部署后填入
};

// ABI导出
export const INSURANCE_MANAGER_ABI = InsuranceManagerABI;
export const MOCK_USDC_ABI = MockUSDCABI;

// 获取Web3 Provider
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('请安装MetaMask');
};

// 获取签名者
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// 获取保险管理合约实例
export const getInsuranceManagerContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACTS.INSURANCE_MANAGER, INSURANCE_MANAGER_ABI, signer);
};

// 获取USDC合约实例
export const getUSDCContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACTS.MOCK_USDC, MOCK_USDC_ABI, signer);
};

// 连接MetaMask
export const connectWallet = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = getProvider();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      return address;
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw error;
    }
  } else {
    throw new Error('请安装MetaMask');
  }
};

// 格式化USDC金额 (6位小数)
export const formatUSDC = (amount: bigint | string) => {
  return ethers.formatUnits(amount, 6);
};

// 解析USDC金额 (6位小数)
export const parseUSDC = (amount: string) => {
  return ethers.parseUnits(amount, 6);
};

// 生成保险ID
export const generateInsuranceId = async (country: string, disasterType: string, month: number, year: number) => {
  const contract = await getInsuranceManagerContract();
  return await contract.getInsuranceId(country, disasterType, month, year);
}; 