'use client';

import { InsuranceCardProps, DISASTER_TYPES, COUNTRIES } from '@/types/insurance';
import { useState } from 'react';

export default function InsuranceCard({ insurance, onBuy, onDonate }: InsuranceCardProps) {
  const [buyAmount, setBuyAmount] = useState('100');
  const [donateAmount, setDonateAmount] = useState('50');
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      alert('请输入有效的购买金额');
      return;
    }
    setLoading(true);
    try {
      await onBuy(insurance.insuranceId, buyAmount);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      alert('请输入有效的捐赠金额');
      return;
    }
    setLoading(true);
    try {
      await onDonate(insurance.insuranceId, donateAmount);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayCountry = (country: string) => {
    return COUNTRIES[country as keyof typeof COUNTRIES] || country;
  };

  const getDisplayDisaster = (disasterType: string) => {
    return DISASTER_TYPES[disasterType as keyof typeof DISASTER_TYPES] || disasterType;
  };

  const getStatusBadge = () => {
    if (insurance.disasterHappened) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
          ⚠️ 已发生灾害
        </span>
      );
    }
    if (insurance.poolProcessed) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
          ✅ 已处理
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
        🟢 可购买
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        {/* 头部信息 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {getDisplayCountry(insurance.country)} {getDisplayDisaster(insurance.disasterType)}
            </h3>
            <p className="text-sm text-gray-600">
              📅 保险期间: {insurance.year}年{insurance.month}月
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">总保险池</p>
            <p className="text-lg font-bold text-blue-900">{insurance.totalPool} USDC</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">继承资金</p>
            <p className="text-lg font-bold text-purple-900">{insurance.inheritedAmount} USDC</p>
          </div>
        </div>

        {/* 额外信息 */}
        {insurance.claimRatio > 0 && (
          <div className="bg-yellow-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-yellow-600 font-medium">理赔比例</p>
            <p className="text-lg font-bold text-yellow-900">{insurance.claimRatio}%</p>
          </div>
        )}

        {/* 操作区域 */}
        {!insurance.disasterHappened && !insurance.poolProcessed && (
          <div className="space-y-4">
            {/* 购买保险 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💰 购买保险
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="输入USDC金额"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? '处理中...' : '购买'}
                </button>
              </div>
            </div>

            {/* 捐赠 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💝 捐赠支持
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  placeholder="输入捐赠金额"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={handleDonate}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? '处理中...' : '捐赠'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 已结束状态信息 */}
        {(insurance.disasterHappened || insurance.poolProcessed) && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-600">
              {insurance.disasterHappened 
                ? '该保险期间已发生灾害，可申请理赔' 
                : '该保险期间已结束，资金已处理'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 