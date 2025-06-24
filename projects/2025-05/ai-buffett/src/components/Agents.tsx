
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Smile, TrendingUp, Database, ArrowRight } from "lucide-react";

const agents = [
  {
    name: "情绪分析智能体",
    description: "分析社交媒体、新闻和市场评论，判断市场情绪走向",
    icon: <Smile className="h-12 w-12 text-brand-yellow" />,
    color: "bg-brand-yellow/10",
    borderColor: "border-brand-yellow"
  },
  {
    name: "技术分析智能体",
    description: "通过历史价格走势、交易量和技术指标预测未来走势",
    icon: <TrendingUp className="h-12 w-12 text-brand-red" />,
    color: "bg-brand-red/10",
    borderColor: "border-brand-red"
  },
  {
    name: "基本面分析智能体",
    description: "分析公司财报、行业数据和经济指标，评估企业内在价值",
    icon: <Database className="h-12 w-12 text-brand-green" />,
    color: "bg-brand-green/10",
    borderColor: "border-brand-green"
  }
];

const Agents = () => {
  return (
    <section id="agents" className="py-16">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">智能体协同工作模式</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            每个智能体专注于特定领域分析，通过协作产生全面的投资决策
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          {agents.map((agent, index) => (
            <Card key={index} className={`w-full md:w-80 border-2 ${agent.borderColor} ${agent.color} transition-all hover:shadow-lg`}>
              <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                <div className="rounded-full p-4 bg-white shadow-md">
                  {agent.icon}
                </div>
                <h3 className="text-xl font-bold">{agent.name}</h3>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">{agent.description}</p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">数据收集</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">深度分析</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm">生成洞见</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 bg-gray-100 rounded-xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">智能体协作流程</h3>
            <p className="text-gray-600">多个智能体如何协同工作生成投资决策</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:space-x-8 space-y-8 md:space-y-0">
            <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/4 text-center">
              <div className="rounded-full bg-brand-blue/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-brand-blue">1</span>
              </div>
              <h4 className="font-semibold">数据收集</h4>
              <p className="text-sm text-gray-600">实时收集市场数据、新闻和社交媒体信息</p>
            </div>
            
            <div className="hidden md:block text-brand-blue">
              <ArrowRight className="h-8 w-8" />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/4 text-center">
              <div className="rounded-full bg-brand-green/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-brand-green">2</span>
              </div>
              <h4 className="font-semibold">智能体分析</h4>
              <p className="text-sm text-gray-600">每个智能体独立进行专业领域分析</p>
            </div>
            
            <div className="hidden md:block text-brand-blue">
              <ArrowRight className="h-8 w-8" />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/4 text-center">
              <div className="rounded-full bg-brand-purple/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-brand-purple">3</span>
              </div>
              <h4 className="font-semibold">结果整合</h4>
              <p className="text-sm text-gray-600">综合各智能体意见，形成统一投资建议</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Agents;
