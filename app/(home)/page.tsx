'use client';

import { useState } from 'react';
import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: '冥想精灵 - AI 驱动的个性化冥想体验',
//   description: '通过 AI 生成个性化的冥想引导词，开始您的正念之旅',
// };

export default function HomePage() {
  // 管理冥想设置
  const [duration, setDuration] = useState(10); // 分钟 (5, 10, 15)
  const [mode, setMode] = useState('放松'); // 冥想模式 (放松, 财富, 健康)
  const [posture, setPosture] = useState('躺姿'); // 姿势

  // 处理开始冥想按钮点击
  const handleStartMeditation = () => {
    // TODO: 这里将在后续的 Story 中实现调用 /api/guidance 的逻辑
    console.log('开始冥想，设置:', {
      duration,
      mode,
      posture
    });
    alert(`即将开始 "${mode}" 冥想引导...\n时长: ${duration}分钟\n模式: ${mode}\n姿势: ${posture}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 via-green-50 to-emerald-100 dark:from-stone-900 dark:via-green-950 dark:to-emerald-950">
      {/* 自然背景纹理 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-200 dark:bg-green-800 rounded-full blur-2xl" />
        <div className="absolute top-32 right-16 w-24 h-24 bg-amber-200 dark:bg-amber-800 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-emerald-200 dark:bg-emerald-800 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-8 w-28 h-28 bg-yellow-200 dark:bg-yellow-800 rounded-full blur-xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex-1 flex flex-col p-4 pt-12">
        {/* 大圆形按钮 */}
        <div className="flex-shrink-0 flex justify-center mb-8">
          <button
            onClick={handleStartMeditation}
            className="w-48 h-48 rounded-full shadow-2xl transition-all duration-300 transform
                     bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 hover:scale-105 active:scale-95
                     border-4 border-white/30 backdrop-blur-sm
                     flex items-center justify-center"
          >
            <div className="text-center text-white">
              <div className="text-2xl mb-2">🧘‍♀️</div>
              <div className="text-lg font-medium">开始冥想</div>
              <div className="text-sm opacity-90 mt-1">{duration}分钟 · {mode}</div>
            </div>
          </button>
        </div>

        {/* 设置区域 */}
        <div className="flex-1 space-y-6">

          {/* 设置滑块区域 */}
          <div className="space-y-4">
            {/* 时长设置 - 滑动选择器 */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">时长</span>
                <span className="text-sm text-stone-600 dark:text-stone-400">{duration} 分钟</span>
              </div>

              <div className="relative">
                <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                </div>

                <div className="relative bg-green-100 dark:bg-green-800 h-6 rounded-full flex items-center">
                  {/* 分隔线 */}
                  <div className="absolute left-1/3 top-1/2 transform -translate-y-1/2 w-px h-3 bg-stone-300 dark:bg-stone-600"></div>
                  <div className="absolute left-2/3 top-1/2 transform -translate-y-1/2 w-px h-3 bg-stone-300 dark:bg-stone-600"></div>

                  {/* 滑动按钮 */}
                  <div
                    className="absolute w-5 h-5 bg-green-500 rounded-full shadow-md transition-all duration-300 cursor-pointer"
                    style={{
                      left: duration === 5 ? '2px' : duration === 10 ? 'calc(50% - 10px)' : 'calc(100% - 22px)'
                    }}
                  ></div>

                  {/* 点击区域 */}
                  <div
                    className="w-full h-full cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const width = rect.width
                      if (x < width / 3) setDuration(5)
                      else if (x < width * 2 / 3) setDuration(10)
                      else setDuration(15)
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 冥想模式设置 - 滑动选择器 */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">冥想模式</span>
                <span className="text-sm text-stone-600 dark:text-stone-400">{mode}</span>
              </div>

              <div className="relative">
                <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                  <span>放松</span>
                  <span>财富</span>
                  <span>健康</span>
                </div>

                <div className="relative bg-green-100 dark:bg-green-800 h-6 rounded-full flex items-center">
                  {/* 分隔线 */}
                  <div className="absolute left-1/3 top-1/2 transform -translate-y-1/2 w-px h-3 bg-stone-300 dark:bg-stone-600"></div>
                  <div className="absolute left-2/3 top-1/2 transform -translate-y-1/2 w-px h-3 bg-stone-300 dark:bg-stone-600"></div>

                  {/* 滑动按钮 */}
                  <div
                    className="absolute w-5 h-5 bg-green-500 rounded-full shadow-md transition-all duration-300 cursor-pointer"
                    style={{
                      left: mode === '放松' ? '2px' : mode === '财富' ? 'calc(50% - 10px)' : 'calc(100% - 22px)'
                    }}
                  ></div>

                  {/* 点击区域 */}
                  <div
                    className="w-full h-full cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const width = rect.width
                      if (x < width / 3) setMode('放松')
                      else if (x < width * 2 / 3) setMode('财富')
                      else setMode('健康')
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 姿势设置 - 滑动选择器 */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">姿势</span>
                <span className="text-sm text-stone-600 dark:text-stone-400">{posture}</span>
              </div>

              <div className="relative">
                <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                  <span>坐姿</span>
                  <span>躺姿</span>
                  <span>站姿</span>
                </div>

                <div className="relative bg-green-100 dark:bg-green-800 h-6 rounded-full flex items-center">
                  {/* 分隔线 */}
                  <div className="absolute left-1/3 top-1/2 transform -translate-y-1/2 w-px h-3 bg-stone-300 dark:bg-stone-600"></div>
                  <div className="absolute left-2/3 top-1/2 transform -translate-y-1/2 w-px h-3 bg-stone-300 dark:bg-stone-600"></div>

                  {/* 滑动按钮 */}
                  <div
                    className="absolute w-5 h-5 bg-green-500 rounded-full shadow-md transition-all duration-300 cursor-pointer"
                    style={{
                      left: posture === '坐姿' ? '2px' : posture === '躺姿' ? 'calc(50% - 10px)' : 'calc(100% - 22px)'
                    }}
                  ></div>

                  {/* 点击区域 */}
                  <div
                    className="w-full h-full cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const width = rect.width
                      if (x < width / 3) setPosture('坐姿')
                      else if (x < width * 2 / 3) setPosture('躺姿')
                      else setPosture('站姿')
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
