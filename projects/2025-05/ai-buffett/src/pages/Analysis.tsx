import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cryptocurrency } from '@/data/cryptocurrencies';
import { ANALYSTS } from '@/data/analysts';

interface AnalysisProps {
  selectedCrypto: Cryptocurrency;
  selectedAnalyst: string;
}

interface AnalysisResult {
  [key: string]: unknown;
}

interface AgentStatus {
  agent: string;
  status: string;
  progress: number;
  isComplete: boolean;
}

const Analysis: React.FC<AnalysisProps> = ({ selectedCrypto, selectedAnalyst }) => {
  const navigate = useNavigate();
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const selectedAnalystInfo = ANALYSTS.find(a => a.id === selectedAnalyst);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('http://192.168.110.81:8000/hedge-fund/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tickers: [`${selectedCrypto.symbol}-USDT`],
            selected_agents: ['technical_analyst'],
            model_name: "deepseek-reasoner",
            crypto: true
          }),
        });

        if (!response.ok) {
          throw new Error('分析请求失败');
        }

        if (!response.body) {
          throw new Error('响应体为空');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('事件流结束');
            setIsLoading(false);
            // 分析完成时，将所有agent标记为完成
            setAgentStatuses(prev => prev.map(status => ({ ...status, isComplete: true })));
            break;
          }

          const chunk = decoder.decode(value);
          const events = chunk.split('\n\n');
          
          for (const event of events) {
            if (!event.trim()) continue;
            
            const lines = event.split('\n');
            let eventName = 'message';
            let eventData: unknown = null;
            
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventName = line.slice(6).trim();
              }
              if (line.startsWith('data:')) {
                try {
                  eventData = JSON.parse(line.slice(5));
                } catch (e) {
                  eventData = line.slice(5);
                }
              }
            }

            if (eventName === 'progress' && typeof eventData === 'object' && eventData !== null) {
              const data = eventData as { agent?: string; status?: string; progress?: number };
              if (data.agent) {
                setAgentStatuses(prev => {
                  const existingIndex = prev.findIndex(item => item.agent === data.agent);
                  if (existingIndex >= 0) {
                    // 更新现有agent的状态
                    const newStatuses = [...prev];
                    newStatuses[existingIndex] = {
                      agent: data.agent!,
                      status: data.status || '',
                      progress: data.progress || 0,
                      isComplete: false
                    };
                    return newStatuses;
                  } else {
                    // 添加新的agent，并将之前的agent标记为完成
                    return prev.map(status => ({ ...status, isComplete: true })).concat({
                      agent: data.agent,
                      status: data.status || '',
                      progress: data.progress || 0,
                      isComplete: false
                    });
                  }
                });
              }
            } else if (eventName === 'result' && typeof eventData === 'object' && eventData !== null) {
              setAnalysisResult(eventData as AnalysisResult);
              setIsLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('发送分析请求时出错:', error);
        setError(error instanceof Error ? error.message : '未知错误');
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [selectedCrypto.symbol]);

  const handleNewAnalysis = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-center mb-6">分析进行中</h1>
              
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCrypto.logo}
                    alt={selectedCrypto.symbol}
                    className="w-8 h-8"
                  />
                  <span className="text-lg font-semibold">{selectedCrypto.symbol}</span>
                </div>
                
                {selectedAnalystInfo && (
                  <div className="flex items-center gap-3">
                    <img
                      src={`/src/assets/analysts/${selectedAnalystInfo.id}.jpeg`}
                      alt={selectedAnalystInfo.chineseName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-lg font-semibold">{selectedAnalystInfo.chineseName}</span>
                  </div>
                )}
              </div>
            </div>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                <p className="font-semibold">错误</p>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {agentStatuses.map((agentStatus) => (
                    <div 
                      key={agentStatus.agent} 
                      className={`bg-gray-50 rounded-lg p-4 transition-all duration-300 ${
                        agentStatus.isComplete ? 'bg-green-50/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{agentStatus.agent}</h3>
                        <div className="flex items-center gap-3">
                          <p className="text-gray-700 text-sm">{agentStatus.status}</p>
                          {agentStatus.isComplete ? (
                            <div className="flex items-center justify-center w-6 h-6">
                              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-6 h-6">
                              <div className="relative w-6 h-6">
                                <div className="absolute inset-0 border-2 border-blue-200 rounded-full"></div>
                                <div className="absolute inset-0 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {analysisResult && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">分析结果</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(analysisResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {!isLoading && analysisResult && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleNewAnalysis}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      再次分析
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis; 