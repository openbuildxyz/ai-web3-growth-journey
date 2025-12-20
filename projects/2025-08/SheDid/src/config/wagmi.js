import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

// 配置链和提供者
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia, mainnet], // 先使用测试网，更容易连接
  [publicProvider()]
);

// 获取默认钱包连接器
const { connectors } = getDefaultWallets({
  appName: 'ProposalDAO',
  projectId: 'e15d592850eb375a6ce0ad381a141800',
  chains
});

// 创建 wagmi 配置
export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { chains };