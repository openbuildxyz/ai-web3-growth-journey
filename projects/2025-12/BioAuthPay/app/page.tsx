'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePaymentStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, CheckCircle, ExternalLink, FileText, Settings } from 'lucide-react';
import BioAuthModal from '@/components/BioAuthModal';

export default function Home() {
  // 防止hydration错误：仅在客户端挂载后显示时间
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 从store获取状态和方法
  const {
    currentStep,
    paymentRequest,
    authorizationStatus,
    transactionHash,
    logs,
    selectedDevice,
    blockNumber,
    gasUsed,
    showDetailedAudit,
    payment402Config,
    showBioAuthModal,
    setSelectedDevice,
    setShowBioAuthModal,
    simulateAIRequest,
    simulateBiometricAuth,
    viewDetailedAuditLogs,
    resetDemo,
  } = usePaymentStore();

  // 步骤指示器组件
  const StepIndicator = () => {
    const steps = [
      { number: 1, title: 'AI请求生成\nAI Request' },
      { number: 2, title: '生物识别授权\nBio Auth' },
      { number: 3, title: '支付完成与审计\nPayment & Audit' },
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step.number}
              </div>
              <span
                className={`mt-2 text-sm ${
                  currentStep >= step.number ? 'text-blue-400' : 'text-gray-500'
                }`}
                style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 transition-all ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 dark">
      {/* 顶部导航栏 */}
      <header className="bg-gray-900 border-b border-gray-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🔐</span>
            BioPay PACT Demo
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-400 border-green-400">
              EIP-7951 + x402
            </Badge>
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-400 border-gray-700 hover:bg-gray-800"
              >
                <Settings className="w-4 h-4 mr-2" />
                授权管理 / Auth Admin
              </Button>
            </Link>
            {currentStep > 1 && (
              <Button
                onClick={resetDemo}
                variant="outline"
                size="sm"
                className="text-gray-400 border-gray-700 hover:bg-gray-800"
              >
                🔄 重置演示 / Reset Demo
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="container mx-auto p-8">
        <div className="flex gap-6">
          {/* 左栏：支付授权控制台 (70%) */}
          <div className="flex-[7]">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-2xl">支付授权控制台 / Payment Authorization Console</CardTitle>
                <CardDescription className="text-gray-400">
                  基于设备原生安全的AI代理支付授权流程 / AI agent payment authorization with device-native security
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 步骤进度条 */}
                <StepIndicator />

                {/* 步骤一：AI请求生成 */}
                {currentStep >= 1 && (
                  <Card className="bg-gray-800 border-gray-700 mb-6">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        AI代理检测到支付需求
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300">
                        您的AI助手检测到需要访问受保护的资源：&apos;{payment402Config.resourceName}&apos;，需要支付以获取访问权限。
                        / Your AI agent detected a need to access the protected resource: &apos;{payment402Config.resourceName}&apos;, payment is required for access.
                      </p>

                      {/* 支付详情表格 */}
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-white font-semibold mb-3">支付详情 / Payment Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">资源名称 / Resource:</span>
                            <span className="text-white font-medium">
                              {paymentRequest?.service || payment402Config.resourceName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">金额 / Amount:</span>
                            <span className="text-green-400 font-bold">
                              {paymentRequest?.amount || `${payment402Config.amount} ${payment402Config.currency}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">区块链 / Chain:</span>
                            <span className="text-purple-400 font-medium">
                              {payment402Config.chain}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">收款地址 / Recipient:</span>
                            <span className="text-blue-400 font-mono text-sm">
                              {paymentRequest?.toAddress || payment402Config.recipientAddress}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">请求时间 / Time:</span>
                            <span className="text-white">
                              {mounted && (paymentRequest?.timestamp || new Date().toLocaleString())}
                              {!mounted && '加载中...'}
                            </span>
                          </div>
                          {paymentRequest && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">请求ID:</span>
                              <span className="text-purple-400 font-mono text-sm">
                                {paymentRequest.id}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 生成支付请求按钮 */}
                      {currentStep === 1 && (
                        <Button
                          onClick={simulateAIRequest}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          🔗 生成x402支付请求
                        </Button>
                      )}

                      {paymentRequest && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          支付请求已生成，状态: {paymentRequest.status}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 步骤三：支付完成与审计 */}
                {currentStep >= 3 && (
                  <Card className="bg-gray-800 border-gray-700 mb-6">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                        支付成功！
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 成功动画 */}
                      <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-700 rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <CheckCircle className="w-24 h-24 text-green-400 animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-32 h-32 border-4 border-green-400 rounded-full animate-ping opacity-20"></div>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-green-400 text-3xl font-bold mb-2">
                          支付成功！
                        </h3>
                        <p className="text-green-200 text-lg">
                          您的 Netflix 链上订阅已成功续费
                        </p>
                      </div>

                      {/* 支付详情卡片 */}
                      <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          支付详情
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">服务:</span>
                            <span className="text-white font-medium">{paymentRequest?.service}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">金额:</span>
                            <span className="text-green-400 font-bold text-lg">{paymentRequest?.amount}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-gray-400">收款地址:</span>
                            <span className="text-blue-400 font-mono text-sm text-right">
                              {paymentRequest?.toAddress}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">授权方式:</span>
                            <span className="text-white">{selectedDevice}</span>
                          </div>
                        </div>
                      </div>

                      {/* 交易哈希卡片 */}
                      {transactionHash && (
                        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-5">
                          <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                            <ExternalLink className="w-5 h-5" />
                            模拟交易哈希
                          </h4>
                          <div className="space-y-3">
                            <div className="bg-black/50 rounded p-3 font-mono text-xs break-all text-purple-300">
                              {transactionHash}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-gray-400 text-sm">区块号:</span>
                                <p className="text-white font-semibold">#{blockNumber}</p>
                              </div>
                              <div>
                                <span className="text-gray-400 text-sm">Gas 消耗:</span>
                                <p className="text-white font-semibold">{gasUsed} units</p>
                              </div>
                            </div>
                            <p className="text-purple-200 text-sm leading-relaxed">
                              💡 此哈希可在测试网区块链浏览器上查询，作为<span className="text-purple-400 font-semibold">不可篡改的审计凭证</span>。
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 审计追踪 */}
                      <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                        <h4 className="text-white font-semibold mb-3">🔍 审计追踪</h4>
                        <div className="text-sm text-gray-300 space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>AI代理请求已验证</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>生物识别授权通过</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>设备签名验证成功</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>区块链交易已确认</span>
                          </div>
                        </div>
                      </div>

                      {/* 查看完整审计日志按钮 */}
                      <Button
                        onClick={viewDetailedAuditLogs}
                        disabled={showDetailedAudit}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        {showDetailedAudit ? '✓ 已显示完整审计日志' : '📜 查看完整审计日志'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右栏：系统状态与日志 (30%) */}
          <div className="flex-[3]">
            <Card className="bg-gray-900 border-gray-800 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white text-xl">系统状态与日志</CardTitle>
                <CardDescription className="text-gray-400">
                  实时监控区块链交易和事件
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black rounded-lg p-4 font-mono text-xs h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`mb-2 leading-relaxed ${
                        log.includes('[Audit]') ? 'text-yellow-400' :
                        log.includes('[x402') ? 'text-cyan-400' :
                        log.includes('[EIP-7951]') ? 'text-purple-400' :
                        log.includes('[Blockchain]') ? 'text-blue-400' :
                        log.includes('✓') ? 'text-green-400' :
                        log.includes('===') ? 'text-yellow-300 font-bold' :
                        'text-green-400'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                  {logs.length > 0 && (
                    <div className="text-green-400 animate-pulse">▊</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* 生物识别授权模态框 */}
      <BioAuthModal
        isOpen={showBioAuthModal}
        onClose={() => setShowBioAuthModal(false)}
        onSuccess={simulateBiometricAuth}
        title="支付授权确认 / Payment Authorization"
        description="此次支付需要生物识别授权 / This payment requires biometric authorization"
      />
    </div>
  );
}
