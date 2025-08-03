import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Loading } from '../components/common/Loading';
import { checkContent } from '../services/ai';
import aragonDAO from '../services/aragon';

export const Create = () => {
  const navigate = useNavigate();
  const { address } = useAccount();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'governance'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiVerification, setAiVerification] = useState(null);
  const [aiChecking, setAiChecking] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 基础验证
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    if (formData.content.length < 50) {
      alert('提案内容至少需要50个字符');
      return;
    }

    // 检查是否连接钱包
    if (!address) {
      alert('请先连接钱包');
      return;
    }

    setIsSubmitting(true);

    try {
      // 创建提案数据
      const proposalData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        author: address,
        aiVerification: aiVerification
      };

      console.log('创建 Aragon 提案:', proposalData);

      // 检查 DAO 是否已初始化
      const daoAddress = localStorage.getItem('aragonDAOAddress');
      if (!daoAddress) {
        alert('请先设置 DAO。请访问首页进行 DAO 设置。');
        navigate('/');
        return;
      }

      // 尝试创建 Aragon 提案
      try {
        const result = await aragonDAO.createProposal(proposalData);

        if (result.success) {
          // 同时保存到本地存储作为备份
          const localProposal = {
            id: result.proposalId,
            ...proposalData,
            timestamp: Date.now(),
            status: 'voting',
            votes: { approve: 0, reject: 0 },
            aragonProposalId: result.proposalId,
            transactionHash: result.transactionHash
          };

          const existingProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
          existingProposals.unshift(localProposal);
          localStorage.setItem('proposals', JSON.stringify(existingProposals));

          alert(`提案创建成功！\n提案ID: ${result.proposalId}\n交易哈希: ${result.transactionHash}`);
          navigate('/');
        }
      } catch (aragonError) {
        console.error('Aragon 提案创建失败:', aragonError);

        // 如果 Aragon 创建失败，降级到本地存储
        console.log('降级到本地存储...');
        const localProposal = {
          id: Date.now().toString(),
          ...proposalData,
          timestamp: Date.now(),
          status: 'voting',
          votes: { approve: 0, reject: 0 },
          isLocal: true // 标记为本地提案
        };

        const existingProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
        existingProposals.unshift(localProposal);
        localStorage.setItem('proposals', JSON.stringify(existingProposals));

        alert(`Aragon 提案创建失败，已保存为本地提案。\n错误: ${aragonError.message}`);
        navigate('/');
      }

    } catch (error) {
      console.error('创建提案失败:', error);
      alert('创建提案失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiCheck = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('请先填写标题和内容');
      return;
    }

    setAiChecking(true);
    setAiVerification(null);

    try {
      console.log('开始 Metaso AI 校验...');

      // 调用 Metaso AI 服务
      const result = await checkContent({
        title: formData.title.trim(),
        body: formData.content.trim(),
        category: formData.category
      });

      console.log('AI 校验结果:', result);
      setAiVerification(result);

    } catch (error) {
      console.error('AI 校验失败:', error);
      alert('AI 校验服务暂时不可用，请稍后重试');
    } finally {
      setAiChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          重塑历史 ✨
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          分享被遗忘的女性历史故事，让她们的贡献被世界看见和认可
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 表单区域 */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                她的故事标题 ✨ *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例如：玛丽·居里：被遗忘的第二次诺贝尔奖（5-100字符）"
                maxLength={100}
                required
              />
              <div className="text-sm text-purple-500 mt-1">
                {formData.title.length}/100 字符
              </div>
            </div>

            {/* 内容 */}
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                她的故事详情 📖 *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="分享她的故事：她是谁？她做了什么？为什么她的贡献被遗忘？她对世界产生了什么影响？（至少50字符）"
                required
              />
              <div className="text-sm text-purple-500 mt-1">
                {formData.content.length} 字符，最少需要50字符
              </div>
            </div>

            {/* AI校验按钮 */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleAiCheck}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 flex items-center"
                disabled={!formData.title.trim() || !formData.content.trim() || aiChecking}
              >
                {aiChecking ? (
                  <>
                    <Loading size="sm" />
                    <span className="ml-2">AI 校验中...</span>
                  </>
                ) : (
                  '🤖 Metaso AI 校验'
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                {showPreview ? '隐藏预览' : '预览'}
              </button>
            </div>

            {/* 提交按钮 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loading size="sm" />
                    <span className="ml-2">重塑中...</span>
                  </div>
                ) : (
                  '✨ 重塑历史'
                )}
              </button>

              {!aiVerification && (
                <p className="text-sm text-purple-500 mt-2 text-center">
                  建议先进行AI校验以确保故事质量
                </p>
              )}

              {aiVerification && !aiVerification.passed && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  请根据AI校验建议完善故事内容后再提交
                </p>
              )}
            </div>
          </form>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* AI校验结果 */}
          {aiVerification && (
            <div className={`p-4 rounded-lg ${aiVerification.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
              <h3 className="font-medium mb-3 flex items-center">
                🤖 Metaso AI 校验结果
              </h3>

              {/* 总体评分 */}
              <div className={`text-sm mb-3 ${aiVerification.passed ? 'text-green-700' : 'text-red-700'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span>总体评分:</span>
                  <span className="font-bold">{aiVerification.score}/1.0</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>状态:</span>
                  <span className="font-medium">
                    {aiVerification.passed ? '✅ 通过' : '❌ 未通过'}
                  </span>
                </div>
              </div>

              {/* 详细评分 */}
              {aiVerification.details && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-600 mb-2">详细评分:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>内容质量:</span>
                      <span>{(aiVerification.details.contentQuality * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>语言质量:</span>
                      <span>{(aiVerification.details.languageQuality * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>主题相关性:</span>
                      <span>{(aiVerification.details.topicRelevance * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>原创性:</span>
                      <span>{(aiVerification.details.originalityScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 反馈信息 */}
              <div className={`text-sm p-2 rounded ${aiVerification.passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                <div className="font-medium mb-1">反馈:</div>
                <div>{aiVerification.feedback}</div>
              </div>

              {/* 改进建议 */}
              {aiVerification.suggestions && aiVerification.suggestions.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-gray-600 mb-2">改进建议:</h4>
                  <ul className="text-xs space-y-1">
                    {aiVerification.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 标记信息 */}
              {aiVerification.flags && aiVerification.flags.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-red-600 mb-2">注意事项:</h4>
                  <div className="flex flex-wrap gap-1">
                    {aiVerification.flags.map((flag, index) => (
                      <span key={index} className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 创建指南 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-medium text-purple-900 mb-2">✨ 重塑指南</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 标题要简洁有力（5-100字符）</li>
              <li>• 详细描述她的故事和贡献（至少50字符）</li>
              <li>• 建议通过AI校验确保故事质量</li>
              <li>• 故事将由社区投票认可</li>
              <li>• 被认可的故事将永久记录在链上</li>
            </ul>
          </div>

          {/* 预览区域 */}
          {showPreview && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium mb-2">预览</h3>
              <div className="text-sm">
                <div className="mb-2">
                  <span className="text-xs text-gray-500 uppercase">{formData.category}</span>
                </div>
                <h4 className="font-medium text-lg mb-2">
                  {formData.title || '提案标题'}
                </h4>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {formData.content || '提案内容'}
                </div>
              </div>
            </div>
          )}

          {/* 统计信息 */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-2">内容统计</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>标题长度: {formData.title.length} 字符</div>
              <div>内容长度: {formData.content.length} 字符</div>
              <div>预计阅读时间: {Math.max(1, Math.ceil(formData.content.length / 200))} 分钟</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};