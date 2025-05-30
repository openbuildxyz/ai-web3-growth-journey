import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Footer = () => {
  const navigate = useNavigate();
  const handleFreeTrialClick = () => {
    navigate('/stock-analysis');
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AI Buffett</h3>
            <p className="text-gray-400">
              由多个AI智能体协同工作的虚拟对冲基金，为您提供精准的投资决策建议。
            </p>
            <Button 
              onClick={handleFreeTrialClick}
              className="mt-4 bg-brand-blue hover:bg-blue-700 text-white"
            >
              立即免费体验
            </Button>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">产品</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">功能介绍</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">价格方案</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">技术支持</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">资源</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">投资指南</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">市场分析</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">技术白皮书</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">联系我们</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">邮箱: *********@gmai.com</li>
              <li className="text-gray-400">电话: *********</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between">
          <div className="text-gray-400 mb-4 md:mb-0">
            © 2025 AI Buffett. 保留所有权利。
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">隐私政策</a>
            <a href="#" className="text-gray-400 hover:text-white">服务条款</a>
            <a href="#" className="text-gray-400 hover:text-white">法律声明</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
