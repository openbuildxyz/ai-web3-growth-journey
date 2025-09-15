'use client';

import { useState, useEffect, useCallback } from 'react';
import WalletConnect from '@/components/WalletConnect';
import InsuranceCard from '@/components/InsuranceCard';
import { InsuranceInfo } from '@/types/insurance';
import { 
  getInsuranceManagerContract, 
  getUSDCContract, 
  formatUSDC, 
  parseUSDC,
  generateInsuranceId,
  CONTRACTS
} from '@/lib/web3';

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [insurances, setInsurances] = useState<InsuranceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 已部署的保险数据 - 与合约中实际创建的保险对应
  const mockInsurances = [
    { country: 'China', disasterType: 'Typhoon', month: 9, year: 2025 },
    { country: 'Japan', disasterType: 'Earthquake', month: 10, year: 2025 },
    { country: 'India', disasterType: 'Flood', month: 11, year: 2025 },
    { country: 'Philippines', disasterType: 'Typhoon', month: 12, year: 2025 },
    { country: 'USA', disasterType: 'Hurricane', month: 9, year: 2025 },
  ];

  // 获取保险信息
  const fetchInsuranceInfo = useCallback(async (country: string, disasterType: string, month: number, year: number) => {
    try {
      const contract = await getInsuranceManagerContract();
      const insuranceId = await generateInsuranceId(country, disasterType, month, year);
      
      // 调用合约获取保险信息
      const info = await contract.insuranceInfos(insuranceId);
      
      return {
        country: info[0],
        disasterType: info[1],
        month: Number(info[2]),
        year: Number(info[3]),
        exists: info[4],
        disasterHappened: info[5],
        totalPool: formatUSDC(info[6]),
        totalShares: formatUSDC(info[7]),
        claimRatio: Number(info[8]),
        poolProcessed: info[9],
        inheritedAmount: formatUSDC(info[10]),
        insuranceId: insuranceId,
      };
    } catch (error) {
      console.error('获取保险信息失败:', error);
      // 返回默认数据
      const insuranceId = await generateInsuranceId(country, disasterType, month, year);
      return {
        country,
        disasterType,
        month,
        year,
        exists: false,
        disasterHappened: false,
        totalPool: '0',
        totalShares: '0',
        claimRatio: 0,
        poolProcessed: false,
        inheritedAmount: '0',
        insuranceId,
      };
    }
  }, []);

  // 加载所有保险数据
  const loadInsurances = useCallback(async () => {
    if (!account) return;
    
    setRefreshing(true);
    try {
      const insurancePromises = mockInsurances.map(insurance => 
        fetchInsuranceInfo(insurance.country, insurance.disasterType, insurance.month, insurance.year)
      );
      
      const insuranceData = await Promise.all(insurancePromises);
      setInsurances(insuranceData);
    } catch (error) {
      console.error('加载保险数据失败:', error);
    } finally {
      setRefreshing(false);
    }
  }, [account, fetchInsuranceInfo, mockInsurances]);

  // 当账户连接时加载数据
  useEffect(() => {
    if (account) {
      loadInsurances();
    }
  }, [account, loadInsurances]);

  // 购买保险
  const handleBuyInsurance = async (insuranceId: string, amountStr: string) => {
    if (!account) {
      alert('请先连接钱包');
      return;
    }

    try {
      setLoading(true);
      
      // 获取合约实例
      const insuranceContract = await getInsuranceManagerContract();
      const usdcContract = await getUSDCContract();
      
      // 购买金额（从用户输入获取）
      const amount = parseUSDC(amountStr);
      
      // 检查USDC余额
      const balance = await usdcContract.balanceOf(account);
      if (balance < amount) {
        alert('USDC余额不足');
        return;
      }
      
      // 检查授权额度
      const allowance = await usdcContract.allowance(account, CONTRACTS.INSURANCE_MANAGER);
      if (allowance < amount) {
        alert('正在授权USDC...');
        const approveTx = await usdcContract.approve(CONTRACTS.INSURANCE_MANAGER, amount);
        await approveTx.wait();
        alert('授权成功！');
      }
      
      // 购买保险
      alert('正在购买保险...');
      const buyTx = await insuranceContract.buyInsurance(insuranceId, amount);
      await buyTx.wait();
      
      alert('购买成功！');
      
      // 刷新数据
      await loadInsurances();
      
    } catch (error: any) {
      console.error('购买保险失败:', error);
      alert(error.message || '购买保险失败');
    } finally {
      setLoading(false);
    }
  };

  // 捐赠
  const handleDonate = async (insuranceId: string, amountStr: string) => {
    if (!account) {
      alert('请先连接钱包');
      return;
    }

    try {
      setLoading(true);
      
      // 获取合约实例
      const insuranceContract = await getInsuranceManagerContract();
      const usdcContract = await getUSDCContract();
      
      // 捐赠金额（从用户输入获取）
      const amount = parseUSDC(amountStr);
      
      // 检查USDC余额
      const balance = await usdcContract.balanceOf(account);
      if (balance < amount) {
        alert('USDC余额不足');
        return;
      }
      
      // 检查授权额度
      const allowance = await usdcContract.allowance(account, CONTRACTS.INSURANCE_MANAGER);
      if (allowance < amount) {
        alert('正在授权USDC...');
        const approveTx = await usdcContract.approve(CONTRACTS.INSURANCE_MANAGER, amount);
        await approveTx.wait();
        alert('授权成功！');
      }
      
      // 捐赠
      alert('正在处理捐赠...');
      const donateTx = await insuranceContract.donate(insuranceId, amount);
      await donateTx.wait();
      
      alert('捐赠成功！感谢您的支持！');
      
      // 刷新数据
      await loadInsurances();
      
    } catch (error: any) {
      console.error('捐赠失败:', error);
      alert(error.message || '捐赠失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🛡️ 链上保险系统
              </h1>
            </div>
            <WalletConnect onAccountChange={setAccount} />
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!account ? (
          // 未连接钱包状态
          <div className="text-center py-16">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                欢迎使用链上保险系统
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                为自然灾害提供去中心化保险保障
              </p>
              <div className="text-lg text-gray-700 space-y-2">
                <p>🌪️ 台风保险 | 🏔️ 地震保险 | 🌊 洪水保险</p>
                <p>💝 支持捐赠 | 🔄 资金继承 | 🛡️ 智能理赔</p>
              </div>
            </div>
            <p className="text-gray-600">请连接您的 MetaMask 钱包以开始使用</p>
          </div>
        ) : (
          // 已连接钱包状态
          <div>
            {/* 页面标题和刷新按钮 */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  可购买的保险
                </h2>
                <p className="text-gray-600">
                  选择您需要的保险类型，为未来的灾害风险提供保障
                </p>
              </div>
              <button
                onClick={loadInsurances}
                disabled={refreshing}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {refreshing ? '刷新中...' : '🔄 刷新'}
              </button>
            </div>

            {/* 合约地址提示 */}
            {CONTRACTS.INSURANCE_MANAGER === '0x0000000000000000000000000000000000000000' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      ⚠️ 配置提醒
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>请在 <code>src/lib/web3.ts</code> 中设置正确的合约地址后再使用。</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 保险卡片网格 */}
            {insurances.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insurances.map((insurance, index) => (
                  <InsuranceCard
                    key={`${insurance.country}-${insurance.disasterType}-${insurance.month}-${insurance.year}`}
                    insurance={insurance}
                    onBuy={handleBuyInsurance}
                    onDonate={handleDonate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  暂无可用保险
                </h3>
                <p className="text-gray-600">
                  请稍后刷新页面或联系管理员
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              ⚡ 基于以太坊的去中心化保险系统 | 🔐 智能合约保障资金安全
            </p>
            <p className="text-sm text-gray-500 mt-2">
              © 2025 链上保险系统. 保险有风险，投保需谨慎。
            </p>
          </div>
        </div>
      </footer>

      {/* 加载遮罩 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">处理中，请稍候...</p>
          </div>
        </div>
      )}
    </div>
  );
}
