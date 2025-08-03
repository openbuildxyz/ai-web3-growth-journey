export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'meeting' | 'creative' | 'headline' | 'research';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isOnChain: boolean;
  tokenId?: string;
  transactionHash?: string;

  imageUrl?: string; // 可选的图片 IPFS 地址
  file?: File; // 可选的本地文件
  // 你可以在这里添加更多字段
}


export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
}

export type CategoryInfo = {
  id: 'meeting' | 'creative' | 'headline' | 'research';
  name: string;
  icon: string;
  description: string;
  color: string;
};