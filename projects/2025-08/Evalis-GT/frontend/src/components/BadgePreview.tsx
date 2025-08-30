import React from 'react';
import { Badge } from './ui/badge';
import { Trophy, Star, Award, Medal, Gift } from 'lucide-react';

interface BadgePreviewProps {
  score: number;
  studentName: string;
  className?: string;
}

const BADGE_TIERS = [
  {
    type: 'diamond',
    name: 'Diamond Excellence',
    minGrade: 95,
    maxGrade: 100,
    color: '#B9F2FF',
    textColor: 'text-cyan-800',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-200',
    icon: Star,
    description: 'Outstanding performance with exceptional mastery',
    evtTokens: 100
  },
  {
    type: 'platinum',
    name: 'Platinum Achievement',
    minGrade: 90,
    maxGrade: 94.99,
    color: '#E5E4E2',
    textColor: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: Trophy,
    description: 'Excellent performance with strong understanding',
    evtTokens: 75
  },
  {
    type: 'gold',
    name: 'Gold Standard',
    minGrade: 85,
    maxGrade: 89.99,
    color: '#FFD700',
    textColor: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: Award,
    description: 'Very good performance with solid knowledge',
    evtTokens: 50
  },
  {
    type: 'silver',
    name: 'Silver Merit',
    minGrade: 80,
    maxGrade: 84.99,
    color: '#C0C0C0',
    textColor: 'text-slate-800',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    icon: Medal,
    description: 'Good performance with adequate understanding',
    evtTokens: 30
  },
  {
    type: 'bronze',
    name: 'Bronze Recognition',
    minGrade: 75,
    maxGrade: 79.99,
    color: '#CD7F32',
    textColor: 'text-orange-800',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    icon: Gift,
    description: 'Satisfactory performance meeting requirements',
    evtTokens: 20
  }
];

function getBadgeForGrade(grade: number) {
  if (grade < 75) return null;
  
  return BADGE_TIERS.find(badge => 
    grade >= badge.minGrade && grade <= badge.maxGrade
  ) || null;
}

const BadgePreview: React.FC<BadgePreviewProps> = ({ score, studentName, className = '' }) => {
  const badge = getBadgeForGrade(score);

  if (!badge) {
    if (score >= 0 && score < 75) {
      return (
        <div className={`p-3 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Score {score}% - No badge earned (minimum 75% required)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Keep working to earn your first badge!
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  const IconComponent = badge.icon;
  const willGetCertificate = score >= 80;

  return (
    <div className={`p-4 rounded-lg border-2 ${badge.bgColor} ${badge.borderColor} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-6 w-6 ${badge.textColor}`} />
          <div>
            <h4 className={`font-semibold ${badge.textColor}`}>{badge.name}</h4>
            <p className="text-xs text-gray-600">for {studentName}</p>
          </div>
        </div>
        <Badge className={`${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}>
          {score}%
        </Badge>
      </div>
      
      <div className="space-y-2">
        <p className={`text-sm ${badge.textColor} font-medium`}>
          🎁 Rewards: {badge.evtTokens} EVLT Tokens
          {willGetCertificate && ' + NFT Certificate'}
        </p>
        <p className="text-xs text-gray-700">
          {badge.description}
        </p>
        
        {willGetCertificate && (
          <div className="mt-2 p-2 bg-white bg-opacity-60 rounded border border-orange-300">
            <p className="text-xs text-orange-800 font-medium">
              🏆 Bonus: NFT Certificate will be automatically awarded for excellent performance!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgePreview;
