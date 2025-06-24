import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';

const StockAnalysis = () => {
  const [stockCode, setStockCode] = useState('');
  const [selectedAnalyst, setSelectedAnalyst] = useState<number | null>(null);
  const navigate = useNavigate();

  const analysts = [
    { id: 1, name: '巴菲特' },
    { id: 2, name: '巴菲特' },
    { id: 3, name: '巴菲特' },
    { id: 4, name: '巴菲特' },
    { id: 5, name: '巴菲特' },
  ];

  const handleStartAnalysis = () => {
    // 可以在这里添加验证逻辑
    if (stockCode && selectedAnalyst !== null) {
      // 将选择的股票代码和分析师信息传递到下一个页面或进行API调用
      navigate(`/analysis-result?stock=${stockCode}&analyst=${selectedAnalyst}`);
    }
  };

  return (
    <>
      <main className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="w-full max-w-xl">
            <Input
              type="text"
              placeholder="输入股票代码/公司名称/货币名称"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              className="w-full py-6 text-center text-lg mb-12 border-2 border-gray-300 rounded-lg"
            />
            
            <div className="text-center mb-8">
              <h3 className="text-lg font-medium text-gray-700">选择你的个人顶级分析师</h3>
            </div>
            
            <div className="grid grid-cols-5 gap-4 mb-12">
              {analysts.map((analyst) => (
                <div 
                  key={analyst.id}
                  className={`flex flex-col items-center cursor-pointer`}
                  onClick={() => setSelectedAnalyst(analyst.id)}
                >
                  <div 
                    className={`border-2 rounded-lg p-4 mb-2 w-full text-center
                      ${selectedAnalyst === analyst.id 
                        ? 'border-blue-500 text-blue-500' 
                        : 'border-gray-300 text-gray-700'}`}
                  >
                    {analyst.name}
                  </div>
                  <span className="text-sm text-gray-500">{analyst.name}</span>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleStartAnalysis}
              disabled={!stockCode || selectedAnalyst === null}
              className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600 rounded-lg"
            >
              开始分析
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default StockAnalysis; 