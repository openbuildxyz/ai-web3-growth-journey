import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ProposalCard } from '../components/proposal/ProposalCard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Loading } from '../components/common/Loading';
import { WalletInfo } from '../components/wallet/WalletInfo';
import { NetworkSwitch } from '../components/wallet/NetworkSwitch';
import { WalletStatus } from '../components/wallet/WalletStatus';
import { useWalletStatus } from '../hooks/useWalletStatus';

export const Profile = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  
  const [activeTab, setActiveTab] = useState('created'); // created, voted, stats
  const [userProposals, setUserProposals] = useState([]);
  const [votedProposals, setVotedProposals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock user data
  const mockUserData = {
    created: [
      {
        id: '1',
        title: '我的提案：改进社区治理',
        content: '这是我创建的提案内容...',
        author: address,
        timestamp: Date.now() - 86400000,
        status: 'voting',
        votes: { approve: 15, reject: 3 }
      }
    ],
    voted: [
      {
        id: '2',
        title: '其他用户的提案',
        content: '我投票过的提案...',
        author: '0x8765...4321',
        timestamp: Date.now() - 172800000,
        status: 'approved',
        votes: { approve: 25, reject: 5 },
        myVote: 'approve'
      }
    ],
    stats: {
      totalCreated: 3,
      totalVoted: 12,
      successRate: 66.7,
      reputation: 85
    }
  };

  useEffect(() => {
    if (isConnected) {
      setLoading(true);
      // TODO: 获取用户数据
      setTimeout(() => {
        setUserProposals(mockUserData.created);
        setVotedProposals(mockUserData.voted);
        setLoading(false);
      }, 1000);
    }
  }, [isConnected, address]);



  const tabs = [
    { key: 'created', label: '我的故事', count: mockUserData.stats.totalCreated },
    { key: 'voted', label: '认可记录', count: mockUserData.stats.totalVoted },
    { key: 'stats', label: '贡献统计', count: null }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <WalletStatus requireConnection={true}>
        {/* 用户信息头部 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">我的贡献 ✨</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <span>余额: {balance?.formatted} {balance?.symbol}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {mockUserData.stats.reputation}
            </div>
            <div className="text-sm text-gray-600">声誉分数</div>
          </div>
        </div>
      </div>

      {/* 钱包状态和网络信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WalletInfo />
        <NetworkSwitch />
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg shadow border border-purple-100">
          <div className="text-2xl font-bold text-purple-600">
            {mockUserData.stats.totalCreated}
          </div>
          <div className="text-sm text-gray-600">分享故事</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow border border-green-100">
          <div className="text-2xl font-bold text-green-600">
            {mockUserData.stats.totalVoted}
          </div>
          <div className="text-sm text-gray-600">参与认可</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">
            {mockUserData.stats.successRate}%
          </div>
          <div className="text-sm text-gray-600">故事认可率</div>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg shadow border border-pink-100">
          <div className="text-2xl font-bold text-pink-600">
            {mockUserData.stats.reputation}
          </div>
          <div className="text-sm text-gray-600">贡献值</div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300'
                }`}
              >
                {label}
                {count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 内容区域 */}
      {loading ? (
        <Loading />
      ) : (
        <div>
          {/* 我的提案 */}
          {activeTab === 'created' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-purple-700">我分享的故事 ✨</h2>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded">
                  重塑历史
                </button>
              </div>
              
              {userProposals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProposals.map(proposal => (
                    <ProposalCard key={proposal.id} proposal={proposal} showAuthor={false} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg">
                  <div className="text-gray-400 text-lg mb-4">
                    您还没有分享任何女性历史故事
                  </div>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded">
                    分享第一个故事
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 投票记录 */}
          {activeTab === 'voted' && (
            <div>
              <h2 className="text-xl font-bold text-purple-700 mb-6">我的认可记录 💜</h2>
              
              {votedProposals.length > 0 ? (
                <div className="space-y-4">
                  {votedProposals.map(proposal => (
                    <div key={proposal.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium mb-2">{proposal.title}</h3>
                          <div className="text-sm text-gray-600 mb-2">
                            作者: {proposal.author.slice(0, 6)}...{proposal.author.slice(-4)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(proposal.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            proposal.myVote === 'approve' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {proposal.myVote === 'approve' ? '💜 认可' : '🤔 待完善'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            proposal.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : proposal.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {proposal.status === 'approved' ? '已认可' : 
                             proposal.status === 'rejected' ? '需完善' : '认可中'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg">
                  <div className="text-gray-400 text-lg">
                    您还没有参与任何故事认可
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 统计信息 */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl font-bold mb-6">详细统计</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 提案统计 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">提案统计</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>总创建数:</span>
                      <span className="font-medium">{mockUserData.stats.totalCreated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>通过数:</span>
                      <span className="font-medium text-green-600">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>拒绝数:</span>
                      <span className="font-medium text-red-600">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>通过率:</span>
                      <span className="font-medium">{mockUserData.stats.successRate}%</span>
                    </div>
                  </div>
                </div>

                {/* 投票统计 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">投票统计</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>总投票数:</span>
                      <span className="font-medium">{mockUserData.stats.totalVoted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>赞成票:</span>
                      <span className="font-medium text-green-600">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>反对票:</span>
                      <span className="font-medium text-red-600">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span>参与率:</span>
                      <span className="font-medium">75%</span>
                    </div>
                  </div>
                </div>

                {/* 声誉信息 */}
                <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">声誉系统</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">+15</div>
                      <div className="text-sm text-gray-600">创建提案</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">+12</div>
                      <div className="text-sm text-gray-600">参与投票</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">+30</div>
                      <div className="text-sm text-gray-600">提案通过</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">+28</div>
                      <div className="text-sm text-gray-600">社区贡献</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </WalletStatus>
    </div>
  );
};