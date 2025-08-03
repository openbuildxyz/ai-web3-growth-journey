import { useState } from 'react';
import { useAccount } from 'wagmi';
import aragonDAO from '../../services/aragon';
import { Loading } from '../common/Loading';

export const AragonVoteButton = ({ proposal, onVoteSuccess }) => {
  const { address, isConnected } = useAccount();
  const [voting, setVoting] = useState(false);
  const [canVote, setCanVote] = useState(null);

  // 检查用户是否可以投票
  const checkVotingEligibility = async () => {
    if (!isConnected || !address || !proposal.aragonProposalId) {
      return false;
    }

    try {
      const eligible = await aragonDAO.canUserVote(proposal.aragonProposalId, address);
      setCanVote(eligible);
      return eligible;
    } catch (error) {
      console.error('检查投票权限失败:', error);
      setCanVote(false);
      return false;
    }
  };

  // 处理投票
  const handleVote = async (voteOption) => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }

    if (!proposal.aragonProposalId) {
      alert('这是本地故事，无法进行链上认可');
      return;
    }

    const eligible = await checkVotingEligibility();
    if (!eligible) {
      alert('您没有投票权限或已经投过票');
      return;
    }

    setVoting(true);

    try {
      console.log('投票:', { proposalId: proposal.aragonProposalId, voteOption });

      const result = await aragonDAO.vote(proposal.aragonProposalId, voteOption);
      
      if (result.success) {
        alert(`投票成功！\n交易哈希: ${result.transactionHash}`);
        
        // 通知父组件投票成功
        if (onVoteSuccess) {
          onVoteSuccess(proposal.id, voteOption);
        }
      }
    } catch (error) {
      console.error('投票失败:', error);
      alert(`投票失败: ${error.message}`);
    } finally {
      setVoting(false);
    }
  };

  // 如果不是 Aragon 提案，显示本地投票按钮
  if (!proposal.aragonProposalId) {
    return (
      <div className="flex space-x-2">
        <button
          onClick={() => handleLocalVote('approve')}
          disabled={voting}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm py-2 px-3 rounded disabled:opacity-50"
        >
          💜 认可
        </button>
        <button
          onClick={() => handleLocalVote('reject')}
          disabled={voting}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded disabled:opacity-50"
        >
          🤔 待完善
        </button>
      </div>
    );
  }

  // 本地投票处理（用于非 Aragon 提案）
  const handleLocalVote = (voteType) => {
    // 简单的本地投票逻辑
    const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
    const updatedProposals = proposals.map(p => {
      if (p.id === proposal.id) {
        return {
          ...p,
          votes: {
            ...p.votes,
            [voteType]: p.votes[voteType] + 1
          }
        };
      }
      return p;
    });
    
    localStorage.setItem('proposals', JSON.stringify(updatedProposals));
    
    if (onVoteSuccess) {
      onVoteSuccess(proposal.id, voteType);
    }
    
    alert('本地投票成功！');
  };

  return (
    <div className="space-y-3">
      {/* 投票状态检查 */}
      {canVote === null && isConnected && (
        <button
          onClick={checkVotingEligibility}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm py-2 px-3 rounded"
        >
          检查认可权限
        </button>
      )}

      {/* 投票按钮 */}
      {canVote === true && (
        <div className="space-y-2">
          <div className="text-xs text-gray-600 text-center mb-2">
            ✨ 链上认可
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleVote(1)} // 1 = Yes
              disabled={voting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm py-2 px-3 rounded disabled:opacity-50 flex items-center justify-center"
            >
              {voting ? <Loading size="sm" /> : '💜 认可'}
            </button>
            
            <button
              onClick={() => handleVote(2)} // 2 = No
              disabled={voting}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded disabled:opacity-50 flex items-center justify-center"
            >
              {voting ? <Loading size="sm" /> : '🤔 待完善'}
            </button>
          </div>
          
          <button
            onClick={() => handleVote(3)} // 3 = Abstain
            disabled={voting}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-1 px-3 rounded disabled:opacity-50"
          >
            {voting ? '认可中...' : '⚪ 暂不评价'}
          </button>
        </div>
      )}

      {/* 无投票权限 */}
      {canVote === false && (
        <div className="text-center text-xs text-gray-500 py-2">
          您没有认可权限或已经认可过
        </div>
      )}

      {/* 未连接钱包 */}
      {!isConnected && (
        <div className="text-center text-xs text-gray-500 py-2">
          请连接钱包以参与认可
        </div>
      )}
    </div>
  );
};