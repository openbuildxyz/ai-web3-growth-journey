import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Coins, Award, ExternalLink, Wallet, Trophy, Gift, AlertCircle } from 'lucide-react';
import { getMyTokenBalance, getMyCertificates, getMyBadges } from '../api/studentService';
import WalletConnection from './WalletConnection';

// Badge utility functions
const getBadgeName = (badgeType: string): string => {
  const nameMap: { [key: string]: string } = {
    'diamond': 'Diamond Excellence',
    'platinum': 'Platinum Achievement',
    'gold': 'Gold Standard',
    'silver': 'Silver Merit',
    'bronze': 'Bronze Recognition'
  };
  return nameMap[badgeType] || badgeType;
};

const getBadgeStyles = (badgeType: string): string => {
  const styleMap: { [key: string]: string } = {
    'diamond': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'platinum': 'bg-gray-100 text-gray-800 border-gray-300',
    'gold': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'silver': 'bg-slate-100 text-slate-800 border-slate-300',
    'bronze': 'bg-orange-100 text-orange-800 border-orange-300'
  };
  return styleMap[badgeType] || 'bg-gray-100 text-gray-800 border-gray-200';
};

interface Badge {
  id: string;
  submissionId: number;
  badgeType: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
  badgeName: string;
  badgeDescription: string;
  badgeColor: string;
  badgeImagePath: string;
  evtTokens: number;
  score: number;
  assignmentTitle: string;
  gradedDate: string;
  minGrade: number;
  maxGrade: number;
  count: number;
  firstEarned: string;
}

interface BadgesResponse {
  studentId: string;
  studentName: string;
  totalBadges: number;
  uniqueBadges: number;
  badges: Badge[];
}

interface Certificate {
  id: string;
  tokenId: string;
  metadataUri: string; // Updated to match new field name
  contractAddress: string;
  badgeType?: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
  transactionHash?: string;
  createdAt: string;
  Submission?: {
    Assignment?: {
      title: string;
    };
    score?: number;
    letterGrade?: string;
  };
}

interface TokenBalance {
  balance: string;
  balanceFormatted: string;
  walletAddress?: string;
  walletLinked: boolean;
}

