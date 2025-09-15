import React from 'react';
import { ArrowRight, Shield, Zap } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">开始使用 AI PLANNER</h2>
        <p className="text-xl text-indigo-100 mb-12 max-w-3xl mx-auto">
          让 AI 助手为您管理笔记——每重要笔记
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <div className="flex items-center space-x-3 text-white">
            <Shield className="h-6 w-6 text-green-300" />
            <span className="text-lg">区块链安全保障</span>
          </div>
          <div className="flex items-center space-x-3 text-white">
            <Zap className="h-6 w-6 text-yellow-300" />
            <span className="text-lg">AI 智能处理</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onGetStarted}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <span>免费试用</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-200">
            查看演示
          </button>
        </div>
      </div>
    </section>
  );
};