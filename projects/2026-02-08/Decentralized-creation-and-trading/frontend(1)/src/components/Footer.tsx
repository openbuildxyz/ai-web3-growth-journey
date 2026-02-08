import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h2 className="text-2xl font-bold">Decentralized Creator</h2>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">平台</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  创作
                </Link>
              </li>
              <li>
                <Link href="/content" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  内容
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  数据
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">资源</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  文档
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  教程
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  API
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  社区
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">联系我们</h3>
            <ul className="space-y-4">
              <li className="text-gray-400">
                email@example.com
              </li>
              <li className="text-gray-400">
                Twitter
              </li>
              <li className="text-gray-400">
                Discord
              </li>
              <li className="text-gray-400">
                GitHub
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-16 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Decentralized Creator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};