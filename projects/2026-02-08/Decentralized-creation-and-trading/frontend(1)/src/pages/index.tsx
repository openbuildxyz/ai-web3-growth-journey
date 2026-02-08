import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ConnectButton } from '../components/ConnectButton';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { ContentGrid } from '../components/ContentGrid';
import { Footer } from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>去中心化内容创作平台</title>
        <meta name="description" content="结合AI辅助内容生产工具、Web3核心技术和智能合约的去中心化创作平台" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 导航栏 */}
      <nav className="bg-white shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Decentralized Creator</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-medium text-gray-700 hover:text-primary transition-colors duration-300 relative group">
              首页
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/create" className="font-medium text-gray-700 hover:text-primary transition-colors duration-300 relative group">
              创作
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/content" className="font-medium text-gray-700 hover:text-primary transition-colors duration-300 relative group">
              内容
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/stats" className="font-medium text-gray-700 hover:text-primary transition-colors duration-300 relative group">
              数据
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <div className="ml-4">
              <ConnectButton />
            </div>
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-primary focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-grow">
        <Hero />
        <Features />
        <ContentGrid />
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
};

export default Home;