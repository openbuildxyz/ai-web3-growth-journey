import React from 'react';
import { Star, Award, TrendingUp, Shield } from 'lucide-react';

const ExpertRanking = () => {
  const experts = [
    {
      id: 1,
      name: "Dr.Mike",
      did: "did:eth:0x1a2b...c3d4",
      reputation: 9.8,
      speciality: "Computer Vision",
      auditsCompleted: 847,
      successRate: 98.5,
      avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150",
      badge: "Gold Expert"
    },
    {
      id: 2,
      name: "Prof.Lee",
      did: "did:btc:bc1q...xyz789",
      reputation: 9.6,
      speciality: "Natural Language Processing",
      auditsCompleted: 623,
      successRate: 97.8,
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      badge: "Gold Expert"
    },
    {
      id: 3,
      name: "Dr.Bob",
      did: "did:eth:0x9f8e...a1b2",
      reputation: 9.4,
      speciality: "Machine Learning",
      auditsCompleted: 592,
      successRate: 96.9,
      avatar: "https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=150",
      badge: "Silver Expert"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Top Validation Experts</h2>
        <p className="text-xl text-gray-300">DID-authenticated expert ecosystem with reputation scoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {experts.map((expert, index) => (
          <div key={expert.id} className="relative">
            {index === 0 && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                #1 Expert
              </div>
            )}
            
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img 
                    src={expert.avatar} 
                    alt={expert.name}
                    className="w-20 h-20 rounded-full mx-auto border-4 border-blue-500/50 group-hover:border-blue-400 transition-colors duration-300"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
                    <Award className="w-4 h-4 text-black" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mt-4 mb-1">{expert.name}</h3>
                <div className="text-blue-400 text-sm font-medium mb-2">{expert.badge}</div>
                <div className="text-gray-400 text-xs font-mono">{expert.did}</div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Reputation Score</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">{expert.reputation}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Specialization</span>
                  <span className="text-blue-400 font-medium">{expert.speciality}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Audits Completed</span>
                  <span className="text-white font-semibold">{expert.auditsCompleted}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Success Rate</span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">{expert.successRate}%</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-blue-600/20 border border-blue-500/50 text-blue-300 py-3 rounded-lg hover:bg-blue-600/30 transition-all duration-200">
                View Expert Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExpertRanking;