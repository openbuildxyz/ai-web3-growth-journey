'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
    children: ReactNode;
}

/**
 * QueryProvider 组件
 * 为整个应用提供 TanStack Query 的 QueryClient 实例
 * 按照 Next.js App Router 的推荐方式实现
 */
export function QueryProvider({ children }: QueryProviderProps) {
    // 使用 useState 确保 QueryClient 实例在组件生命周期内保持稳定
    const [queryClient] = useState(
        () => new QueryClient({
            defaultOptions: {
                queries: {
                    // 设置默认的查询选项
                    staleTime: 1000 * 60 * 5, // 5 分钟后数据变为 stale
                    gcTime: 1000 * 60 * 10, // 10 分钟后清理缓存
                    retry: 1, // 失败时重试 1 次
                    refetchOnWindowFocus: false, // 窗口获得焦点时不自动重新获取
                },
                mutations: {
                    // 设置默认的 mutation 选项
                    retry: 0, // mutation 失败时不重试
                },
            },
        })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
} 