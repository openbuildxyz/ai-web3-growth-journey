import { Link } from 'react-router-dom';
import { AragonVoteButton } from './AragonVoteButton';

export const ProposalCard = ({ proposal, showAuthor = true }) => {
  const getStatusBadge = (status) => {
    const badges = {
      voting: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      onchain: 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      voting: '认可中',
      approved: '已认可',
      rejected: '需完善',
      onchain: '永久记录'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const totalVotes = proposal.votes.approve + proposal.votes.reject;
  const approvalRate = totalVotes > 0 ? (proposal.votes.approve / totalVotes * 100).toFixed(0) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Link 
              to={`/proposal/${proposal.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
            >
              {proposal.title}
            </Link>
          </div>
          <div className="ml-2">
            {getStatusBadge(proposal.status)}
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {proposal.content.length > 150 
            ? `${proposal.content.substring(0, 150)}...` 
            : proposal.content
          }
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          {showAuthor && (
            <span>
              {proposal.author.slice(0, 6)}...{proposal.author.slice(-4)}
            </span>
          )}
          <span>{formatDate(proposal.timestamp)}</span>
        </div>

        {/* Voting Progress */}
        {proposal.status === 'voting' && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">认可进度</span>
              <span className="text-gray-900">{totalVotes} 人参与</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${approvalRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>💜 认可 {proposal.votes.approve}</span>
              <span>🤔 待完善 {proposal.votes.reject}</span>
            </div>
          </div>
        )}

        {/* AI Verification */}
        {proposal.aiVerification && (
          <div className="flex items-center text-xs text-green-600 mb-4">
            <span className="mr-1">✅</span>
            <span>AI校验通过 ({proposal.aiVerification.score}/1.0)</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Link 
              to={`/proposal/${proposal.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              查看详情 →
            </Link>
            
            {/* 提案类型标识 */}
            <div className="text-xs text-gray-500">
              {proposal.aragonProposalId ? '🏛️ 链上记录' : '✨ 待上链'}
            </div>
          </div>
          
          {/* Aragon 投票组件 */}
          {proposal.status === 'voting' && (
            <AragonVoteButton 
              proposal={proposal}
              onVoteSuccess={(proposalId, voteType) => {
                console.log('投票成功:', proposalId, voteType);
                // 这里可以添加刷新提案列表的逻辑
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};