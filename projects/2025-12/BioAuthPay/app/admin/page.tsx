'use client';

import { useState } from 'react';
import { usePaymentStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, DollarSign, AlertCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import BioAuthModal from '@/components/BioAuthModal';

export default function AdminPage() {
  const { authConfig, updateAuthConfig, showBioAuthModal, setShowBioAuthModal } = usePaymentStore();

  const [totalAmount, setTotalAmount] = useState(authConfig.totalAuthorizedAmount.toString());
  const [threshold, setThreshold] = useState(authConfig.singlePaymentThreshold.toString());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 显示生物识别授权模态框
    setShowBioAuthModal(true);
  };

  const handleAuthSuccess = () => {
    // 授权成功后保存配置
    updateAuthConfig({
      totalAuthorizedAmount: parseFloat(totalAmount),
      singlePaymentThreshold: parseFloat(threshold),
      usedAmount: 0, // 重置已使用金额
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const remainingAmount = authConfig.totalAuthorizedAmount - authConfig.usedAmount;
  const usagePercentage = (authConfig.usedAmount / authConfig.totalAuthorizedAmount) * 100;

  return (
    <div className="min-h-screen bg-gray-950 dark">
      {/* 顶部导航栏 */}
      <header className="bg-gray-900 border-b border-gray-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回主页 / Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              授权管理 / Authorization Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/402-config">
              <Button
                variant="outline"
                size="sm"
                className="text-purple-400 border-purple-700 hover:bg-purple-900/20"
              >
                <Globe className="w-4 h-4 mr-2" />
                402资源配置 / 402 Config
              </Button>
            </Link>
            <Badge variant="outline" className="text-green-400 border-green-400">
              管理员模式 / Admin Mode
            </Badge>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="container mx-auto p-8 max-w-4xl">
        {/* 当前授权状态概览 */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-xl">当前授权状态 / Current Authorization Status</CardTitle>
            <CardDescription className="text-gray-400">
              查看您的授权额度使用情况 / View your authorization quota usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 额度使用进度条 */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">已使用额度 / Used Quota</span>
                <span className="text-white font-semibold">
                  {authConfig.usedAmount} / {authConfig.totalAuthorizedAmount} USDC
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    usagePercentage > 80 ? 'bg-red-500' :
                    usagePercentage > 50 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">剩余额度 / Remaining Quota</span>
                <span className={`font-semibold ${
                  remainingAmount < 100 ? 'text-red-400' :
                  remainingAmount < 300 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {remainingAmount.toFixed(2)} USDC
                </span>
              </div>
            </div>

            {/* 配置信息 */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">总授权额度 / Total Quota</span>
                </div>
                <p className="text-white text-2xl font-bold">
                  {authConfig.totalAuthorizedAmount} USDC
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400 text-sm">单次授权阈值 / Single Threshold</span>
                </div>
                <p className="text-white text-2xl font-bold">
                  {authConfig.singlePaymentThreshold} USDC
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 配置设置 */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-xl">授权配置 / Authorization Config</CardTitle>
            <CardDescription className="text-gray-400">
              配置您的支付授权策略 / Configure your payment authorization policy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 总授权额度 */}
            <div className="space-y-3">
              <Label htmlFor="totalAmount" className="text-white text-base">
                总授权额度 (USDC) / Total Authorization Quota (USDC)
              </Label>
              <Input
                id="totalAmount"
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="1000"
              />
              <p className="text-gray-400 text-sm">
                设置一次性授权的总金额。在此额度用完之前，符合条件的支付将自动执行，无需重新授权。
                / Set the total amount for one-time authorization. Payments will execute automatically until this quota is depleted.
              </p>
            </div>

            {/* 单次支付阈值 */}
            <div className="space-y-3">
              <Label htmlFor="threshold" className="text-white text-base">
                单次支付阈值 (USDC) / Single Payment Threshold (USDC)
              </Label>
              <Input
                id="threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="500"
              />
              <p className="text-gray-400 text-sm">
                当单次支付金额超过此阈值时，即使总授权额度充足，也需要重新进行生物识别授权。
                / When a single payment exceeds this threshold, biometric re-authorization is required even if total quota is sufficient.
              </p>
            </div>

            {/* 安全提示 */}
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-semibold mb-1">安全建议 / Security Tips</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• 建议总授权额度不超过您月度消费预算 / Keep total quota within your monthly budget</li>
                    <li>• 单次阈值应设置为您认为需要额外确认的金额 / Set threshold at amount requiring extra confirmation</li>
                    <li>• 定期查看和调整授权配置以保持最佳安全性 / Review and adjust regularly for optimal security</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 保存按钮 */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saved ? '✓ 配置已保存 / Config Saved' : '保存配置（需生物识别）/ Save (Bio Auth Required)'}
              </Button>
              <Button
                onClick={() => {
                  setTotalAmount(authConfig.totalAuthorizedAmount.toString());
                  setThreshold(authConfig.singlePaymentThreshold.toString());
                }}
                variant="outline"
                className="text-gray-400 border-gray-700 hover:bg-gray-800"
              >
                重置 / Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 工作原理说明 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-xl">工作原理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-gray-300 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">初始授权</h4>
                  <p className="text-sm text-gray-400">
                    首次授权时，您通过生物识别（指纹/Face ID）授权一个总金额池（如1000 USDC）。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">自动支付</h4>
                  <p className="text-sm text-gray-400">
                    当AI检测到支付需求时，如果金额在阈值内且总额度充足，将自动使用x402协议完成支付，无需您再次确认。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">触发重新授权</h4>
                  <p className="text-sm text-gray-400">
                    当单次支付超过阈值，或总授权额度不足时，系统会要求您重新进行生物识别授权。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 生物识别授权模态框 */}
      <BioAuthModal
        isOpen={showBioAuthModal}
        onClose={() => setShowBioAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title="保存授权配置需要确认 / Authorization Config Confirmation"
        description="修改授权额度和阈值需要生物识别授权 / Modifying authorization quota and threshold requires biometric authorization"
      />
    </div>
  );
}
