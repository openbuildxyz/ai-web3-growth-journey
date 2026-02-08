'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import type { KlineData } from '../hooks/useBinanceKlines';
import styles from './KlineChart.module.css';

interface KlineChartProps {
  klines: KlineData[];
  loading?: boolean;
}

export default function KlineChart({ klines, loading }: KlineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // 初始化图表
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#0d1117' },
        textColor: '#8b949e',
      },
      grid: {
        vertLines: { color: '#1c2128' },
        horzLines: { color: '#1c2128' },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: '#30363d',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#30363d',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    // K线序列 (v5 API)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#3fb68b',
      downColor: '#ff5353',
      borderUpColor: '#3fb68b',
      borderDownColor: '#ff5353',
      wickUpColor: '#3fb68b',
      wickDownColor: '#ff5353',
    });

    // 成交量序列 (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // 响应式
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // 更新数据
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || klines.length === 0) return;

    const candleData: CandlestickData[] = klines.map(k => ({
      time: k.time as unknown as CandlestickData['time'],
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    }));

    const volumeData: HistogramData[] = klines.map(k => ({
      time: k.time as unknown as HistogramData['time'],
      value: k.volume,
      color: k.close >= k.open ? 'rgba(63, 182, 139, 0.5)' : 'rgba(255, 83, 83, 0.5)',
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    // 自适应显示
    chartRef.current?.timeScale().fitContent();
  }, [klines]);

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loading}>
          <span>加载中...</span>
        </div>
      )}
      <div ref={containerRef} className={styles.chart} />
    </div>
  );
}
