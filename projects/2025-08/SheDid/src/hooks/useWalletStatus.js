import { useAccount, useNetwork, useBalance } from 'wagmi';

export const useWalletStatus = () => {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  const { data: balance, isLoading: balanceLoading } = useBalance({ address });

  // 检查是否在支持的网络上
  const supportedChainIds = [1, 11155111, 137]; // mainnet, sepolia, polygon
  const isWrongNetwork = chain && !supportedChainIds.includes(chain.id);

  // 格式化地址显示
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 格式化余额显示
  const formatBalance = (bal) => {
    if (!bal) return '0';
    return parseFloat(bal.formatted).toFixed(4);
  };

  return {
    // 基础状态
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    
    // 网络信息
    chain,
    isWrongNetwork,
    
    // 余额信息
    balance,
    balanceLoading,
    
    // 格式化工具
    formattedAddress: formatAddress(address),
    formattedBalance: formatBalance(balance),
    
    // 状态检查
    canInteract: isConnected && !isWrongNetwork,
  };
};