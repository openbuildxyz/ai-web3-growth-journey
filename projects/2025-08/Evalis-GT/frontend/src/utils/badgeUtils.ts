export interface BadgeInfo {
  type: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
  name: string;
  minGrade: number;
  maxGrade: number;
  imagePath: string;
  color: string;
  description: string;
  evtTokens: number; // EVT tokens awarded for this badge level
}

export const BADGE_TIERS: BadgeInfo[] = [
  {
    type: 'diamond',
    name: 'Diamond Excellence',
    minGrade: 95,
    maxGrade: 100,
    imagePath: '/nft-badges/diamond-badge.png',
    color: '#B9F2FF',
    description: 'Outstanding performance with exceptional mastery',
    evtTokens: 100
  },
  {
    type: 'platinum',
    name: 'Platinum Achievement',
    minGrade: 90,
    maxGrade: 94.99,
    imagePath: '/nft-badges/platinum-badge.png',
    color: '#E5E4E2',
    description: 'Excellent performance with strong understanding',
    evtTokens: 75
  },
  {
    type: 'gold',
    name: 'Gold Standard',
    minGrade: 85,
    maxGrade: 89.99,
    imagePath: '/nft-badges/gold-badge.png',
    color: '#FFD700',
    description: 'Very good performance with solid knowledge',
    evtTokens: 50
  },
  {
    type: 'silver',
    name: 'Silver Merit',
    minGrade: 80,
    maxGrade: 84.99,
    imagePath: '/nft-badges/silver-badge.png',
    color: '#C0C0C0',
    description: 'Good performance with adequate understanding',
    evtTokens: 30
  },
  {
    type: 'bronze',
    name: 'Bronze Recognition',
    minGrade: 75,
    maxGrade: 79.99,
    imagePath: '/nft-badges/bronze-badge.png',
    color: '#CD7F32',
    description: 'Satisfactory performance meeting requirements',
    evtTokens: 20
  }
];

export function getBadgeForGrade(grade: number): BadgeInfo | null {
  if (grade < 75) return null; // No badge for grades below 75
  
  return BADGE_TIERS.find(badge => 
    grade >= badge.minGrade && grade <= badge.maxGrade
  ) || null;
}

export function getAllBadgeTiers(): BadgeInfo[] {
  return BADGE_TIERS;
}

export function getBadgeByType(type: string): BadgeInfo | null {
  return BADGE_TIERS.find(badge => badge.type === type) || null;
}

export function formatEvtTokens(tokens: number): string {
  return `${tokens} EVLT`;
}

export function getBadgeRarityLevel(badgeType: string): number {
  const rarityMap = {
    'diamond': 5,
    'platinum': 4,
    'gold': 3,
    'silver': 2,
    'bronze': 1
  };
  return rarityMap[badgeType as keyof typeof rarityMap] || 0;
}
