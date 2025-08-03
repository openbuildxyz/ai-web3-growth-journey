import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import aragonDAO from '../../services/aragon';
import { Loading } from '../common/Loading';

export const DAOSetup = ({ onDAOReady }) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const [daoAddress, setDaoAddress] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('setup'); // setup, create, connect

  // 从本地存储加载已保存的 DAO 地址
  useEffect(() => {
    const savedDAOAddress = localStorage.getItem('aragonDAOAddress');
    if (savedDAOAddress) {
      setDaoAddress(savedDAOAddress);
      setStep('connect');
    }
  }, []);

  // 初始化 Aragon 客户端
  const initializeAragon = async () => {
    if (!isConnected || !publicClient) {
      setError('请先连接钱包');
      return false;
    }

    setIsInitializing(true);
    setError('');

    try {
      const success = await aragonDAO.initialize(publicClient);
      if (success) {
        console.log('Aragon 客户端初始化成功');
        return true;
      } else {
        setError('Aragon 客户端初始化失败');
        return false;
      }
    } catch (error) {
      console.error('初始化失败:', error);
      setError(`初始化失败: ${error.message}`);
      return false;
    } finally {
      setIsInitializing(false);
    }
  };

  // 创建新的 DAO
  const createDAO = async () => {
    const initialized = await initializeAragon();
    if (!initialized) return;

    setIsCreating(true);
    setError('');

    try {
      const daoConfig = {
        name: 'SheDid',
        description: '记录被遗忘的女性历史贡献',
        ensSubdomain: `shedid-${Date.now()}`,
        tokenName: 'SheDid Token',
        tokenSymbol: 'SHE',
        initialHolders: [address],
        initialAmounts: [BigInt('1000000000000000000000')] // 1000 tokens
      };

      const result = await aragonDAO.createDAO(daoConfig);
      
      if (result.success) {
        setDaoAddress(result.daoAddress);
        localStorage.setItem('aragonDAOAddress', result.daoAddress);
        setStep('connect');
        
        // 通知父组件 DAO 已准备就绪
        if (onDAOReady) {
          onDAOReady(result.daoAddress);
        }
      }
    } catch (error) {
      console.error('创建 DAO 失败:', error);
      setError(`创建 DAO 失败: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // 连接到现有 DAO
  const connectToDAO = async () => {
    if (!daoAddress.trim()) {
      setError('请输入 DAO 地址');
      return;
    }

    const initialized = await initializeAragon();
    if (!initialized) return;

    try {
      aragonDAO.setDAOAddress(daoAddress.trim());
      localStorage.setItem('aragonDAOAddress', daoAddress.trim());
      
      // 通知父组件 DAO 已准备就绪
      if (onDAOReady) {
        onDAOReady(daoAddress.trim());
      }
    } catch (error) {
      console.error('连接 DAO 失败:', error);
      setError(`连接 DAO 失败: ${error.message}`);
    }
  };

  // 重置 DAO 设置
  const resetDAO = () => {
    localStorage.removeItem('aragonDAOAddress');
    setDaoAddress('');
    setStep('setup');
    setError('');
  };

  if (!isConnected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">✨ SheDid DAO 设置</h3>
        <p className="text-gray-600">请先连接钱包以设置女性历史记录 DAO</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">✨ SheDid DAO 设置</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {step === 'setup' && (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            选择创建新的女性历史记录 DAO 或连接到现有的 DAO
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={createDAO}
              disabled={isCreating || isInitializing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <Loading size="sm" />
                  <span className="ml-2">创建中...</span>
                </>
              ) : (
                '✨ 创建 SheDid DAO'
              )}
            </button>
            
            <button
              onClick={() => setStep('connect')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg"
            >
              🔗 连接现有 DAO
            </button>
          </div>
        </div>
      )}

      {step === 'connect' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DAO 地址
            </label>
            <input
              type="text"
              value={daoAddress}
              onChange={(e) => setDaoAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={connectToDAO}
              disabled={isInitializing}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 flex items-center"
            >
              {isInitializing ? (
                <>
                  <Loading size="sm" />
                  <span className="ml-2">连接中...</span>
                </>
              ) : (
                '连接 DAO'
              )}
            </button>
            
            <button
              onClick={resetDAO}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              重新设置
            </button>
          </div>
        </div>
      )}

      {step === 'ready' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-green-700 text-sm">
              ✅ DAO 已连接: {daoAddress.slice(0, 6)}...{daoAddress.slice(-4)}
            </p>
          </div>
          
          <button
            onClick={resetDAO}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            更换 DAO
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded">
        <h4 className="text-sm font-medium text-blue-900 mb-2">ℹ️ 说明</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 创建新 DAO 会部署智能合约（需要 gas 费）</li>
          <li>• DAO 使用代币投票进行女性历史故事认可</li>
          <li>• 创建者将获得初始 SHE 治理代币</li>
          <li>• 所有女性历史故事将通过社区认可</li>
        </ul>
      </div>
    </div>
  );
};