const StudentWeb3Rewards: React.FC = () => {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 StudentWeb3Rewards: Loading rewards data...');

      const [balanceData, certificatesData, badgesData] = await Promise.all([
        getMyTokenBalance().catch((err) => {
          console.warn('⚠️ Failed to get token balance:', err.message);
          return { balance: '0', balanceFormatted: '0', walletLinked: false };
        }),
        getMyCertificates().catch((err) => {
          console.warn('⚠️ Failed to get certificates:', err.message);
          // Return mock certificate for demo purposes
          return [{
            id: 1,
            studentId: 1,
            submissionId: 1,
            tokenId: '1',
            contractAddress: '0x8f907106a386aF9b9a3a7A3bF74BbBa45fdEc5a0',
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            metadata: {
              name: 'Evalis Achievement Certificate',
              description: 'NFT certificate for exceptional academic achievement',
              image: '/public/nft-badges/nft_certificate.jpeg',
              attributes: [
                { trait_type: 'Student Name', value: 'Demo Student' },
                { trait_type: 'Assignment', value: 'Mathematics Quiz' },
                { trait_type: 'Score', value: '85%' },
                { trait_type: 'Grade Tier', value: 'Gold' },
                { trait_type: 'Issue Date', value: '2024-01-15' },
                { trait_type: 'Award Type', value: 'Automatic' }
              ]
            },
            createdAt: new Date().toISOString(),
            Submission: {
              Assignment: { title: 'Mathematics Quiz' },
              score: 85,
              letterGrade: 'A'
            },
            badgeType: 'gold'
          }];
        }),
        getMyBadges().catch((err) => {
          console.warn('⚠️ Failed to get badges:', err.message);
          return { badges: [] };
        })
      ]);

      console.log('📊 Rewards data loaded:');
      console.log('  - Token balance:', balanceData);
      console.log('  - Certificates:', certificatesData);
      console.log('  - Badges:', badgesData);

      setTokenBalance(balanceData);
      setCertificates(certificatesData);
      setBadges(badgesData.badges || []);
      
      console.log(`✅ Certificates state updated: ${certificatesData?.length || 0} certificates found`);
    } catch (err: any) {
      console.error('❌ Error loading rewards:', err);
      setError(err.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnected = async (_walletAddress: string) => {
    // Reload rewards data after wallet is connected
    await loadRewards();
  };

  const formatTokenBalance = (balance: string) => {
    if (!balance || balance === '0') return '0';
    
    try {
      const num = parseFloat(balance);
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toFixed(2);
    } catch {
      return balance;
    }
  };

  const getExplorerUrl = (contractAddress: string, tokenId: string) => {
    return `https://sepolia.etherscan.io/token/${contractAddress}?a=${tokenId}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* EVT Token Balance */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Coins className="h-5 w-5" />
            EVT Token Balance
          </CardTitle>
          <CardDescription>Tokens earned for academic achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {tokenBalance?.walletLinked ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {formatTokenBalance(tokenBalance.balanceFormatted)} EVLT
                  </div>
                  <p className="text-sm text-purple-600">
                    Raw balance: {tokenBalance.balance}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Wallet className="h-3 w-3 mr-1" />
                    Wallet Linked
                  </Badge>
                  <p className="text-xs text-gray-600 mt-1">
                    {tokenBalance.walletAddress?.slice(0, 6)}...{tokenBalance.walletAddress?.slice(-4)}
                  </p>
                </div>
              </div>
              
              {parseFloat(tokenBalance.balanceFormatted) > 0 && (
                <div className="p-3 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">
                      Congratulations! You've earned tokens through excellent academic performance.
                    </span>
                  </div>
                </div>
              )}
              
              {/* Recent Activity Notice */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>🎓 How to earn more:</strong> Submit quality assignments and maintain grades of 75% or higher to automatically receive badge rewards and EVLT tokens!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center mb-4">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Wallet Not Connected</h3>
                <p className="text-gray-600 text-sm">
                  Connect your wallet to receive EVLT tokens and NFT certificates automatically when you earn good grades!
                </p>
              </div>
              <WalletConnection onWalletConnected={handleWalletConnected} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge Achievements */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Trophy className="h-5 w-5" />
            Academic Badges Earned
          </CardTitle>
          <CardDescription>
            Performance badges earned through excellent grades ({badges.length} earned)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div 
                    key={badge.id} 
                    className="p-4 rounded-lg border"
                    style={{ 
                      background: `linear-gradient(135deg, ${badge.badgeColor}20, ${badge.badgeColor}10)`,
                      borderColor: `${badge.badgeColor}40`
                    }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden border-2"
                           style={{ borderColor: badge.badgeColor }}>
                        <img 
                          src={badge.badgeImagePath} 
                          alt={badge.badgeName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Fallback to trophy icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <Trophy 
                          className="h-8 w-8 text-white hidden" 
                          style={{ color: badge.badgeColor }}
                        />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{badge.badgeName}</h4>
                      <p className="text-xs text-gray-600 mb-2">{badge.badgeDescription}</p>
                      <div className="space-y-2">
                        <Badge 
                          className="border-0 text-white text-xs"
                          style={{ backgroundColor: badge.badgeColor }}
                        >
                          {badge.evtTokens} EVLT
                        </Badge>
                        <div className="text-xs text-gray-600">
                          <div>Score: {badge.score}%</div>
                          <div>Assignment: {badge.assignmentTitle}</div>
                          <div>Earned: {new Date(badge.firstEarned).toLocaleDateString()}</div>
                          {badge.count > 1 && (
                            <div className="font-semibold text-orange-600">
                              Earned {badge.count} times
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  <Gift className="h-4 w-4" />
                  <span className="font-medium">
                    You've earned {badges.length} badge{badges.length !== 1 ? 's' : ''} through excellent academic performance!
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">No Badges Yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Earn your first badge by scoring 75% or higher on assignments
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-500">
                <div className="p-2 bg-orange-50 rounded border">Bronze: 75-79%</div>
                <div className="p-2 bg-slate-50 rounded border">Silver: 80-84%</div>
                <div className="p-2 bg-yellow-50 rounded border">Gold: 85-89%</div>
                <div className="p-2 bg-gray-50 rounded border">Platinum: 90-94%</div>
                <div className="p-2 bg-cyan-50 rounded border">Diamond: 95-100%</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NFT Certificates */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            NFT Achievement Certificates
          </CardTitle>
          <CardDescription>
            Blockchain certificates for exceptional work ({certificates.length} earned)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-800 mb-1">
                        {cert.Submission?.Assignment?.title || 'Academic Achievement'}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        {cert.Submission?.letterGrade && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Grade: {cert.Submission.letterGrade}
                          </Badge>
                        )}
                        {cert.Submission?.score && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {cert.Submission.score}%
                          </Badge>
                        )}
                        {cert.badgeType && (
                          <Badge className={`${getBadgeStyles(cert.badgeType)}`}>
                            {getBadgeName(cert.badgeType)} Badge
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  
                  <div className="space-y-2 text-sm text-orange-700">
                    <div className="flex items-center justify-between">
                      <span>Token ID:</span>
                      <span className="font-mono">{cert.tokenId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Date Earned:</span>
                      <span>{new Date(cert.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-100"
                      onClick={() => window.open(getExplorerUrl(cert.contractAddress, cert.tokenId), '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Chain
                    </Button>
                    {cert.metadataUri && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-100"
                        onClick={() => window.open(cert.metadataUri, '_blank')}
                      >
                        <Gift className="h-3 w-3 mr-1" />
                        Metadata
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
              <p className="text-gray-600 mb-4">
                Complete assignments with excellent grades to earn NFT certificates from your teachers
              </p>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Teachers can award NFT certificates for outstanding work. 
                  Keep submitting quality assignments to earn your first certificate!
                </p>
              </div>
              
              {/* Debug Information */}
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg max-w-md mx-auto">
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Debug Info:</strong>
                </p>
                <p className="text-xs text-gray-500">
                  • Certificates found: {certificates.length}
                </p>
                <p className="text-xs text-gray-500">
                  • Loading: {loading ? 'true' : 'false'}
                </p>
                <p className="text-xs text-gray-500">
                  • Error: {error || 'none'}
                </p>
                <p className="text-xs text-gray-500">
                  • Wallet linked: {tokenBalance?.walletLinked ? 'yes' : 'no'}
                </p>
                {certificates.length > 0 && (
                  <p className="text-xs text-blue-600 font-medium">
                    📋 Demo certificate data displayed
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 text-xs"
                  onClick={() => loadRewards()}
                >
                  🔄 Refresh Certificates
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="border-0 shadow-md bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">How Web3 Rewards Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Coins className="h-4 w-4 text-purple-600" />
                EVT Tokens
              </h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Earned for good academic performance</li>
                <li>• Used for governance voting</li>
                <li>• Stored in your linked Web3 wallet</li>
                <li>• Can be transferred to other students</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-600" />
                NFT Certificates
              </h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Unique digital certificates</li>
                <li>• Awarded for exceptional work</li>
                <li>• Permanently stored on blockchain</li>
                <li>• Prove your academic achievements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentWeb3Rewards;
