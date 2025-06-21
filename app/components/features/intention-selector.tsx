'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface IntentionSelectorProps {
    onSelectIntention: (intention: string | null) => void;
    selectedIntention: string | null;
}

/**
 * 获取意图列表的 API 调用函数
 */
async function fetchIntentions(): Promise<string[]> {
    const response = await fetch('/api/intentions');

    if (!response.ok) {
        throw new Error('Failed to fetch intentions');
    }

    return response.json();
}

/**
 * IntentionSelector 组件
 * 负责获取并展示意图列表，处理用户的点击选择
 */
export function IntentionSelector({
    onSelectIntention,
    selectedIntention
}: IntentionSelectorProps) {
    // 使用 useQuery 获取意图列表
    const {
        data: intentions,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['intentions'],
        queryFn: fetchIntentions,
    });

    // 处理意图选择
    const handleIntentionClick = (intention: string) => {
        if (selectedIntention === intention) {
            // 如果点击的是已选中的意图，则取消选择
            onSelectIntention(null);
        } else {
            // 否则选择新的意图
            onSelectIntention(intention);
        }
    };

    // 加载状态
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">加载意图列表...</span>
            </div>
        );
    }

    // 错误状态
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-sm text-destructive mb-2">
                    加载意图失败，请稍后重试
                </p>
                <p className="text-xs text-muted-foreground">
                    {error instanceof Error ? error.message : '未知错误'}
                </p>
            </div>
        );
    }

    // 成功状态 - 渲染意图按钮列表
    return (
        <div className="space-y-4">
            <h2 className="text-base font-medium text-center text-stone-700 dark:text-stone-300">选择冥想意图</h2>
            <div className="space-y-2">
                {intentions?.map((intention) => (
                    <Button
                        key={intention}
                        variant={selectedIntention === intention ? 'default' : 'outline'}
                        onClick={() => handleIntentionClick(intention)}
                        className={`
              w-full h-12 text-sm font-medium transition-all duration-200 rounded-xl
              ${selectedIntention === intention
                                ? 'bg-green-500 hover:bg-green-600 text-white border-green-500 shadow-md'
                                : 'bg-white/80 dark:bg-black/40 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700'
                            }
            `}
                    >
                        {intention}
                    </Button>
                ))}
            </div>
            {selectedIntention && (
                <p className="text-center text-xs text-stone-500 dark:text-stone-400">
                    已选择：<span className="font-medium text-green-600 dark:text-green-400">{selectedIntention}</span>
                </p>
            )}
        </div>
    );
} 