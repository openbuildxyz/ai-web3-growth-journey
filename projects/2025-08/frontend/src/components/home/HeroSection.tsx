import React from 'react';
import { ArrowRight, Zap, Shield, Star } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-20 pb-16">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/30">
              <Zap className="w-4 h-4" />
              <span>Leading On-Chain AI Data Exchange</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Decentralized
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Data
            </span>
            Marketplace
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Empowering AI developers with high-quality, trusted datasets through blockchain technology 
            and expert-driven validation. Professional auditing, secure transactions, advancing AI innovation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 group">
              <span className="text-lg font-semibold">Explore Datasets</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border border-white/30 text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-200 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="text-lg font-semibold">Become Expert</span>
            </button>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Expert Validation', desc: 'Multi-tier expert review ensures premium data quality' },
            { icon: Star, title: 'Reputation System', desc: 'DID authentication with comprehensive scoring mechanism' },
            { icon: Zap, title: 'Incentive Protocol', desc: 'Staking rewards and revenue sharing ecosystem' }
          ].map((feature, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;