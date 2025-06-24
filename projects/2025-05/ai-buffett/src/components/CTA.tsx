import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();
  const handleFreeTrialClick = () => {
    navigate('/stock-analysis');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-brand-blue to-brand-purple text-white">
      <div className="container px-4 mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">准备好体验AI驱动的投资决策了吗？</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          加入虚拟对冲基金，利用多智能体协同分析，让您的投资决策更加智能、精准
        </p>
        <Button
          onClick={handleFreeTrialClick}
          className="bg-white text-brand-blue hover:bg-gray-100 text-lg px-8 py-6"
        >
          立即免费体验
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <div className="mt-8 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex items-center">
            <div className="rounded-full bg-white/20 p-2 mr-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            </div>
            <span>实时股票分析</span>
          </div>
          <div className="flex items-center">
            <div className="rounded-full bg-white/20 p-2 mr-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            </div>
            <span>智能体协同决策</span>
          </div>
          <div className="flex items-center">
            <div className="rounded-full bg-white/20 p-2 mr-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            </div>
            <span>市场情绪洞察</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
