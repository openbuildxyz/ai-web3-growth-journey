'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// K线数据类型
export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 市场数据类型
export interface MarketStats {
  price: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
}

// Hook 返回类型
export interface UseBinanceKlinesReturn {
  klines: KlineData[];
  stats: MarketStats;
  loading: boolean;
  connected: boolean;
  error: string | null;
  usingMock: boolean;
}

type BinanceKline = [number, string, string, string, string, string, number, string, number, string, string, string];

interface BinanceWsKline {
  e: string;
  k: {
    t: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    x: boolean;
  };
}

interface BinanceWsTicker {
  e: string;
  c: string;
  P: string;
  h: string;
  l: string;
  q: string;
}

// 使用本地代理
const API_BASE = '/api';
const WS_URL = 'wss://stream.binance.com:9443/stream';

// Mock 数据生成
const generateMockKlines = (symbol: string, limit: number): KlineData[] => {
  const klines: KlineData[] = [];
  let price = symbol.startsWith('BTC') ? 97000 : symbol.startsWith('ETH') ? 3800 : 200;
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = limit; i > 0; i--) {
    const time = now - i * 3600;
    const change = (Math.random() - 0.5) * price * 0.02;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;
    
    klines.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000 + 500,
    });
    price = close;
  }
  return klines;
};

export function useBinanceKlines(
  symbol: string,
  interval: string = '1h',
  limit: number = 100
): UseBinanceKlinesReturn {
  const [klines, setKlines] = useState<KlineData[]>([]);
  const [stats, setStats] = useState<MarketStats>({
    price: '0',
    change24h: '0',
    high24h: '0',
    low24h: '0',
    volume24h: '0',
  });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 格式化功能
  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) return (volume / 1e9).toFixed(1) + 'B';
    if (volume >= 1e6) return (volume / 1e6).toFixed(1) + 'M';
    if (volume >= 1e3) return (volume / 1e3).toFixed(1) + 'K';
    return volume.toFixed(0);
  };

  const transformKline = useCallback((kline: BinanceKline): KlineData => ({
    time: Math.floor(kline[0] / 1000),
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
    volume: parseFloat(kline[5]),
  }), []);

  // 启用 Mock 模式
  const enableMockMode = useCallback(() => {
    console.log('Switching to Mock Mode...');
    setUsingMock(true);
    setError(null); // 清除错误，因为 Mock 是预期的回退
    setConnected(true); // 模拟连接状态

    // 初始 Mock 数据
    const mocks = generateMockKlines(symbol, limit);
    setKlines(mocks);
    const last = mocks[mocks.length - 1];
    setStats({
      price: last.close.toFixed(2),
      change24h: ((Math.random() - 0.5) * 5).toFixed(2),
      high24h: (last.high * 1.05).toFixed(2),
      low24h: (last.low * 0.95).toFixed(2),
      volume24h: '1.2B',
    });

    // 模拟实时更新
    if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    mockIntervalRef.current = setInterval(() => {
      setKlines(prev => {
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * last.close * 0.005;
        const newClose = last.close + change;
        const newHigh = Math.max(last.high, newClose);
        const newLow = Math.min(last.low, newClose);
        
        // 更新最后一根 K 线
        const updatedLast = {
          ...last,
          close: newClose,
          high: newHigh,
          low: newLow,
          volume: last.volume + Math.random() * 10
        };
        
        // 更新统计
        setStats(s => ({ ...s, price: newClose.toFixed(2) }));
        
        return [...prev.slice(0, -1), updatedLast];
      });
    }, 1000);

    setLoading(false);
  }, [symbol, limit]);

  // 获取数据 (REST via Proxy)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. 获取 K 线
      const klinesRes = await fetch(`${API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
      if (!klinesRes.ok) throw new Error('API Error');
      
      const klinesData: BinanceKline[] = await klinesRes.json();
      setKlines(klinesData.map(transformKline));

      // 2. 获取 Ticker
      const tickerRes = await fetch(`${API_BASE}/ticker?symbol=${symbol}`);
      if (tickerRes.ok) {
        const ticker = await tickerRes.json();
        setStats({
          price: parseFloat(ticker.lastPrice).toFixed(2),
          change24h: parseFloat(ticker.priceChangePercent).toFixed(2),
          high24h: parseFloat(ticker.highPrice).toFixed(2),
          low24h: parseFloat(ticker.lowPrice).toFixed(2),
          volume24h: formatVolume(parseFloat(ticker.quoteVolume)),
        });
      }

      setLoading(false);
      setUsingMock(false); // 成功获取数据，关闭 Mock
    } catch (err) {
      console.warn('Fetch failed, falling back to mock:', err);
      enableMockMode();
    }
  }, [symbol, interval, limit, transformKline, enableMockMode]);

  // WebSocket 连接
  const connectWebSocket = useCallback(() => {
    if (usingMock) return; // 如果已经在 Mock 模式，不再尝试 WS

    if (wsRef.current) wsRef.current.close();

    try {
      const streamName = `${symbol.toLowerCase()}@kline_${interval}/${symbol.toLowerCase()}@ticker`;
      const ws = new WebSocket(`${WS_URL}?streams=${streamName}`);

      ws.onopen = () => setConnected(true);
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const data = message.data;

          if (data.e === 'kline') {
            const k = (data as BinanceWsKline).k;
            const newKline: KlineData = {
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            };

            setKlines(prev => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (lastIdx >= 0 && updated[lastIdx].time === newKline.time) {
                updated[lastIdx] = newKline;
              } else if (k.x) {
                updated.push(newKline);
                if (updated.length > limit) updated.shift();
              }
              return updated;
            });
            
            setStats(s => ({ ...s, price: parseFloat(k.c).toFixed(2) }));
          }

          if (data.e === '24hrTicker') {
            const t = data as BinanceWsTicker;
            setStats(s => ({
              ...s,
              price: parseFloat(t.c).toFixed(2),
              change24h: parseFloat(t.P).toFixed(2),
              high24h: parseFloat(t.h).toFixed(2),
              low24h: parseFloat(t.l).toFixed(2),
              volume24h: formatVolume(parseFloat(t.q)),
            }));
          }
        } catch { /* ignore */ }
      };

      ws.onerror = () => {
        console.warn('WS Error, falling back to mock mode');
        enableMockMode();
      };

      wsRef.current = ws;
    } catch {
      enableMockMode();
    }
  }, [symbol, interval, limit, usingMock, enableMockMode]);

  // 初始化
  useEffect(() => {
    fetchData();
    // 延迟连接 WS，等待 REST 结果（如果 REST 失败会直接进 Mock）
    const wsTimer = setTimeout(() => {
      if (!useBinanceKlines.mocked) { // 简单防抖标志
        connectWebSocket();
      }
    }, 1000);

    return () => {
      clearTimeout(wsTimer);
      if (wsRef.current) wsRef.current.close();
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    };
  }, [fetchData, connectWebSocket]);

  return { klines, stats, loading, connected, error, usingMock };
}

// 静态标志位，防止重复 Mock 初始化
useBinanceKlines.mocked = false;
