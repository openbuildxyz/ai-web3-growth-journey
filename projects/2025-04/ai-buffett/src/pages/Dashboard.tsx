import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useNavigate } from 'react-router-dom';
import { ANALYSTS } from '@/data/analysts';
import { CRYPTOCURRENCIES, Cryptocurrency } from '@/data/cryptocurrencies';
import Analysis from './Analysis';

const Dashboard = () => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [selectedAnalyst, setSelectedAnalyst] = useState('');
  const [isCryptoDropdownOpen, setIsCryptoDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  if (showAnalysis && selectedCrypto) {
    return <Analysis selectedCrypto={selectedCrypto} selectedAnalyst={selectedAnalyst} />;
  }

  const filteredCryptos = CRYPTOCURRENCIES.filter(crypto => 
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI驱动的投资决策
          <br />
          <span className="text-2xl text-gray-600">智能预测助理投资未来</span>
        </h1>

        <div className="max-w-2xl mx-auto mb-12">
          <label className="block text-lg font-medium mb-2">选择加密货币</label>
          <div className="relative">
            <div
              className="w-full p-3 border rounded-lg shadow-sm bg-white/80 backdrop-blur-sm cursor-pointer flex items-center justify-between"
              onClick={() => setIsCryptoDropdownOpen(!isCryptoDropdownOpen)}
            >
              <div className="flex-1 flex items-center gap-2">
                {selectedCrypto ? (
                  <>
                    <img 
                      src={selectedCrypto.logo} 
                      alt={selectedCrypto.symbol} 
                      className="w-6 h-6"
                    />
                    <span>{selectedCrypto.symbol}</span>
                  </>
                ) : (
                  '请选择加密货币'
                )}
              </div>
              <svg
                className={`w-5 h-5 transition-transform ${isCryptoDropdownOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {isCryptoDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white/90 backdrop-blur-sm border rounded-lg shadow-lg">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="搜索加密货币..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCryptos.map((crypto) => (
                    <div
                      key={crypto.symbol}
                      className={`p-2 cursor-pointer hover:bg-blue-50 flex items-center gap-2 ${
                        selectedCrypto?.symbol === crypto.symbol ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedCrypto(crypto);
                        setIsCryptoDropdownOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <img 
                        src={crypto.logo} 
                        alt={crypto.symbol} 
                        className="w-6 h-6"
                      />
                      <span>{crypto.symbol}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6 text-center">选择你的个人顶级分析师</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {ANALYSTS.map((analyst) => (
            <div
              key={analyst.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all bg-white/80 backdrop-blur-sm ${
                selectedAnalyst === analyst.id
                  ? 'border-blue-500 bg-blue-50/90 shadow-lg'
                  : 'hover:border-gray-400 hover:shadow-md'
              }`}
              onClick={() => setSelectedAnalyst(analyst.id)}
            >
              <img
                src={`/src/assets/analysts/${analyst.id}.jpeg`}
                alt={analyst.chineseName}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-lg mb-2">{analyst.chineseName}</h3>
              <p className="text-sm text-gray-600">{analyst.introduction}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            className={`px-8 py-3 rounded-lg text-white font-semibold transition-all ${
              selectedCrypto && selectedAnalyst
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!selectedCrypto || !selectedAnalyst}
            onClick={() => setShowAnalysis(true)}
          >
            开始分析
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 