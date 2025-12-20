import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { VoteButton } from '../components/proposal/VoteButton';
import { Loading } from '../components/common/Loading';

export const Proposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  // Mock proposal data
  const mockProposal = {
    id: id,
    title: '提案详情：改进社区治理机制',
    content: `## 背景

当前社区治理机制存在一些问题，需要进行改进以提高效率和透明度。

## 提案内容

### 1. 投票权重调整
- 根据持币时间调整投票权重
- 长期持有者获得更高权重

### 2. 提案门槛优化
- 降低提案创建门槛
- 增加提案质量审核机制

### 3. 执行机制完善
- 建立提案执行监督机制
- 定期公布执行进度

## 预期效果

通过这些改进，我们期望：
- 提高社区参与度
- 增强治理透明度
- 提升决策效率

## 实施计划

1. **第一阶段**（1-2周）：技术开发和测试
2. **第二阶段**（2-3周）：社区测试和反馈
3. **第三阶段**（1周）：正式上线

## 预算需求

预计需要 50 ETH 用于开发和运营成本。`,
    author: '0x1234567890123456789012345678901234567890',
    timestamp: Date.now() - 86400000,
    status: 'voting',
    votes: {
      approve: 25,
      reject: 8,
      total: 33
    },
    voters: ['0x1111...1111', '0x2222...2222'],
    aiVerification: {
      passed: true,
      score: 0.92,
      feedback: '内容质量优秀，逻辑清晰，符合社区规范'
    },
    ipfsHash: 'QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    category: 'governance'
  };

  useEffect(() => {
    // TODO: 从IPFS或合约获取提案数据
    setTimeout(() => {
      setProposal(mockProposal);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleVote = async (voteType) => {
    if (!isConnected) return;
    
    setVoting(true);
    try {
      // TODO: 实现投票逻辑
      console.log('投票:', voteType, 'for proposal:', id);
      
      // 模拟投票
      setTimeout(() => {
        setVoting(false);
        // 更新投票数据
        setProposal(prev => ({
          ...prev,
          votes: {
            ...prev.votes,
            [voteType]: prev.votes[voteType] + 1,
            total: prev.votes.total + 1
          },
          voters: [...prev.voters, address]
        }));
      }, 2000);
      
    } catch (error) {
      console.error('投票失败:', error);
      setVoting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      voting: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      onchain: 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      voting: '投票中',
      approved: '已通过',
      rejected: '已拒绝',
      onchain: '已上链'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasVoted = proposal?.voters.includes(address);
  const approvalRate = proposal ? (proposal.votes.approve / proposal.votes.total * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">提案不存在</h1>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 返回按钮 */}
      <button 
        onClick={() => navigate('/')}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← 返回广场
      </button>

      {/* 提案头部 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {proposal.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>作者: {proposal.author.slice(0, 6)}...{proposal.author.slice(-4)}</span>
              <span>创建时间: {formatDate(proposal.timestamp)}</span>
              <span>分类: {proposal.category}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(proposal.status)}
          </div>
        </div>

        {/* AI校验结果 */}
        {proposal.aiVerification && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-medium">✅ AI校验通过</span>
              <span className="text-green-600">评分: {proposal.aiVerification.score}/1.0</span>
            </div>
            <p className="text-green-700 text-sm mt-1">{proposal.aiVerification.feedback}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 提案内容 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">提案内容</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                {proposal.content}
              </pre>
            </div>
          </div>
        </div>

        {/* 投票区域 */}
        <div className="space-y-6">
          {/* 投票统计 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">投票统计</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>赞成 ({proposal.votes.approve})</span>
                  <span>{approvalRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${approvalRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>反对 ({proposal.votes.reject})</span>
                  <span>{(100 - approvalRate).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${100 - approvalRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                总投票数: {proposal.votes.total}
              </div>
            </div>
          </div>

          {/* 投票按钮 */}
          {proposal.status === 'voting' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">参与投票</h3>
              
              {!isConnected ? (
                <div className="text-center text-gray-600">
                  请连接钱包以参与投票
                </div>
              ) : hasVoted ? (
                <div className="text-center text-green-600">
                  ✅ 您已投票
                </div>
              ) : (
                <div className="space-y-3">
                  <VoteButton
                    type="approve"
                    onClick={() => handleVote('approve')}
                    disabled={voting}
                    loading={voting}
                  />
                  <VoteButton
                    type="reject"
                    onClick={() => handleVote('reject')}
                    disabled={voting}
                    loading={voting}
                  />
                </div>
              )}
            </div>
          )}

          {/* 提案信息 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">提案信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">IPFS哈希:</span>
                <span className="font-mono text-xs">{proposal.ipfsHash.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">状态:</span>
                <span>{getStatusBadge(proposal.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">投票截止:</span>
                <span>7天后</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};