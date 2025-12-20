'use client';

import { useState } from 'react';
import { usePaymentStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Globe, DollarSign, Link as LinkIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import BioAuthModal from '@/components/BioAuthModal';

export default function Config402Page() {
  const { payment402Config, update402Config } = usePaymentStore();

  const [resourceName, setResourceName] = useState(payment402Config.resourceName);
  const [amount, setAmount] = useState(payment402Config.amount.toString());
  const [currency, setCurrency] = useState(payment402Config.currency);
  const [chain, setChain] = useState(payment402Config.chain);
  const [recipientAddress, setRecipientAddress] = useState(payment402Config.recipientAddress);
  const [description, setDescription] = useState(payment402Config.description);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 直接保存配置，不需要生物识别
    update402Config({
      resourceName,
      amount: parseFloat(amount),
      currency,
      chain,
      recipientAddress,
      description,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setResourceName(payment402Config.resourceName);
    setAmount(payment402Config.amount.toString());
    setCurrency(payment402Config.currency);
    setChain(payment402Config.chain);
    setRecipientAddress(payment402Config.recipientAddress);
    setDescription(payment402Config.description);
  };

  return (
    <div className="min-h-screen bg-gray-950 dark">
      {/* 顶部导航栏 */}
      <header className="bg-gray-900 border-b border-gray-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回授权管理 / Back to Auth
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Globe className="w-8 h-8 text-purple-400" />
              402资源配置 / 402 Resource Config
            </h1>
          </div>
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            HTTP 402 协议 / HTTP 402 Protocol
          </Badge>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="container mx-auto p-8 max-w-4xl">
        {/* 当前配置概览 */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-xl">当前资源配置 / Current Config</CardTitle>
            <CardDescription className="text-gray-400">
              查看当前402协议受保护资源的配置信息 / View current 402 protected resource configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm">资源名称 / Resource</span>
                </div>
                <p className="text-white text-lg font-semibold">
                  {payment402Config.resourceName}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm">支付金额 / Amount</span>
                </div>
                <p className="text-white text-lg font-semibold">
                  {payment402Config.amount} {payment402Config.currency}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-sm">区块链 / Chain</span>
                </div>
                <p className="text-white text-lg font-semibold">
                  {payment402Config.chain}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400 text-sm">收款地址 / Address</span>
                </div>
                <p className="text-white text-xs font-mono break-all">
                  {payment402Config.recipientAddress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 配置设置表单 */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-xl">编辑资源配置 / Edit Config</CardTitle>
            <CardDescription className="text-gray-400">
              修改402协议受保护资源的参数 / Modify 402 protected resource parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 资源名称 */}
            <div className="space-y-3">
              <Label htmlFor="resourceName" className="text-white text-base">
                资源名称 / Resource Name
              </Label>
              <Input
                id="resourceName"
                type="text"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Premium AI Content"
              />
              <p className="text-gray-400 text-sm">
                设置受保护资源的显示名称 / Set the display name for the protected resource
              </p>
            </div>

            {/* 支付金额 */}
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-white text-base">
                支付金额 / Payment Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="5"
              />
              <p className="text-gray-400 text-sm">
                访问此资源所需的支付金额 / Amount required to access this resource
              </p>
            </div>

            {/* 货币类型 */}
            <div className="space-y-3">
              <Label htmlFor="currency" className="text-white text-base">
                货币类型 / Currency
              </Label>
              <Input
                id="currency"
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="USDC"
              />
              <p className="text-gray-400 text-sm">
                支付使用的货币类型 / Currency type for payment
              </p>
            </div>

            {/* 区块链 */}
            <div className="space-y-3">
              <Label htmlFor="chain" className="text-white text-base">
                区块链 / Blockchain
              </Label>
              <Input
                id="chain"
                type="text"
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Ethereum"
              />
              <p className="text-gray-400 text-sm">
                支付所在的区块链网络 / Blockchain network for payment
              </p>
            </div>

            {/* 收款地址 */}
            <div className="space-y-3">
              <Label htmlFor="recipientAddress" className="text-white text-base">
                收款地址 / Recipient Address
              </Label>
              <Input
                id="recipientAddress"
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
                placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
              />
              <p className="text-gray-400 text-sm">
                接收支付的区块链地址 / Blockchain address to receive payment
              </p>
            </div>

            {/* 资源描述 */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-white text-base">
                资源描述 / Description
              </Label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Access to premium AI-generated content"
              />
              <p className="text-gray-400 text-sm">
                资源的详细描述信息 / Detailed description of the resource
              </p>
            </div>

            {/* 保存按钮 */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saved ? '✓ 配置已保存 / Config Saved' : '保存配置 / Save Config'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="text-gray-400 border-gray-700 hover:bg-gray-800"
              >
                重置 / Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 402协议说明 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-xl">HTTP 402 协议说明 / About HTTP 402</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-gray-300 space-y-3">
              <p className="text-sm leading-relaxed">
                <span className="text-white font-semibold">HTTP 402 Payment Required</span> 是HTTP协议中预留的状态码，专门用于需要付费才能访问的资源。
                / <span className="text-white font-semibold">HTTP 402 Payment Required</span> is a reserved HTTP status code specifically designed for resources that require payment to access.
              </p>

              <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                <h4 className="text-white font-semibold">工作流程 / Workflow:</h4>
                <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                  <li>客户端请求受保护资源 / Client requests protected resource</li>
                  <li>服务器返回402状态码及支付信息 / Server returns 402 with payment info</li>
                  <li>客户端完成支付并获得凭证 / Client completes payment and gets proof</li>
                  <li>客户端携带凭证重新请求 / Client requests again with payment proof</li>
                  <li>服务器验证凭证并返回资源 / Server verifies and returns resource</li>
                </ol>
              </div>

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-200 text-sm leading-relaxed">
                  💡 在BioAuthPay中，我们将402协议与EIP-7951生物识别授权结合，实现了安全、便捷的微支付流程。
                  / In BioAuthPay, we combine the 402 protocol with EIP-7951 biometric authorization to achieve secure and convenient micropayments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
