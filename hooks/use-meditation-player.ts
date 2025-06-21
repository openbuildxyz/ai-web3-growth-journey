'use client';

import { useCallback, useRef, useState } from 'react';

type MeditationMode = '放松' | '财富' | '健康';

interface MeditationPlayerOptions {
    mode: MeditationMode;
    duration: number; // 分钟
}

interface MeditationPlayerState {
    isPlaying: boolean;
    currentTrack: string | null;
    timeRemaining: number; // 秒
}

export function useMeditationPlayer() {
    const [state, setState] = useState<MeditationPlayerState>({
        isPlaying: false,
        currentTrack: null,
        timeRemaining: 0,
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // 音乐文件映射
    const musicFiles = {
        '放松': [
            '/music/relax/M800003DO3Pp2iefME.mp3',
            '/music/relax/M800003tz7Y60VVMmN.mp3',
        ],
        '财富': [
            '/music/finance/M500001RaTqk3aM5a8.mp3',
        ],
        '健康': [
            '/music/health/M800001WRz893KERf3.mp3',
            '/music/health/M5000034ZVgf3JIMcq.mp3',
        ],
    };

    // 随机选择音乐
    const getRandomTrack = useCallback((mode: MeditationMode): string => {
        const tracks = musicFiles[mode];
        const randomIndex = Math.floor(Math.random() * tracks.length);
        return tracks[randomIndex];
    }, []);

    // 开始播放
    const startMeditation = useCallback(async ({ mode, duration }: MeditationPlayerOptions) => {
        try {
            // 停止之前的播放
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            // 清除之前的定时器
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }

            // 选择随机音乐
            const track = getRandomTrack(mode);

            // 创建音频对象
            const audio = new Audio(track);
            audio.loop = true; // 循环播放
            audio.volume = 0.7; // 设置音量

            audioRef.current = audio;

            // 开始播放
            await audio.play();

            const durationInSeconds = duration * 60;

            setState({
                isPlaying: true,
                currentTrack: track,
                timeRemaining: durationInSeconds,
            });

            // 倒计时更新
            countdownRef.current = setInterval(() => {
                setState(prev => {
                    const newTimeRemaining = prev.timeRemaining - 1;
                    if (newTimeRemaining <= 0) {
                        return prev; // 让定时器处理停止逻辑
                    }
                    return {
                        ...prev,
                        timeRemaining: newTimeRemaining,
                    };
                });
            }, 1000);

            // 设置定时停止
            timerRef.current = setTimeout(() => {
                stopMeditation();
            }, durationInSeconds * 1000);

        } catch (error) {
            console.error('播放音乐失败:', error);
            setState({
                isPlaying: false,
                currentTrack: null,
                timeRemaining: 0,
            });
        }
    }, [getRandomTrack]);

    // 停止播放
    const stopMeditation = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        setState({
            isPlaying: false,
            currentTrack: null,
            timeRemaining: 0,
        });
    }, []);

    // 格式化时间显示
    const formatTime = useCallback((seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    return {
        ...state,
        startMeditation,
        stopMeditation,
        formatTime,
    };
}