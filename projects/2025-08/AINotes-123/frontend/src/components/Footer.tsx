import React from 'react';
import { FileText, Github, MessageCircle, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-indigo-400" />
              <span className="ml-2 text-xl font-bold">AI PLANNER</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              智能笔记管理工具，让记录更有价值
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">产品</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">功能特性</a></li>
              <li><a href="#" className="hover:text-white transition-colors">模板中心</a></li>
              <li><a href="#" className="hover:text-white transition-colors">价格方案</a></li>
              <li><a href="#" className="hover:text-white transition-colors">更新日志</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">资源</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">使用教程</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API 文档</a></li>
              <li><a href="#" className="hover:text-white transition-colors">社区论坛</a></li>
              <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">关注我们</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <HelpCircle className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© 2024 AI PLANNER. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  );
};