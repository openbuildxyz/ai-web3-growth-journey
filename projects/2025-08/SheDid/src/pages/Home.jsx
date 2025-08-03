import { useState, useEffect } from 'react';
import { ProposalCard } from '../components/proposal/ProposalCard';
import { Loading } from '../components/common/Loading';
import { DAOSetup } from '../components/dao/DAOSetup';

export const Home = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, voting, approved, rejected
  const [daoReady, setDaoReady] = useState(false);

  // 检查 DAO 是否已设置
  useEffect(() => {
    const savedDAOAddress = localStorage.getItem('aragonDAOAddress');
    if (savedDAOAddress) {
      setDaoReady(true);
    }
  }, []);

  // 从本地存储加载提案
  useEffect(() => {
    const loadProposals = () => {
      try {
        const storedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');

        // 如果没有存储的提案，使用示例数据
        if (storedProposals.length === 0) {
          const mockProposals = [
            {
              id: '1',
              title: '罗莎琳德·富兰克林：被遗忘的DNA结构发现者',
              content: '罗莎琳德·富兰克林是一位杰出的英国化学家，她的X射线晶体学研究为发现DNA双螺旋结构提供了关键证据。然而，她的贡献长期被忽视，诺贝尔奖颁给了沃森、克里克和威尔金斯，而她却因为癌症早逝，未能获得应有的认可。她的"照片51号"是DNA结构研究的重要突破，但她的名字却很少被提及...',
              author: 'anonymous',
              timestamp: Date.now() - 86400000,
              status: 'voting',
              votes: { approve: 15, reject: 3 },
              aiVerification: { passed: true, score: '0.85' },
              category: 'science'
            },
            {
              id: '2',
              title: '海蒂·拉玛：不仅是好莱坞明星，更是WiFi技术先驱',
              content: '海蒂·拉玛不仅是20世纪40年代的好莱坞巨星，更是一位杰出的发明家。她与作曲家乔治·安太尔共同发明了"跳频技术"，这项技术后来成为了WiFi、GPS和蓝牙技术的基础。然而，她的科学贡献长期被她的演艺事业所掩盖，直到晚年才获得应有的科技界认可。她证明了美貌与智慧可以并存，打破了社会对女性的刻板印象...',
              author: 'anonymous',
              timestamp: Date.now() - 172800000,
              status: 'approved',
              votes: { approve: 25, reject: 5 },
              aiVerification: { passed: true, score: '0.92' },
              category: 'technology'
            }
          ];
          localStorage.setItem('proposals', JSON.stringify(mockProposals));
          setProposals(mockProposals);
        } else {
          setProposals(storedProposals);
        }
      } catch (error) {
        console.error('加载提案失败:', error);
        setProposals([]);
      } finally {
        setLoading(false);
      }
    };

    loadProposals();
  }, []);

  // DAO 准备就绪的回调
  const handleDAOReady = (daoAddress) => {
    console.log('DAO 已准备就绪:', daoAddress);
    setDaoReady(true);
  };

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true;
    return proposal.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          她们的历史广场
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          发现被遗忘的女性历史故事，为她们的贡献投票，让世界看见她们的光芒 ✨
        </p>
      </div>

      {/* DAO Setup */}
      {!daoReady && (
        <div className="mb-6">
          <DAOSetup onDAOReady={handleDAOReady} />
        </div>
      )}

      {/* DAO Status */}
      {daoReady && (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span className="text-green-800 font-medium">
                  DAO 已连接: {localStorage.getItem('aragonDAOAddress')?.slice(0, 6)}...{localStorage.getItem('aragonDAOAddress')?.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('aragonDAOAddress');
                  setDaoReady(false);
                }}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                更换 DAO
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: '全部故事' },
              { key: 'voting', label: '待认可' },
              { key: 'approved', label: '已认可' },
              { key: 'rejected', label: '需完善' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${filter === key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300'
                  }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>



      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg shadow border border-purple-100">
          <div className="text-2xl font-bold text-purple-600">24</div>
          <div className="text-sm text-gray-600">她们的故事</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">8</div>
          <div className="text-sm text-gray-600">待认可</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow border border-green-100">
          <div className="text-2xl font-bold text-green-600">12</div>
          <div className="text-sm text-gray-600">已认可</div>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg shadow border border-pink-100">
          <div className="text-2xl font-bold text-pink-600">6</div>
          <div className="text-sm text-gray-600">永久记录</div>
        </div>
      </div>

      {/* Proposals List */}
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map(proposal => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProposals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            暂无{filter === 'all' ? '' : filter === 'voting' ? '待认可的' : filter === 'approved' ? '已认可的' : '需完善的'}故事
          </div>
          <a
            href="/create"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            ✨ 分享第一个故事
          </a>
        </div>
      )}
    </div>
  );
};