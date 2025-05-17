import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Frown, TrendingUp, TrendingDown, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// 模拟数据
const mockStockData = {
  "AAPL": {
    name: "苹果公司",
    price: 187.42,
    change: 1.23,
    changePercent: 0.66,
    recommendation: "买入",
    sentiment: "乐观",
    technical: "上升趋势",
    fundamental: "强劲财务",
    volume: "5.7M",
    pe: 28.4,
    chart: [120, 132, 101, 134, 90, 130, 110, 120, 132, 101, 134, 90, 130, 110, 120, 132, 101, 134, 90],
  },
  "TSLA": {
    name: "特斯拉",
    price: 248.14,
    change: -3.86,
    changePercent: -1.53,
    recommendation: "持有",
    sentiment: "中性",
    technical: "横盘整理",
    fundamental: "增长放缓",
    volume: "8.2M",
    pe: 42.1,
    chart: [90, 130, 110, 120, 132, 101, 134, 90, 130, 110, 80, 120, 132, 101, 134, 90, 130, 110, 90],
  },
  "BABA": {
    name: "阿里巴巴",
    price: 75.32,
    change: -2.13,
    changePercent: -2.75,
    recommendation: "卖出",
    sentiment: "悲观",
    technical: "下降趋势",
    fundamental: "面临挑战",
    volume: "3.8M",
    pe: 15.2,
    chart: [134, 120, 110, 100, 90, 85, 80, 85, 90, 85, 80, 75, 70, 75, 70, 65, 60, 50, 45],
  },
};

const recommendationColors = {
  "买入": "text-green-600",
  "持有": "text-yellow-600",
  "卖出": "text-red-600"
};

const StockDemo = () => {
  const [stockCode, setStockCode] = useState("");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    setLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      if (mockStockData[stockCode.toUpperCase()]) {
        setStockData(mockStockData[stockCode.toUpperCase()]);
        setLoading(false);
      } else {
        toast({
          title: "未找到股票",
          description: "请输入有效的股票代码，如AAPL、TSLA或BABA",
          variant: "destructive",
        });
        setLoading(false);
      }
    }, 800);
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "乐观":
        return <Smile className="h-6 w-6 text-green-500" />;
      case "悲观":
        return <Frown className="h-6 w-6 text-red-500" />;
      default:
        return <div className="h-6 w-6 rounded-full border-2 border-yellow-500"></div>;
    }
  };

  const getTrendIcon = (trend) => {
    if (trend.includes("上升")) {
      return <TrendingUp className="h-6 w-6 text-green-500" />;
    } else if (trend.includes("下降")) {
      return <TrendingDown className="h-6 w-6 text-red-500" />;
    } else {
      return <div className="h-1 w-6 bg-yellow-500 my-3"></div>;
    }
  };

  return (
    <section id="demo" className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">体验AI投资建议</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            输入股票代码，获取由多个AI智能体协同分析的投资建议
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-12">
          <div className="flex w-full max-w-xl items-center space-x-2">
            <Input
              type="text"
              placeholder="输入股票代码 (如: AAPL, TSLA, BABA)"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              className="text-lg py-6"
            />
            <Button 
              onClick={handleSearch} 
              className="bg-brand-blue hover:bg-blue-700 text-white py-6"
              disabled={loading || !stockCode}
            >
              {loading ? "分析中..." : "查询"}
            </Button>
          </div>
        </div>

        {stockData && (
          <div className="animate-slide-up">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">{stockData.name} ({stockCode.toUpperCase()})</h3>
                  <div className="text-3xl font-bold mt-2">${stockData.price}</div>
                  <div className={`text-lg ${stockData.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stockData.change > 0 ? '+' : ''}{stockData.change} ({stockData.changePercent}%)
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <div className="text-xl font-bold mb-2">AI推荐</div>
                  <div className={`text-3xl font-bold ${recommendationColors[stockData.recommendation]}`}>
                    {stockData.recommendation}
                  </div>
                </div>
              </div>

              <div className="h-40 bg-gray-100 rounded-lg mb-6 p-4 flex items-end">
                {stockData.chart.map((value, index) => (
                  <div 
                    key={index}
                    className={`w-full h-${Math.max(1, Math.floor(value / 5))} 
                      ${stockData.recommendation === "买入" ? "bg-green-500" : 
                        stockData.recommendation === "卖出" ? "bg-red-500" : "bg-yellow-500"} 
                      mx-0.5 rounded-t-sm`}
                    style={{height: `${value}px`}}
                  ></div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card className="border-2 border-brand-yellow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>情绪分析</CardTitle>
                      {getSentimentIcon(stockData.sentiment)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{stockData.sentiment}</div>
                    <p className="text-sm text-gray-600 mt-2">
                      基于社交媒体和新闻分析，当前市场情绪{stockData.sentiment === "乐观" ? "积极" : stockData.sentiment === "悲观" ? "消极" : "平稳"}。
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-brand-red">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>技术分析</CardTitle>
                      {getTrendIcon(stockData.technical)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{stockData.technical}</div>
                    <p className="text-sm text-gray-600 mt-2">
                      基于价格走势和技术指标分析，股票呈现{stockData.technical}。
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-brand-green">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>基本面分析</CardTitle>
                      <Database className="h-6 w-6 text-brand-green" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{stockData.fundamental}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">PE比率:</span> {stockData.pe}
                      </div>
                      <div>
                        <span className="text-gray-500">成交量:</span> {stockData.volume}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 text-center">
                <div className="text-gray-600 mb-2">这个建议对您有帮助吗？</div>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" className="flex items-center">
                    <Smile className="mr-1 h-4 w-4" /> 有帮助
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <Frown className="mr-1 h-4 w-4" /> 待改进
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!stockData && !loading && (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-xl text-gray-500 mb-4">输入股票代码获取分析结果</div>
            <div className="text-gray-400">示例股票代码: AAPL, TSLA, BABA</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StockDemo;
