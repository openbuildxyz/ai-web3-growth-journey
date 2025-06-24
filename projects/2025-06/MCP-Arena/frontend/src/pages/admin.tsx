
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { NextPage } from 'next';
import { useAccount } from 'wagmi';
import Layout from '../components/Layout';
import styles from '../styles/Admin.module.css';

// 动态导入 ECharts（避免 SSR 报错）
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// Mock MCP 数据
const mockMCPData = [
  {
    id: 'mcp-001',
    name: 'Weather Forecaster',
    usageCount: 1250,
    averageRating: 4.7,
    earnings: [0.02, 0.03, 0.025, 0.04, 0.035, 0.045, 0.05, 0.06, 0.055, 0.065],
    ratings: [5, 4, 5, 5, 4, 5, 4, 5, 5, 4],
    usageHistory: [42, 56, 78, 90, 120, 150, 145, 160, 190, 219]
  },
  {
    id: 'mcp-002',
    name: 'Language Translator',
    usageCount: 980,
    averageRating: 4.2,
    earnings: [0.015, 0.02, 0.018, 0.025, 0.022, 0.028, 0.03, 0.035, 0.04, 0.045],
    ratings: [4, 5, 4, 4, 3, 5, 4, 5, 4, 4],
    usageHistory: [30, 45, 65, 85, 95, 110, 125, 140, 150, 135]
  }
];

const Admin: NextPage = () => {
  const { isConnected } = useAccount();
  const [mcpData, setMcpData] = useState(mockMCPData);
  const [selectedMCP, setSelectedMCP] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof typeof mockMCPData[0]>('usageCount');
  const [showAllMCPs, setShowAllMCPs] = useState(true); // To control visibility of all MCPs

  const sortedMCPData = [...mcpData].sort((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    return typeof valueA === 'number' && typeof valueB === 'number' ? valueB - valueA : 0;
  });
  const selectedMCPData = selectedMCP ? mcpData.find(mcp => mcp.id === selectedMCP) : null;

  const getEarningsOption = (earnings: number[]) => ({
    title: { text: '收益趋势图', left: 'center' },
    xAxis: { type: 'category', data: earnings.map((_, i) => `P${i + 1}`) },
    yAxis: { type: 'value' },
    series: [
      {
        data: earnings.map(e => e * 1000),
        type: 'line',
        smooth: true,
        areaStyle: {}
      }
    ],
    tooltip: { trigger: 'axis' }
  });

  return (
    <Layout title="MCP Admin Dashboard">
      <div className={styles.adminContainer}>

      {!isConnected ? (
        <div className={styles.notConnected}>
          <p>Please connect your wallet to access the admin dashboard</p>
        </div>
      ) : (
        <>
          <div className={styles.dashboard}>
            <div className={styles.mcpList}>
              <h2>MCP List</h2>
              <div className={styles.listHeader}>
                <span>Name</span>
                <span>Usage</span>
                <span>Rating</span>
              </div>
              {sortedMCPData.map(mcp => (
                <div
                  key={mcp.id}
                  className={`${styles.mcpItem} ${selectedMCP === mcp.id ? styles.selected : ''}`}
                  onClick={() => setSelectedMCP(mcp.id)}
                >
                  <span title={mcp.name}>{mcp.name.length > 15 ? `${mcp.name.substring(0, 15)}...` : mcp.name}</span>
                  <span>{mcp.usageCount}</span>
                  <span>
                    {mcp.averageRating.toFixed(1)} <span className={styles.star}>★</span>
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.mcpDetails}>
              {selectedMCPData ? (
                <>
                  <h2>{selectedMCPData.name} Details</h2>

                  <div className={styles.topRowGrid}>
                    <div className={styles.statsCard}>
                      <h3>Key Metrics</h3>
                      <div className={styles.verticalStats}>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Usage</span>
                          <span className={styles.statValue}>
                            {selectedMCPData?.usageCount}
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Rating</span>
                          <span className={styles.statValue}>
                            {selectedMCPData?.averageRating.toFixed(1)}
                            <span className={styles.star}>★</span>
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Revenue</span>
                          <span className={styles.statValue}>
                            Ξ{selectedMCPData?.earnings.reduce((acc, v) => acc + v, 0).toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.statsCard}>
                      <h3>Service Level Agreement</h3>
                      <ul className={styles.qosList}>
                        <li>Availability: 99.8%</li>
                        <li>Latency: 230ms</li>
                        <li>Error Rate: 0.3%</li>
                      </ul>
                    </div>
                    
                    <div className={styles.statsCard}>
                      <h3>Rewards / Slash Records</h3>
                      <ul className={styles.rewardList}>
                        <li>+0.02 ETH (2024-06-01)</li>
                        <li>+0.04 ETH (2024-06-03)</li>
                        <li>-0.01 ETH (2024-06-05) – SLA Violation</li>
                        <li>+0.05 ETH (2024-06-08)</li>
                      </ul>
                    </div>
                  </div>

                  <div className={styles.dashboardGrid}>
                    <div className={styles.chartContainer}>
                      <h3>Usage History</h3>
                      <div className={styles.barChart}>
                        {selectedMCPData?.usageHistory.map((v, i) => (
                          <div
                            key={i}
                            className={styles.bar}
                            style={{ height: `${(v / Math.max(...(selectedMCPData?.usageHistory || [1]))) * 100}%` }}
                            title={`Period ${i + 1}: ${v} uses`}
                          />
                        ))}
                      </div>
                      <div className={styles.chartLabel}>Time Period</div>
                    </div>

                    <div className={styles.chartContainer}>
                      <h3>Rating Distribution</h3>
                      <div className={styles.ratingDistribution}>
                        {[1, 2, 3, 4, 5].map(rating => {
                          const count = selectedMCPData?.ratings.filter(r => r === rating).length || 0;
                          const percent = (count / (selectedMCPData?.ratings.length || 1)) * 100;
                          return (
                            <div key={rating} className={styles.ratingBar}>
                              <span className={styles.ratingLabel}>{rating}<span className={styles.smallStar}>★</span></span>
                              <div className={styles.ratingBarContainer}>
                                <div className={styles.ratingBarFill} style={{ width: `${percent}%` }} />
                              </div>
                              <span className={styles.ratingCount}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`${styles.chartContainer} ${styles.wideChart}`}>
                      <h3>Revenue Trend</h3>
                      <div className={styles.echartBox}>
                        <ReactECharts option={getEarningsOption(selectedMCPData?.earnings || [])} style={{ height: '100%' }} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.noSelection}>
                  <p>Select an MCP to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
    </Layout>
  );
};

export default Admin;
