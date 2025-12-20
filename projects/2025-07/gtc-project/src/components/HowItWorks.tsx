import React from 'react';
import { Card } from '@/components/ui/card';
import { Upload, Brain, Shield, Gift } from 'lucide-react';

const steps = [
  {
    icon: <Upload className="w-8 h-8" />,
    title: "上传足迹",
    description: "拍摄并上传你的环保行为照片，添加简单描述",
    color: "bg-gradient-primary",
    step: "01"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "AI 分析",
    description: "智能AI系统自动识别和评估你的绿色行为价值",
    color: "bg-accent",
    step: "02"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "社区验证",
    description: "经过社区成员和专家的双重验证确保真实性",
    color: "bg-secondary",
    step: "03"
  },
  {
    icon: <Gift className="w-8 h-8" />,
    title: "获得奖励",
    description: "验证通过后自动获得相应的GTC代币奖励",
    color: "bg-gradient-gold",
    step: "04"
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-poppins font-bold text-foreground mb-4">
            工作原理
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            四个简单步骤，让你的环保行为转化为实际价值
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="p-8 text-center relative transition-smooth hover:shadow-glow border-border/50">
              {/* Step number */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                {step.step}
              </div>
              
              {/* Icon */}
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${step.color}`}>
                <div className="text-white">
                  {step.icon}
                </div>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-poppins font-semibold text-foreground mb-4">
                {step.title}
              </h3>
              <p className="text-muted-foreground font-inter leading-relaxed">
                {step.description}
              </p>
              
              {/* Arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-border"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-border border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};