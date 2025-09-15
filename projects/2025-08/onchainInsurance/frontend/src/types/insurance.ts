export interface InsuranceInfo {
  country: string;
  disasterType: string;
  month: number;
  year: number;
  exists: boolean;
  disasterHappened: boolean;
  totalPool: string; // 格式化后的USDC数量
  totalShares: string;
  claimRatio: number;
  poolProcessed: boolean;
  inheritedAmount: string;
  insuranceId: string;
}

export interface UserInsuranceData {
  shares: string;
  hasClaimed: boolean;
  potentialClaim: string;
}

export interface FinancialInfo {
  totalPool: string;
  userContributions: string;
  inheritedAmount: string;
  availableForClaim: string;
  isProcessed: boolean;
}

export interface InsuranceCardProps {
  insurance: InsuranceInfo;
  onBuy: (insuranceId: string, amount: string) => void;
  onDonate: (insuranceId: string, amount: string) => void;
}

// 灾害类型映射
export const DISASTER_TYPES = {
  'Typhoon': '🌪️ 台风',
  'Earthquake': '🏔️ 地震',
  'Flood': '🌊 洪水',
  'Drought': '🌵 干旱',
  'Wildfire': '🔥 野火',
  'Hurricane': '🌀 飓风',
} as const;

// 国家映射
export const COUNTRIES = {
  'China': '🇨🇳 中国',
  'Japan': '🇯🇵 日本',
  'India': '🇮🇳 印度',
  'USA': '🇺🇸 美国',
  'Philippines': '🇵🇭 菲律宾',
} as const; 