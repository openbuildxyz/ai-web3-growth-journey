/**
 * Oracle-X 类型定义统一导出文件
 * 
 * 此文件统一导出所有类型定义，便于其他模块导入使用。
 * 
 * @example
 * import { AnalyzeRequest, MarketData, TechnicalIndicators } from '@/types';
 */

export * from './analyze';

// 全局通用类型
export type Direction = 'LONG' | 'SHORT';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

// API 响应通用类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// SSE 流式响应
export interface StreamChunk {
  content: string;
}

export const STREAM_DONE_SIGNAL = '[DONE]';
