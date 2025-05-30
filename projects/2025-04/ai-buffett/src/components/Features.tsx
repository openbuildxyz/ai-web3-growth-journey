
import React from 'react';
import { ChartBar, Database, TrendingUp, Users } from "lucide-react";

const features = [
  {
    title: "多智能体协作",
    description: "多个专精不同领域的AI智能体共同分析，综合判断，提供全方位投资建议。",
    icon: <Users className="h-8 w-8 text-brand-blue" />
  },
  {
    title: "实时数据分析",
    description: "持续监控市场变化，实时更新数据，确保决策建议基于最新市场状况。",
    icon: <Database className="h-8 w-8 text-brand-green" />
  },
  {
    title: "技术面分析",
    description: "通过先进算法分析数字货币/股票/金融产品价格走势、成交量等技术指标，预测价格变动。",
    icon: <ChartBar className="h-8 w-8 text-brand-red" />
  },
  {
    title: "情绪市场分析",
    description: "实时分析社交媒体、新闻报道中的市场情绪，把握投资心理变化。",
    icon: <TrendingUp className="h-8 w-8 text-brand-purple" />
  }
];

const Features = () => {
  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">强大功能，智慧决策</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            通过多重智能分析，提供全方位投资建议，助您轻松决策
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md transition-all hover:shadow-lg animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
