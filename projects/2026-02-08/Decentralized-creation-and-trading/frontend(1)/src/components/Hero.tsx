import React from 'react';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-5/12 lg:w-5/12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                释放创作潜能
              </span>
              <br />
              拥抱Web3未来
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              结合AI辅助内容生产工具、Web3核心技术和智能合约，为创作者提供一个去中心化、易于上手的内容创作工具。
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                href="/create" 
                className="btn btn-primary text-center py-6 px-8 text-lg font-medium rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                开始创作
              </Link>
              <Link 
                href="/content" 
                className="btn btn-outline text-center py-6 px-8 text-lg font-medium rounded-xl border-2 border-gray-200 hover:border-primary hover:text-primary transition-all duration-300"
              >
                浏览内容
              </Link>
            </div>
          </div>
          <div className="md:w-7/12 lg:w-6/12">
            <img 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=decentralized%20content%20creation%20platform%20with%20AI%20tools%20and%20blockchain%20technology%2C%20modern%20UI%2C%20creative%20design%2C%20professional%20looking%2C%20vibrant%20colors&image_size=landscape_16_9" 
              alt="去中心化内容创作平台" 
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};