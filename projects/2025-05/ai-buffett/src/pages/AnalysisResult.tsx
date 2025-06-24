import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StockDemo from '@/components/StockDemo';

const AnalysisResult = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  const stockCode = searchParams.get('stock');
  const analystId = searchParams.get('analyst');

  useEffect(() => {
    // 模拟加载数据
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <main className="pt-24">
        {loading ? (
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="text-2xl font-bold mb-4">正在分析中...</div>
            <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
            <div className="mt-4 text-gray-600">
              AI巴菲特正在分析 {stockCode} 的投资价值
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">
                {stockCode} 分析结果
              </h1>
              <p className="text-gray-600">
                由 AI巴菲特 #{analystId} 提供的专业分析
              </p>
            </div>
            <StockDemo />
          </div>
        )}
      </main>
    </>
  );
};

export default AnalysisResult; 