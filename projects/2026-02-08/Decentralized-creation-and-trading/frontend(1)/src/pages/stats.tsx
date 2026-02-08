import React, { useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ConnectButton } from '../components/ConnectButton';
import * as echarts from 'echarts';

export default function Stats() {
  const contentStatusChartRef = useRef<HTMLDivElement>(null);
  const royaltyChartRef = useRef<HTMLDivElement>(null);
  const contentTypeChartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 内容上链状态图表
    if (contentStatusChartRef.current) {
      const chart = echarts.init(contentStatusChartRef.current);
      const option = {
        title: {
          text: '内容上链状态',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            name: '上链状态',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 65, name: '已上链' },
              { value: 25, name: '待上链' },
              { value: 10, name: '上链失败' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      chart.setOption(option);
      
      // 响应式处理
      window.addEventListener('resize', () => {
        chart.resize();
      });
    }
    
    // 代币分润记录图表
    if (royaltyChartRef.current) {
      const chart = echarts.init(royaltyChartRef.current);
      const option = {
        title: {
          text: '代币分润记录',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['分润金额'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '分润金额',
            type: 'line',
            stack: 'Total',
            data: [120, 132, 101, 134, 90, 230],
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(99, 102, 241, 0.5)' },
                { offset: 1, color: 'rgba(99, 102, 241, 0.1)' }
              ])
            },
            lineStyle: {
              color: '#6366f1'
            },
            itemStyle: {
              color: '#6366f1'
            }
          }
        ]
      };
      chart.setOption(option);
      
      // 响应式处理
      window.addEventListener('resize', () => {
        chart.resize();
      });
    }
    
    // 内容类型分布图表
    if (contentTypeChartRef.current) {
      const chart = echarts.init(contentTypeChartRef.current);
      const option = {
        title: {
          text: '内容类型分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            name: '内容类型',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 45, name: '文章' },
              { value: 30, name: '图片' },
              { value: 25, name: '视频' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      chart.setOption(option);
      
      // 响应式处理
      window.addEventListener('resize', () => {
        chart.resize();
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>数据统计 - 去中心化内容创作平台</title>
        <meta name="description" content="查看内容上链状态和代币分润记录" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 导航栏 */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Decentralized Creator</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href="/" className="font-medium text-gray-700 hover:text-primary">首页</Link>
            <Link href="/create" className="font-medium text-gray-700 hover:text-primary">创作</Link>
            <Link href="/content" className="font-medium text-gray-700 hover:text-primary">内容</Link>
            <Link href="/stats" className="font-medium text-primary border-b-2 border-primary">数据</Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">数据统计</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 内容上链状态 */}
            <div className="card">
              <div ref={contentStatusChartRef} className="h-80"></div>
            </div>
            
            {/* 代币分润记录 */}
            <div className="card">
              <div ref={royaltyChartRef} className="h-80"></div>
            </div>
            
            {/* 内容类型分布 */}
            <div className="card">
              <div ref={contentTypeChartRef} className="h-80"></div>
            </div>
          </div>
          
          {/* 详细数据表格 */}
          <div className="mt-12 card">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">详细分润记录</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      内容ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      内容类型
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分润金额
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2026-02-08
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      CONTENT-001
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      文章
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      1.25 MON
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        已完成
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2026-02-07
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      CONTENT-002
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      视频
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      0.85 MON
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        已完成
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2026-02-06
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      CONTENT-003
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      图片
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      0.50 MON
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        处理中
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <h2 className="text-xl font-bold">Decentralized Creator</h2>
              </div>
              <p className="text-gray-400 mb-4">
                结合AI辅助内容生产工具、Web3核心技术和智能合约的去中心化创作平台。
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">平台</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">首页</Link></li>
                <li><Link href="/create" className="text-gray-400 hover:text-white">创作</Link></li>
                <li><Link href="/content" className="text-gray-400 hover:text-white">内容</Link></li>
                <li><Link href="/stats" className="text-gray-400 hover:text-white">数据</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">资源</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">文档</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">教程</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">API</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">社区</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">联系我们</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">email@example.com</li>
                <li className="text-gray-400">Twitter</li>
                <li className="text-gray-400">Discord</li>
                <li className="text-gray-400">GitHub</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>© 2026 Decentralized Creator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}