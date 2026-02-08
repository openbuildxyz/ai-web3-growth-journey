import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from '../../components/ConnectButton';

export default function ContentDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  // 模拟内容数据
  const content = {
    id: id,
    title: '如何利用AI提升内容创作效率',
    type: 'article',
    author: 'Creator 1',
    views: 1234,
    likes: 56,
    date: '2026-02-01',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20content%20creation%20efficiency%2C%20modern%20digital%20art%2C%20professional%20style&image_size=landscape_16_9',
    content: `# 如何利用AI提升内容创作效率

在当今数字时代，内容创作已经成为许多行业的核心竞争力。然而，传统的内容创作方式往往效率低下，需要大量的时间和精力。随着人工智能技术的快速发展，AI辅助内容创作工具已经成为提升创作效率的重要手段。

## 一、AI文案生成工具

### 1. Cursor/Copilot X

Cursor和Copilot X是目前市场上最流行的AI代码和文案生成工具。它们基于先进的语言模型，能够根据用户的输入和上下文生成高质量的文案内容。

**使用方法：**
- 安装Cursor或Copilot X插件
- 在编辑器中输入关键词或大纲
- 使用快捷键触发AI生成功能
- 对生成的内容进行修改和优化

### 2. 自定义风格配置

许多AI工具支持自定义风格配置，用户可以根据不同的场景和需求设置不同的写作风格，如小红书种草、公众号干货等。

## 二、AI图文创作工具

### 1. Midjourney API

Midjourney是一款强大的AI图像生成工具，通过API调用，用户可以将文案和相关提示词传递给Midjourney，生成符合要求的高质量图片。

**使用示例：**
```javascript
const response = await fetch('https://api.midjourney.com/v1/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    prompt: '现代办公室场景，专业人士在工作',
    size: '1024x1024'
  })
});
const data = await response.json();
```

### 2. Canva AI

Canva AI是一款强大的设计工具，它可以对生成的图片进行快速排版，生成封面图、海报、内容配图等。结合Canva的批量生成功能，用户可以快速制作大批量的图文内容。

## 三、AI视频剪辑工具

### Runway ML（Gen-2）

Runway ML的Gen-2工具是一款强大的视频生成工具，它可以根据文本输入生成短视频，自动进行剪辑、配乐，生成最终的视频。

**使用步骤：**
1. 安装Runway ML
2. 选择Gen-2工具
3. 输入文本描述
4. 设置视频长度和配乐
5. 生成并编辑视频

## 四、内容润色工具

### 1. Grammarly AI

Grammarly AI可以对生成的文案进行语法纠错、风格优化等，确保文案没有拼写、语法错误。

### 2. 通义千问 API

通义千问的API可以进行中文语境的内容润色，提升文案的流畅度和本地化适配。

## 五、实际应用案例

### 案例一：社交媒体内容创作

某品牌营销团队使用AI工具批量生成社交媒体内容，包括文案、图片和视频，将原本需要一周的工作缩短到一天完成。

### 案例二：博客文章创作

一位博主使用AI工具生成博客文章大纲和初稿，然后进行修改和优化，大大提升了创作效率，同时保持了内容的质量。

## 六、总结与展望

AI辅助内容创作工具已经成为提升创作效率的重要手段，它们不仅可以节省时间和精力，还可以提供创意灵感，帮助创作者生成更高质量的内容。

随着AI技术的不断发展，未来的AI辅助创作工具将会更加智能和个性化，为创作者提供更多的可能性。我们可以期待，在不久的将来，AI将成为内容创作者的得力助手，共同推动内容创作行业的发展。`,
    ipfsCid: 'QmXYZ123456789',
    royalty: '0.5 MON'
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{content.title} - 去中心化内容创作平台</title>
        <meta name="description" content={content.title} />
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
          {/* 内容标题和元信息 */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{content.title}</h1>
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6">
              <span className="mr-4">作者: {content.author}</span>
              <span className="mr-4">发布日期: {content.date}</span>
              <span className="mr-4">{content.views} 浏览</span>
              <span>{content.likes} 点赞</span>
            </div>
            
            {/* 内容图片 */}
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={content.image} 
                alt={content.title} 
                className="w-full h-auto"
              />
            </div>
            
            {/* 内容正文 */}
            <div className="prose prose-lg max-w-none mb-12">
              {content.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            {/* 内容信息卡片 */}
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">内容信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 mb-2"><span className="font-medium">内容类型:</span> {content.type === 'article' ? '文章' : content.type === 'video' ? '视频' : '图片'}</p>
                  <p className="text-gray-600 mb-2"><span className="font-medium">IPFS CID:</span> {content.ipfsCid}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2"><span className="font-medium">代币分润:</span> {content.royalty}</p>
                  <p className="text-gray-600 mb-2"><span className="font-medium">上链状态:</span> <span className="text-green-600">已上链</span></p>
                </div>
              </div>
              <div className="mt-4 flex space-x-4">
                <button className="btn btn-outline">
                  分享内容
                </button>
                <button className="btn btn-outline">
                  点赞
                </button>
                <button className="btn btn-outline">
                  收藏
                </button>
              </div>
            </div>
            
            {/* 相关内容 */}
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">相关内容</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link href="/content/2" className="card hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Web3时代的内容创作者经济</h3>
                  <p className="text-gray-600 text-sm">了解Web3如何改变内容创作者的经济模式</p>
                </Link>
                <Link href="/content/5" className="card hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">AI生成艺术的版权问题</h3>
                  <p className="text-gray-600 text-sm">探讨AI生成艺术的版权归属和法律问题</p>
                </Link>
              </div>
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