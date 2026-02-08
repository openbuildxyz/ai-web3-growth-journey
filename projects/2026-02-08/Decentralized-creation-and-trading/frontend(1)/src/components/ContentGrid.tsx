import React from 'react';
import Link from 'next/link';

export const ContentGrid: React.FC = () => {
  const contentItems = [
    {
      id: 1,
      title: '如何利用AI提升内容创作效率',
      type: 'article',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20content%20creation%20efficiency%2C%20modern%20digital%20art%2C%20professional%20style%2C%20vibrant%20colors&image_size=landscape_16_9',
    },
    {
      id: 2,
      title: 'Web3时代的内容创作者经济',
      type: 'video',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Web3%20creator%20economy%2C%20blockchain%20technology%2C%20futuristic%20design%2C%20professional%20looking&image_size=landscape_16_9',
    },
    {
      id: 3,
      title: '去中心化存储的未来',
      type: 'article',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=decentralized%20storage%20future%2C%20cloud%20technology%2C%20abstract%20digital%20art%2C%20vibrant%20colors&image_size=landscape_16_9',
    },
    {
      id: 4,
      title: '智能合约在内容分润中的应用',
      type: 'video',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20contract%20royalty%20distribution%2C%20blockchain%20code%2C%20tech%20visualization%2C%20professional%20looking&image_size=landscape_16_9',
    },
    {
      id: 5,
      title: 'AI生成艺术的版权问题',
      type: 'article',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20generated%20art%20copyright%2C%20legal%20concept%2C%20modern%20design%2C%20vibrant%20colors&image_size=landscape_16_9',
    },
    {
      id: 6,
      title: '如何构建去中心化内容平台',
      type: 'video',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=building%20decentralized%20content%20platform%2C%20web%20development%2C%20collaborative%20workspace%2C%20professional%20looking&image_size=landscape_16_9',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            发现优质创作
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {contentItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                <Link 
                  href={`/content/${item.id}`} 
                  className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors duration-300"
                >
                  阅读更多
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};