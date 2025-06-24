'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { BottomNav } from '../components/navigation/bottom-nav';
import { useMeditationPlayer } from '../../hooks/use-meditation-player';

// export const metadata: Metadata = {
//   title: '冥想精灵 - AI 驱动的个性化冥想体验',
//   description: '通过 AI 生成个性化的冥想引导词，开始您的正念之旅',
// };

export default function HomePage() {
  // 管理冥想设置
  const [duration, setDuration] = useState(10); // 分钟 (5, 10, 15)
  const [mode, setMode] = useState('放松'); // 冥想模式 (放松, 财富, 健康)
  const [posture, setPosture] = useState('躺姿'); // 姿势

  // 音乐播放器
  const { isPlaying, timeRemaining, startMeditation, stopMeditation, formatTime } = useMeditationPlayer();

  // 处理开始冥想按钮点击
  const handleStartMeditation = async () => {
    if (isPlaying) {
      // 如果正在播放，则停止
      stopMeditation();
    } else {
      // 开始冥想
      console.log('开始冥想，设置:', {
        duration,
        mode,
        posture
      });

      try {
        await startMeditation({ mode: mode as '放松' | '财富' | '健康', duration });
      } catch (error) {
        console.error('开始冥想失败:', error);
        alert('播放音乐失败，请检查浏览器音频权限设置');
      }
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: 'linear-gradient(to top, #4a5d2a, #8fa072)'
      }}
    >
      {/* 自然背景纹理 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
        <div className="absolute top-32 right-16 w-24 h-24 bg-white/15 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white/25 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-8 w-28 h-28 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex-1 flex flex-col p-4 pt-12 pb-24">
        {/* 大圆形按钮 */}
        <div className="flex-shrink-0 flex justify-center mb-8">
          <button
            onClick={handleStartMeditation}
            className={`w-48 h-48 rounded-full shadow-2xl transition-all duration-300 transform
                     ${isPlaying
                ? 'bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600'
                : 'bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600'
              } hover:scale-105 active:scale-95
                     border-4 border-white/30 backdrop-blur-sm
                     flex items-center justify-center`}
          >
            <div className="text-center text-white">
              <div className="text-2xl mb-2">
                {isPlaying ? '⏸️' : '🧘‍♀️'}
              </div>
              <div className="text-lg font-medium">
                {isPlaying ? '停止冥想' : '开始冥想'}
              </div>
              <div className="text-sm opacity-90 mt-1">
                {isPlaying
                  ? `剩余 ${formatTime(timeRemaining)}`
                  : `${duration}分钟 · ${mode}`
                }
              </div>
            </div>
          </button>
        </div>

        {/* 设置区域 */}
        <div className="flex-1 space-y-6">

          {/* 设置滑块区域 */}
          <div className="space-y-6">
            {/* 时长设置 - 滑动选择器 */}
            <div className="relative">
              {/* 滑块条 */}
              <div
                className="relative h-12 rounded-full flex items-center cursor-pointer shadow-lg"
                style={{
                  background: 'linear-gradient(to right, #e5e7b3, #d4d6a0, #c3c58d)'
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const width = rect.width
                  if (x < width / 3) setDuration(5)
                  else if (x < width * 2 / 3) setDuration(10)
                  else setDuration(15)
                }}
              >
                {/* 高亮光标 - 在文字下方 */}
                <div
                  className="absolute rounded-full transition-all duration-300 z-10 shadow-xl"
                  style={{
                    width: '32%',
                    height: '36px',
                    left: duration === 5 ? '1%' : duration === 10 ? '34%' : '67%',
                    top: '6px',
                    background: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffd700)',
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.3)'
                  }}
                ></div>

                {/* 文字选项 - 在光标上方 */}
                <div className="absolute inset-0 flex items-center justify-around text-sm font-medium text-stone-700 z-20">
                  <span>5分钟</span>
                  <span>10分钟</span>
                  <span>15分钟</span>
                </div>
              </div>
            </div>

            {/* 冥想模式设置 - 滑动选择器 */}
            <div className="relative">
              {/* 滑块条 */}
              <div
                className="relative h-12 rounded-full flex items-center cursor-pointer shadow-lg"
                style={{
                  background: 'linear-gradient(to right, #e5e7b3, #d4d6a0, #c3c58d)'
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const width = rect.width
                  if (x < width / 3) setMode('放松')
                  else if (x < width * 2 / 3) setMode('财富')
                  else setMode('健康')
                }}
              >
                {/* 高亮光标 - 在文字下方 */}
                <div
                  className="absolute rounded-full transition-all duration-300 z-10 shadow-xl"
                  style={{
                    width: '32%',
                    height: '36px',
                    left: mode === '放松' ? '1%' : mode === '财富' ? '34%' : '67%',
                    top: '6px',
                    background: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffd700)',
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.3)'
                  }}
                ></div>

                {/* 文字选项 - 在光标上方 */}
                <div className="absolute inset-0 flex items-center justify-around text-sm font-medium text-stone-700 z-20">
                  <span>🧘 放松</span>
                  <span>💰 财富</span>
                  <span>💪 健康</span>
                </div>
              </div>
            </div>

            {/* 姿势设置 - 滑动选择器 */}
            <div className="relative">
              {/* 滑块条 */}
              <div
                className="relative h-12 rounded-full flex items-center cursor-pointer shadow-lg"
                style={{
                  background: 'linear-gradient(to right, #e5e7b3, #d4d6a0, #c3c58d)'
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const width = rect.width
                  if (x < width / 3) setPosture('坐姿')
                  else if (x < width * 2 / 3) setPosture('躺姿')
                  else setPosture('站姿')
                }}
              >
                {/* 高亮光标 - 在文字下方 */}
                <div
                  className="absolute rounded-full transition-all duration-300 z-10 shadow-xl"
                  style={{
                    width: '32%',
                    height: '36px',
                    left: posture === '坐姿' ? '1%' : posture === '躺姿' ? '34%' : '67%',
                    top: '6px',
                    background: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffd700)',
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.3)'
                  }}
                ></div>

                {/* 文字选项 - 在光标上方 */}
                <div className="absolute inset-0 flex items-center justify-around text-sm font-medium text-stone-700 z-20">
                  <span>🪑 坐姿</span>
                  <span>🛏️ 躺姿</span>
                  <span>🧍 站姿</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
