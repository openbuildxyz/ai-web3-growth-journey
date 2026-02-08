import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ConnectButton } from '../components/ConnectButton';

export default function Content() {
  const contentItems = [
    {
      id: 1,
      title: '如何利用AI提升内容创作效率',
      type: 'article',
      author: 'Creator 1',
      views: 1234,
      likes: 56,
      date: '2026-02-01',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20content%20creation%20efficiency%2C%20modern%20digital%20art%2C%20professional%20style&image_size=square',
    },
    {
      id: 2,
      title: 'Web3时代的内容创作者经济',
      type: 'video',
      author: 'Creator 2',
      views: 2345,
      likes: 89,
      date: '2026-02-02',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Web3%20creator%20economy%2C%20blockchain%20technology%2C%20futuristic%20design&image_size=square',
    },
    {
      id: 3,
      title: '去中心化存储的未来',
      type: 'article',
      author: 'Creator 3',
      views: 987,
      likes: 45,
      date: '2026-02-03',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=decentralized%20storage%20future%2C%20cloud%20technology%2C%20abstract%20digital%20art&image_size=square',
    },
    {
      id: 4,
      title: '智能合约在内容分润中的应用',
      type: 'video',
      author: 'Creator 4',
      views: 1567,
      likes: 67,
      date: '2026-02-04',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20contract%20royalty%20distribution%2C%20blockchain%20code%2C%20tech%20visualization&image_size=square',
    },
    {
      id: 5,
      title: 'AI生成艺术的版权问题',
      type: 'article',
      author: 'Creator 5',
      views: 1890,
      likes: 78,
      date: '2026-02-05',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20generated%20art%20copyright%2C%20legal%20concept%2C%20modern%20design&image_size=square',
    },
    {
      id: 6,
      title: '如何构建去中心化内容平台',
      type: 'video',
      author: 'Creator 6',
      views: 2109,
      likes: 92,
      date: '2026-02-06',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=building%20decentralized%20content%20platform%2C%20web%20development%2C%20collaborative%20workspace&image_size=square',
    },
    {
      id: 7,
      title: 'NFT与数字内容的未来',
      type: 'article',
      author: 'Creator 7',
      views: 1345,
      likes: 67,
      date: '2026-02-07',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=NFT%20digital%20content%20future%2C%20crypto%20art%2C%20vibrant%20colors&image_size=square',
    },
    {
      id: 8,
      title: 'Web3社交平台的崛起',
      type: 'video',
      author: 'Creator 8',
      views: 1789,
      likes: 89,
      date: '2026-02-08',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Web3%20social%20platform%20rise%2C%20decentralized%20network%2C%20connection%20concept&image_size=square',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>内容中心 - 去中心化内容创作平台</title>
        <meta name="description" content="浏览和发现平台上的优质内容" />
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
            <Link href="/content" className="font-medium text-primary border-b-2 border-primary">内容</Link>
            <Link href="/stats" className="font-medium text-gray-700 hover:text-primary">数据</Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">内容中心</h1>
          
          {/* 内容筛选 */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button className="px-4 py-2 rounded-full bg-primary text-white">全部</button>
            <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300">文章</button>
            <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300">图片</button>
            <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300">视频</button>
            <div className="ml-auto relative">
              <input 
                type="text" 
                placeholder="搜索内容..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
          
          {/* 内容网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {contentItems.map((item) => (
              <div key={item.id} className="card">
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                        <span className="text-primary text-xl">▶</span>
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{item.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="mr-4">{item.author}</span>
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-4">{item.views} 浏览</span>
                  <span>{item.likes} 点赞</span>
                </div>
                <Link href={`/content/${item.id}`} className="text-primary font-medium hover:underline">
                  查看详情
                </Link>
              </div>
            ))}
          </div>
          
          {/* 分页 */}
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">上一页</button>
              <button className="px-4 py-2 rounded-lg bg-primary text-white">1</button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">2</button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">3</button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">下一页</button>
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