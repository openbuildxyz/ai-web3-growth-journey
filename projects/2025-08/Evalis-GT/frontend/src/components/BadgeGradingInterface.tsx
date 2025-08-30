import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Award, Trophy, Medal, Star, Circle } from 'lucide-react';

interface BadgeInfo {
  type: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
  name: string;
  minGrade: number;
  maxGrade: number;
  imagePath: string;
  color: string;
  description: string;
  evtTokens: number;
}

interface BadgeGradingInterfaceProps {
  submissionId: number;
  currentGrade: number;
  studentName: string;
  onAwardBadgeRewards: (submissionId: number, awardCertificate: boolean) => Promise<void>;
  isGraded?: boolean;
}

const BADGE_TIERS: BadgeInfo[] = [
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

function getBadgeForGrade(grade: number): BadgeInfo | null {
  if (grade < 75) return null;
  
  return BADGE_TIERS.find(badge => 
    grade >= badge.minGrade && grade <= badge.maxGrade
  ) || null;
}

function getBadgeIcon(badgeType: string) {
  switch (badgeType) {
    case 'diamond': return <Star className="w-4 h-4" style={{ color: '#B9F2FF' }} />;
    case 'platinum': return <Award className="w-4 h-4" style={{ color: '#E5E4E2' }} />;
    case 'gold': return <Trophy className="w-4 h-4" style={{ color: '#FFD700' }} />;
    case 'silver': return <Medal className="w-4 h-4" style={{ color: '#C0C0C0' }} />;
    case 'bronze': return <Circle className="w-4 h-4" style={{ color: '#CD7F32' }} />;
    default: return null;
  }
}

export const BadgeGradingInterface: React.FC<BadgeGradingInterfaceProps> = ({
  submissionId,
  currentGrade,
  studentName,
  onAwardBadgeRewards,
  isGraded = false
}) => {
  const [awardCertificate, setAwardCertificate] = useState(false);
  const [isAwarding, setIsAwarding] = useState(false);
  
  const badge = getBadgeForGrade(currentGrade);
  
  const handleAwardBadgeRewards = async () => {
    if (!badge) return;
    
    if (!isGraded) {
      alert('Please grade the submission first before awarding badge rewards.');
      return;
    }
    
    setIsAwarding(true);
    try {
      await onAwardBadgeRewards(submissionId, awardCertificate);
    } catch (error) {
      console.error('Error awarding badge rewards:', error);
    } finally {
      setIsAwarding(false);
    }
  };

  if (!badge) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="text-center">
          <div className="text-gray-500 mb-2">
            <Circle className="w-8 h-8 mx-auto opacity-50" />
          </div>
          <p className="text-sm text-gray-600">
            Grade {currentGrade}% does not qualify for any badge
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Minimum 75% required for Bronze badge
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 border ${
      isGraded 
        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" 
        : "bg-gradient-to-r from-gray-50 to-yellow-50 border-yellow-300"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={badge.imagePath} 
              alt={badge.name}
              className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
              style={{ borderColor: badge.color }}
            />
            <div className="absolute -top-1 -right-1">
              {getBadgeIcon(badge.type)}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{badge.name}</h4>
            <p className="text-sm text-gray-600">{badge.description}</p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className="text-lg font-bold px-3 py-1"
          style={{ borderColor: badge.color, color: badge.color }}
        >
          {badge.evtTokens} EVLT
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Grade Range:</span>
          <span className="font-medium">{badge.minGrade}% - {badge.maxGrade}%</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Student Grade:</span>
          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
            {currentGrade}%
          </Badge>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input 
            type="checkbox"
            id={`certificate-${submissionId}`}
            checked={awardCertificate}
            onChange={(e) => setAwardCertificate(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label 
            htmlFor={`certificate-${submissionId}`}
            className="text-sm text-gray-700 cursor-pointer"
          >
            Also award NFT certificate
          </label>
        </div>

        <Button
          onClick={handleAwardBadgeRewards}
          disabled={isAwarding || !isGraded}
          className="w-full"
          style={{ backgroundColor: badge.color, color: '#000' }}
        >
          {isAwarding ? (
            <>Awarding...</>
          ) : !isGraded ? (
            <>
              <Award className="w-4 h-4 mr-2" />
              Grade submission first to award {badge.name}
            </>
          ) : (
            <>
              <Award className="w-4 h-4 mr-2" />
              Award {badge.name} + {badge.evtTokens} EVLT
              {awardCertificate && ' + NFT Certificate'}
            </>
          )}
        </Button>
      </div>

      <div className={`mt-3 pt-3 border-t ${isGraded ? 'border-blue-200' : 'border-yellow-200'}`}>
        <p className="text-xs text-center">
          {isGraded ? (
            <span className="text-gray-600">🎉 Automatic badge-based rewards for {studentName}</span>
          ) : (
            <span className="text-yellow-700">⚠️ Please grade the submission first before awarding badges</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default BadgeGradingInterface;
