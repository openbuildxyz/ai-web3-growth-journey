'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { IntentionSelector } from '../components/features/intention-selector';
import { Button } from '@/components/ui/button';

// export const metadata: Metadata = {
//   title: '冥想精灵 - AI 驱动的个性化冥想体验',
//   description: '通过 AI 生成个性化的冥想引导词，开始您的正念之旅',
// };

export default function HomePage() {
  // 管理用户当前选择的意图
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);

  // 处理开始冥想按钮点击
  const handleStartMeditation = () => {
    if (selectedIntention) {
      // TODO: 这里将在后续的 Story 中实现调用 /api/guidance 的逻辑
      console.log('开始冥想，意图:', selectedIntention);
      alert(`即将开始 "${selectedIntention}" 冥想引导...`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-purple-950 dark:via-blue-950 dark:to-indigo-950">
      {/* 背景装饰元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -left-40 -top-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-100 to-blue-200 dark:from-purple-900 dark:to-blue-800 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-100 to-cyan-200 dark:from-indigo-900 dark:to-cyan-800 rounded-full opacity-30 blur-3xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8">
          {/* 标题区域 */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              冥想精灵
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
              AI 驱动的个性化冥想体验，为您的心灵带来宁静
            </p>
          </div>

          {/* 意图选择器 */}
          <div className="bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <IntentionSelector
              selectedIntention={selectedIntention}
              onSelectIntention={setSelectedIntention}
            />
          </div>

          {/* 开始冥想按钮 */}
          <div className="pt-4">
            <Button
              onClick={handleStartMeditation}
              disabled={!selectedIntention}
              size="lg"
              className="px-8 py-3 text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              {selectedIntention ? '开始冥想' : '请先选择意图'}
            </Button>
          </div>

          {/* 提示文字 */}
          <p className="text-sm text-muted-foreground">
            选择一个意图，让 AI 为您生成专属的冥想引导
          </p>
        </div>
      </div>
    </div>
  );
}
