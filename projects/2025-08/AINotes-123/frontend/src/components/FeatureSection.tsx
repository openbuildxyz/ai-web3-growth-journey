import React from 'react';
import { Upload, Lightbulb, Award, Brain } from 'lucide-react';

interface FeatureSectionProps {
  onUploadClick: () => void;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({ onUploadClick }) => {
  const features = [
    {
      icon: Upload,
      title: '笔记上传',
      description: '支持多种格式上传笔记，包括手机识别、文本输入、语音录入等，智能分析整理，一键上传数字化笔记。',
      color: 'text-indigo-600 bg-indigo-100',
    },
    {
      icon: Lightbulb,
      title: '智能分析',
      description: '运用先进AI技术智能分析笔记内容，自动分类整理，提取关键信息，让您的笔记更有价值。',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      icon: Award,
      title: '资产认证',
      description: '将优质笔记铸造为NFT，实现数字资产化，永久保存在区块链上，为您的知识资产提供价值保障。',
      color: 'text-green-600 bg-green-100',
    },
    {
      icon: Brain,
      title: 'AI 助手',
      description: '智能AI助手全程协助，从内容优化到结构整理，让每一份笔记都成为您的智慧财富。',
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">智能功能，一键完成</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            结合人工智能与区块链技术，为您打造全新的笔记体验
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-200 text-center group">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button
            onClick={onUploadClick}
            className="bg-indigo-600 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            立即上传
          </button>
        </div>
      </div>
    </section>
  );
};