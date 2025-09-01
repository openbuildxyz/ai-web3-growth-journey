import React, { useState } from 'react';
import { Shield, Coins, TrendingUp, AlertCircle, CheckCircle, Wallet, ArrowRight, Mail, Star } from 'lucide-react';

const BecomeExpertPage = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH'>('ETH');
  const [stakeAmount, setStakeAmount] = useState('');
  const [expertType, setExpertType] = useState<'stake' | 'invite'>('stake');

  const requirements = [
    { title: "Minimum Stake", btc: "0.1 BTC", eth: "1.5 ETH" },
    { title: "Professional Experience", value: "3+ years in AI/ML" },
    { title: "Education", value: "Master's degree or higher" },
    { title: "Audit Commitment", value: "≥10 datasets per month" }
  ];

  const benefits = [
    { icon: Coins, title: "Audit Rewards", desc: "Earn 0.01-0.05 ETH per audit" },
    { icon: TrendingUp, title: "Reputation Growth", desc: "Quality audits boost reputation score" },
    { icon: Shield, title: "Platform Benefits", desc: "Governance participation and revenue sharing" }
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">Become a Validation Expert</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join our platform as an expert through staking or invitation to earn audit rewards with governance rights
          </p>
        </div>

        {/* Expert Type Selection */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setExpertType('stake')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                expertType === 'stake'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Staking Expert
            </button>
            <button
              onClick={() => setExpertType('invite')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                expertType === 'invite'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Star className="w-5 h-5 inline mr-2" />
              Invited Expert
            </button>
          </div>
        </div>

        {expertType === 'invite' ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Invited Expert Program</h2>
              <p className="text-gray-300">
                Apply to become an invited expert through our email application process. 
                Selected experts will undergo our rigorous review process.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-purple-400" />
                  Application Process
                </h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">1</div>
                    <p>Send your application email to <span className="text-purple-400 font-semibold">experts@dexpert.com</span></p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">2</div>
                    <p>Include your CV, portfolio, and relevant certifications</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">3</div>
                    <p>Our team will review your application within 5-7 business days</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">4</div>
                    <p>Selected candidates will be contacted for an interview</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Requirements for Invited Experts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>PhD in AI/ML or related field</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>5+ years industry experience</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Published research papers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Industry recognition</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Invited Expert Benefits</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-green-400" />
                    <span>Higher audit rewards (0.05-0.1 ETH per audit)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>Priority access to premium datasets</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Enhanced governance voting power</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span>No staking requirements</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 group">
                <Mail className="w-5 h-5" />
                <span className="text-lg font-semibold">Send Application Email</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Requirements and Benefits */}
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-400" />
                <span>Expert Requirements</span>
              </h2>
              
              <div className="space-y-4">
                {requirements.map((req, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0">
                    <span className="text-gray-300">{req.title}</span>
                    <span className="text-white font-semibold">
                      {req.btc && req.eth 
                        ? `${req.btc} / ${req.eth}`
                        : req.value
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Expert Benefits</h2>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
                      <benefit.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{benefit.title}</h3>
                      <p className="text-gray-300 text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Staking Form */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Staking Application</h2>
            
            <div className="space-y-6">
              {/* Crypto Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Select Staking Currency</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'BTC', min: '0.1', color: 'from-orange-500 to-yellow-500' },
                    { name: 'ETH', min: '1.5', color: 'from-blue-500 to-purple-600' }
                  ].map((crypto) => (
                    <button
                      key={crypto.name}
                      onClick={() => setSelectedCrypto(crypto.name as 'BTC' | 'ETH')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedCrypto === crypto.name
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div className={`w-8 h-8 bg-gradient-to-r ${crypto.color} rounded-lg mx-auto mb-2`}></div>
                      <div className="text-white font-semibold">{crypto.name}</div>
                      <div className="text-gray-400 text-sm">Min {crypto.min}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Stake Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                    placeholder={`Enter ${selectedCrypto} amount`}
                  />
                  <span className="absolute right-3 top-3 text-gray-400">{selectedCrypto}</span>
                </div>
              </div>

              {/* Professional Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Specialization</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none">
                    <option value="">Select specialization</option>
                    <option value="cv">Computer Vision</option>
                    <option value="nlp">Natural Language Processing</option>
                    <option value="ml">Machine Learning</option>
                    <option value="rl">Reinforcement Learning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Years of Experience</label>
                  <input
                    type="number"
                    min="3"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                    placeholder="Minimum 3 years"
                  />
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-yellow-100 text-sm">
                  <p className="font-semibold mb-1">Important Notice</p>
                  <p>Staked assets will be locked for 30 days. Poor audit quality may result in penalties. Ensure you have the required professional expertise.</p>
                </div>
              </div>

              {/* Submit Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 group">
                <Wallet className="w-5 h-5" />
                <span className="text-lg font-semibold">Submit Application</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Success Stories */}
        <div className="mt-16 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Expert Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Dr. Zhang", earnings: "12.5 ETH", period: "6 months", audits: "247" },
              { name: "Prof. Li", earnings: "8.9 ETH", period: "4 months", audits: "189" },
              { name: "Dr. Wang", earnings: "15.2 ETH", period: "8 months", audits: "312" }
            ].map((expert, index) => (
              <div key={index} className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{expert.name}</h3>
                <div className="text-green-400 text-xl font-bold mb-1">{expert.earnings}</div>
                <div className="text-gray-300 text-sm">{expert.period} • {expert.audits} audits</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeExpertPage;