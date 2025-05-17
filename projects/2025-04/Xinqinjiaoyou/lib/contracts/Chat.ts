import { ethers } from 'ethers';

export const ChatABI = [
  "event NewMessage(address indexed sender, address indexed recipient, string content, uint256 timestamp)",
  "function sendMessage(address recipient, string content) public",
  "function verifyMessage(address sender, address recipient, string content, uint256 timestamp) public pure returns (bool)"
];

// 使用 Sepolia 测试网络的合约地址
const DEFAULT_CHAT_ADDRESS = '0x1234567890123456789012345678901234567890';

export const ChatAddress = process.env.NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS || DEFAULT_CHAT_ADDRESS;

if (!ChatAddress) {
  throw new Error('Chat contract address is not configured. Please set NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS in your .env file.');
}

export const getChatContract = (provider: ethers.Provider) => {
  if (!ethers.isAddress(ChatAddress)) {
    throw new Error(`Invalid contract address: ${ChatAddress}`);
  }
  return new ethers.Contract(ChatAddress, ChatABI, provider);
};

export const getChatContractWithSigner = (provider: ethers.Provider, signer: ethers.Signer) => {
  if (!ethers.isAddress(ChatAddress)) {
    throw new Error(`Invalid contract address: ${ChatAddress}`);
  }
  return new ethers.Contract(ChatAddress, ChatABI, signer);
}; 