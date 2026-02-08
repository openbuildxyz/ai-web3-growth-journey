import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ConnectButton } from '../components/ConnectButton';

export default function Create() {
  const [contentType, setContentType] = useState<'article' | 'image' | 'video'>('article');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    // 模拟AI生成内容
    setTimeout(() => {
      if (contentType === 'article') {
        setGeneratedContent(`这是为"${title}"生成的文章内容。\n\n基于您的需求，AI已为您生成了以下内容：\n\n1. 介绍部分\n2. 主体内容\n3. 结论部分\n\n您可以在此基础上进行修改和优化。`);
      } else if (contentType === 'image') {
        setGeneratedContent(`图片生成成功！基于您的提示词"${imagePrompt}"，AI已生成了相关图片。`);
      } else if (contentType === 'video') {
        setGeneratedContent(`视频生成成功！基于您的提示词"${videoPrompt}"，AI已生成了相关视频。`);
      }
      setIsGenerating(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 模拟提交内容到IPFS和智能合约
    alert('内容提交成功！将被上传至IPFS并记录到智能合约。');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>创建内容 - 去中心化内容创作平台</title>
        <meta name="description" content="使用AI工具生成和上传内容到去中心化平台" />
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
            <Link href="/create" className="font-medium text-primary border-b-2 border-primary">创作</Link>
            <Link href="/content" className="font-medium text-gray-700 hover:text-primary">内容</Link>
            <Link href="/stats" className="font-medium text-gray-700 hover:text-primary">数据</Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">创建内容</h1>
          
          {/* 内容类型选择 */}
          <div className="flex mb-8 border-b">
            <button
              className={`px-6 py-3 font-medium border-b-2 ${contentType === 'article' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'}`}
              onClick={() => setContentType('article')}
            >
              文章
            </button>
            <button
              className={`px-6 py-3 font-medium border-b-2 ${contentType === 'image' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'}`}
              onClick={() => setContentType('image')}
            >
              图片
            </button>
            <button
              className={`px-6 py-3 font-medium border-b-2 ${contentType === 'video' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'}`}
              onClick={() => setContentType('video')}
            >
              视频
            </button>
          </div>
          
          {/* 内容创建表单 */}
          <div className="card max-w-4xl">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  标题
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="输入内容标题"
                  required
                />
              </div>
              
              {contentType === 'article' && (
                <div className="mb-6">
                  <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                    内容
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-64"
                    placeholder="输入文章内容或使用AI生成"
                  ></textarea>
                </div>
              )}
              
              {contentType === 'image' && (
                <div className="mb-6">
                  <label htmlFor="imagePrompt" className="block text-gray-700 font-medium mb-2">
                    图片描述
                  </label>
                  <input
                    type="text"
                    id="imagePrompt"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="输入图片描述，AI将根据此生成图片"
                    required
                  />
                </div>
              )}
              
              {contentType === 'video' && (
                <div className="mb-6">
                  <label htmlFor="videoPrompt" className="block text-gray-700 font-medium mb-2">
                    视频描述
                  </label>
                  <input
                    type="text"
                    id="videoPrompt"
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="输入视频描述，AI将根据此生成视频"
                    required
                  />
                </div>
              )}
              
              {/* AI生成按钮 */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn btn-primary mr-4"
                >
                  {isGenerating ? '生成中...' : '使用AI生成'}
                </button>
                {generatedContent && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">AI生成结果：</h3>
                    <p className="text-gray-600">{generatedContent}</p>
                  </div>
                )}
              </div>
              
              {/* 提交按钮 */}
              <div className="flex justify-end">
                <Link href="/" className="btn btn-outline mr-4">
                  取消
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  提交内容
                </button>
              </div>
            </form>
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