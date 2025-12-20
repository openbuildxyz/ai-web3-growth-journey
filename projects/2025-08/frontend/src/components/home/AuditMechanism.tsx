import React from 'react';
import { Shield, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const AuditMechanism = () => {
  const steps = [
    {
      icon: Users,
      title: "Expert Staking",
      description: "Stake BTC/ETH to qualify for audit privileges",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Shield,
      title: "Multi-Expert Review",
      description: "3-5 experts conduct independent validation",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: CheckCircle,
      title: "Consensus Formation",
      description: "Reputation-weighted consensus mechanism",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Reward Distribution",
      description: "Automated reward distribution to validators",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Innovative Audit Protocol</h2>
        <p className="text-xl text-gray-300">Decentralized expert incentives and quality assurance system</p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white text-center mb-3">{step.title}</h3>
                <p className="text-gray-300 text-center text-sm leading-relaxed">{step.description}</p>
                
                <div className="mt-6 text-center">
                  <span className="text-blue-400 text-lg font-bold">#{index + 1}</span>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-400">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Why Choose Our Audit Mechanism?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { title: "Decentralized Trust", desc: "Immutable blockchain-based audit records" },
              { title: "Aligned Incentives", desc: "Expert rewards directly tied to audit quality" },
              { title: "Full Transparency", desc: "All audit processes and results on-chain" }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuditMechanism;