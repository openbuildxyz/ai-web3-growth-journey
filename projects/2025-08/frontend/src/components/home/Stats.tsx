import React from 'react';
import { TrendingUp, Users, Database, Shield } from 'lucide-react';

const Stats = () => {
  const stats = [
    { icon: Database, label: 'Total Datasets', value: '12,450', unit: '' },
    { icon: Users, label: 'Verified Experts', value: '2,847', unit: '' },
    { icon: Shield, label: 'Audit Success Rate', value: '98.7', unit: '%' },
    { icon: TrendingUp, label: 'Platform Volume', value: '45.2', unit: 'M USDT' }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center group hover:bg-white/10 transition-all duration-300">
            <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
            <div className="text-3xl font-bold text-white mb-1">
              {stat.value}
              <span className="text-blue-400 text-lg ml-1">{stat.unit}</span>
            </div>
            <div className="text-gray-300 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;