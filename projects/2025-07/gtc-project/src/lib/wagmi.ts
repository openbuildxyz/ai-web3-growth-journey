import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'GreenTrace Protocol',
  projectId: 'YOUR_PROJECT_ID', // 请替换为您的WalletConnect项目ID
  chains: [mainnet, sepolia],
  ssr: true,
}); 