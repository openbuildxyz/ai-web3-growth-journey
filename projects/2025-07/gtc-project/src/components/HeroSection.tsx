import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';
import heroImage from '@/assets/hero-image.jpg';

export const HeroSection = () => {
  const { address } = useAccount();
  
  const geminiPrompt = `[System]
你是一名“环境影响图像审核官”。你的任务是判断图片中的核心行为是“增碳行为”还是“减碳行为”。

**判断规则**:
1. **减碳行为 (\`false\`)**: 相比常规方式，该行为能显著降低碳排放。这包括**零排放活动**（如步行）和**低碳选择**（如乘坐公共交通、垃圾分类、使用节能电器）。
2. **增碳行为 (\`true\`)**: 该行为直接或间接导致较高的碳排放。例如，驾驶私家车、工业排放、设备能耗、浪费行为。

**输出规范**:
1. **只返回纯 JSON 格式**，不要包含任何额外文字。
2. 输出字段必须与模板完全一致。

**JSON 输出模板**:
{
 "is_carbon_increasing": true, // 判断结果：true 代表“增碳”，false 代表“减碳”
 "confidence": 0.00, // 模型对图片内容识别的把握度（0.0 - 1.0）
 "description": "" // 20 字以内的简短中文判断依据
}

---
**示例 1：(减碳)**
输入图片：公交车内部
输出：
{
 "is_carbon_increasing": false,
 "confidence": 0.95,
 "description": "乘坐公共交通，属于低碳出行。"
}

---
**示例 2：(增碳)**
输入图片：健身房跑步机
输出：
{
 "is_carbon_increasing": true,
 "confidence": 0.88,
 "description": "电动设备运行消耗电力，间接增碳。"
}

---
**示例 3：(无法判断)**
输入图片：模糊不清的照片
输出：
{
 "is_carbon_increasing": false, // 或 true，此时不重要
 "confidence": 0.25,
 "description": "图片模糊，无法识别。"
}

[User]
请使用上面的 JSON 模板、判断规则和输出规范，分析下方图片并回答：`;
  // const ai = new GoogleGenAI({});
  const upload = () => {
    console.log(address);
    // 创建隐藏的文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // 只接受图片文件
    input.style.display = 'none';
    
    // 监听文件选择
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        fetch('http://localhost:3000/mint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ address:"FEmJLgCCrSacc993xqQbtB9mktA5ad4QYwjHZCr6XApf", amount: 1 })
        });
        // 转换为base64
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          const a = base64.split(',')[1]
          const requestBody = {
            contents: [
              {
                parts: [
                  {
                    text: geminiPrompt,
                  },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: a,
                    },
                  },
                ],
              },
            ],
          };
    
          // 3. 直接从前端调用 Google API
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBg-g1JCExefMHSbHGhDA8VP0LdOW0nuAo`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            }
          );
          const data = await response.json();
          const res = data.candidates[0].content.parts[0].text
          const json = JSON.parse(res)
          console.log(json)

          
        };
        reader.readAsDataURL(file);
      }
    };
    
    // 触发文件选择对话框
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  return (
    <section className="min-h-screen flex items-center py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-poppins font-bold text-foreground leading-tight">
                你的每一次环保，
                <br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  都价值连城
                </span>
              </h1>
              <p className="text-xl text-muted-foreground font-inter leading-relaxed">
                上传你的绿色足迹，赚取 GTC 代币，共同建设可持续的未来。
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="gap-3 text-lg px-8 py-6" onClick={upload}>
                <Upload className="w-5 h-5" />
                立即上传我的善举
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6">
                了解更多
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-poppins font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">活跃用户</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-poppins font-bold text-primary">50,000+</div>
                <div className="text-sm text-muted-foreground">已验证足迹</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-poppins font-bold text-primary">1,200+</div>
                <div className="text-sm text-muted-foreground">减少碳排放(吨)</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="环保行为 - 种植树木" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold animate-bounce">
              <span className="text-2xl">🌱</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse">
              <span className="text-xl">💚</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};