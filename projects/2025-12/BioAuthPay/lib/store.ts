import { create } from 'zustand';

// 支付请求类型定义
export interface PaymentRequest {
  id: string;
  service: string;
  amount: string;
  toAddress: string;
  status: 'pending' | 'authorized' | 'completed' | 'rejected';
  timestamp: string;
}

// 授权状态类型
export type AuthorizationStatus = 'idle' | 'pending' | 'authorized' | 'rejected';

// 设备类型
export type DeviceType = 'iPhone Face ID' | 'Android Fingerprint' | 'Windows Hello' | 'Mac Touch ID';

// 授权配置
export interface AuthConfig {
  totalAuthorizedAmount: number; // 一次性授权总额（USDC）
  usedAmount: number; // 已使用金额
  singlePaymentThreshold: number; // 单次支付阈值，超过此金额需要重新授权
}

// 402资源配置
export interface Payment402Config {
  resourceName: string; // 资源名称
  amount: number; // 金额
  currency: string; // 货币类型
  chain: string; // 区块链
  recipientAddress: string; // 收款地址
  description: string; // 描述
}

// Store状态接口
interface PaymentStore {
  // 状态
  currentStep: number;
  paymentRequest: PaymentRequest | null;
  authorizationStatus: AuthorizationStatus;
  transactionHash: string | null;
  logs: string[];
  selectedDevice: DeviceType;
  showDetailedAudit: boolean;
  blockNumber: number | null;
  gasUsed: string | null;
  authConfig: AuthConfig;
  payment402Config: Payment402Config;
  showBioAuthModal: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  setPaymentRequest: (request: PaymentRequest) => void;
  setAuthorizationStatus: (status: AuthorizationStatus) => void;
  setTransactionHash: (hash: string) => void;
  addLog: (log: string) => void;
  setSelectedDevice: (device: DeviceType) => void;
  setShowDetailedAudit: (show: boolean) => void;
  updateAuthConfig: (config: Partial<AuthConfig>) => void;
  update402Config: (config: Partial<Payment402Config>) => void;
  checkAuthRequired: (amount: number) => boolean;
  setShowBioAuthModal: (show: boolean) => void;
  processPayment: (amount: number) => void;

  // 业务逻辑函数
  simulateAIRequest: () => void;
  simulateBiometricAuth: () => void;
  simulatePaymentExecution: () => void;
  viewDetailedAuditLogs: () => void;
  resetDemo: () => void;
}

// 创建store
export const usePaymentStore = create<PaymentStore>((set, get) => ({
  // 初始状态
  currentStep: 1,
  paymentRequest: null,
  authorizationStatus: 'idle',
  transactionHash: null,
  logs: [
    '[System] BioAuthPay Demo initialized',
    '[System] Monitoring AI agent activity...'
  ],
  selectedDevice: 'iPhone Face ID',
  showDetailedAudit: false,
  blockNumber: null,
  gasUsed: null,
  authConfig: {
    totalAuthorizedAmount: 1000, // 默认授权1000 USDC
    usedAmount: 0,
    singlePaymentThreshold: 500, // 默认500 USDC以上需要重新授权
  },
  payment402Config: {
    resourceName: 'Premium AI Content',
    amount: 5,
    currency: 'USDC',
    chain: 'Ethereum',
    recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    description: 'Access to premium AI-generated content',
  },
  showBioAuthModal: false,

  // Setters
  setCurrentStep: (step) => set({ currentStep: step }),
  setPaymentRequest: (request) => set({ paymentRequest: request }),
  setAuthorizationStatus: (status) => set({ authorizationStatus: status }),
  setTransactionHash: (hash) => set({ transactionHash: hash }),
  addLog: (log) => set((state) => ({
    logs: [...state.logs, `[${new Date().toLocaleTimeString()}] ${log}`]
  })),
  setSelectedDevice: (device) => set({ selectedDevice: device }),
  setShowDetailedAudit: (show) => set({ showDetailedAudit: show }),
  updateAuthConfig: (config) => set((state) => ({
    authConfig: { ...state.authConfig, ...config }
  })),
  update402Config: (config) => set((state) => ({
    payment402Config: { ...state.payment402Config, ...config }
  })),
  setShowBioAuthModal: (show) => set({ showBioAuthModal: show }),

  // 处理支付并扣除额度
  processPayment: (amount) => {
    set((state) => ({
      authConfig: {
        ...state.authConfig,
        usedAmount: state.authConfig.usedAmount + amount,
      },
    }));
  },

  // 检查是否需要授权
  checkAuthRequired: (amount) => {
    const { authConfig } = get();
    const remainingAmount = authConfig.totalAuthorizedAmount - authConfig.usedAmount;

    // 如果单次金额超过阈值，需要授权
    if (amount > authConfig.singlePaymentThreshold) {
      return true;
    }

    // 如果剩余额度不足，需要授权
    if (remainingAmount < amount) {
      return true;
    }

    return false;
  },

  // 模拟AI检测到支付需求并生成x402请求（使用当前的402配置）
  simulateAIRequest: async () => {
    const requestId = `0x${Math.random().toString(16).substring(2, 10)}`;
    const { payment402Config, authConfig, checkAuthRequired } = get();

    // 添加日志
    get().addLog('[AI Agent] 检测到支付需求，开始生成x402支付请求...');
    get().addLog(`[x402 Protocol] 资源: ${payment402Config.resourceName}`);
    get().addLog(`[x402 Protocol] 金额: ${payment402Config.amount} ${payment402Config.currency}`);

    // 创建支付请求对象
    const request: PaymentRequest = {
      id: requestId,
      service: payment402Config.resourceName,
      amount: `${payment402Config.amount} ${payment402Config.currency}`,
      toAddress: payment402Config.recipientAddress,
      status: 'pending',
      timestamp: new Date().toLocaleString(),
    };

    setTimeout(() => {
      get().addLog('[x402 Protocol] 创建支付请求对象');
      get().addLog(`[x402 Protocol] Request ID: ${requestId}`);

      // 检查是否需要生物识别授权
      const needsAuth = checkAuthRequired(payment402Config.amount);

      if (needsAuth) {
        get().addLog('[x402 Protocol] 金额超过阈值或额度不足，需要生物识别授权');
        get().addLog('[System] 请完成生物识别授权...');

        // 需要授权，设置为 pending 状态，显示授权弹窗
        set({
          paymentRequest: request,
          authorizationStatus: 'pending',
          currentStep: 2,
          showBioAuthModal: true,
        });
      } else {
        const remainingAmount = authConfig.totalAuthorizedAmount - authConfig.usedAmount;
        get().addLog(`[x402 Protocol] 金额在阈值内且额度充足（剩余: ${remainingAmount.toFixed(2)} USDC）`);
        get().addLog('[x402 Protocol] 自动授权，无需生物识别');

        // 不需要授权，直接标记为已授权并执行支付
        set({
          paymentRequest: { ...request, status: 'authorized' },
          authorizationStatus: 'authorized',
          currentStep: 3,
        });

        // 自动执行支付
        setTimeout(() => {
          get().simulatePaymentExecution();
        }, 1000);
      }
    }, 500);
  },

  // 模拟生物识别授权
  simulateBiometricAuth: () => {
    const device = get().selectedDevice;

    get().addLog(`[EIP-7951] 请求来自 ${device} 的生物识别授权...`);

    // 模拟生物识别过程
    setTimeout(() => {
      get().addLog(`[EIP-7951] ${device} 生物识别验证中...`);

      setTimeout(() => {
        // 生成模拟的secp256r1签名
        const mockSignature = `0x${Math.random().toString(16).substring(2, 66)}`;

        get().addLog(`[EIP-7951] 收到来自 ${device} 的 secp256r1 签名`);
        get().addLog(`[EIP-7951] 签名: ${mockSignature.substring(0, 20)}...`);
        get().addLog('[EIP-7951] 签名验证通过 ✓');
        get().addLog('[System] 授权成功，准备执行支付...');

        // 更新支付请求状态并关闭弹窗
        const request = get().paymentRequest;
        if (request) {
          set({
            paymentRequest: { ...request, status: 'authorized' },
            authorizationStatus: 'authorized',
            currentStep: 3,
            showBioAuthModal: false, // 关闭弹窗
          });
        }

        // 自动触发支付执行
        setTimeout(() => {
          get().simulatePaymentExecution();
        }, 1500);
      }, 1500);
    }, 800);
  },

  // 模拟支付执行
  simulatePaymentExecution: () => {
    get().addLog('[x402 Contract] 接收到授权的支付请求，开始处理...');

    setTimeout(() => {
      const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      const blockNum = Math.floor(Math.random() * 1000000) + 15000000;
      const gas = (Math.random() * 50000 + 21000).toFixed(0);
      const paymentAmount = get().payment402Config.amount;

      get().addLog('[x402 Contract] 验证签名和授权信息...');
      get().addLog('[Blockchain] 构建交易数据...');
      get().addLog(`[x402 Contract] 已从您的账户转账 ${get().paymentRequest?.amount} 至目标地址`);
      get().addLog('[Blockchain] 发送交易到网络...');

      // 扣除已使用金额
      get().processPayment(paymentAmount);
      get().addLog(`[System] 已扣除授权额度: ${paymentAmount} USDC`);
      get().addLog(`[System] 剩余授权额度: ${(get().authConfig.totalAuthorizedAmount - get().authConfig.usedAmount).toFixed(2)} USDC`);

      setTimeout(() => {
        get().addLog(`[Blockchain] 交易已确认: ${txHash.substring(0, 20)}...`);
        get().addLog(`[Blockchain] 区块号: #${blockNum}`);
        get().addLog('[x402 Contract] 支付完成，交易已上链 ✓');
        get().addLog('[System] 全部流程完成！');

        const request = get().paymentRequest;
        if (request) {
          set({
            paymentRequest: { ...request, status: 'completed' },
            transactionHash: txHash,
            blockNumber: blockNum,
            gasUsed: gas,
          });
        }
      }, 2000);
    }, 1000);
  },

  // 查看详细审计日志
  viewDetailedAuditLogs: () => {
    if (get().showDetailedAudit) return; // 防止重复点击

    set({ showDetailedAudit: true });

    get().addLog('');
    get().addLog('========== 📜 详细审计日志 ==========');
    get().addLog('[Audit] 开始深度审计追踪...');

    setTimeout(() => {
      const blockNum = get().blockNumber;
      const gasUsed = get().gasUsed;
      const txHash = get().transactionHash;

      get().addLog(`[Audit] 交易哈希: ${txHash}`);
      get().addLog(`[Audit] 区块号: #${blockNum}`);
      get().addLog(`[Audit] Gas 消耗: ${gasUsed} units`);
      get().addLog(`[Audit] Gas 价格: ${(Math.random() * 50 + 10).toFixed(2)} Gwei`);
      get().addLog('[Audit] 交易状态: SUCCESS ✓');

      setTimeout(() => {
        get().addLog('[Audit] 事件日志:');
        get().addLog('  → PaymentRequested(requestId, amount, recipient)');
        get().addLog('  → SignatureVerified(signer, signature)');
        get().addLog('  → Transfer(from, to, amount)');
        get().addLog('  → PaymentCompleted(txHash, timestamp)');

        setTimeout(() => {
          get().addLog('[Audit] 智能合约调用链:');
          get().addLog('  1. x402PaymentContract.executePayment()');
          get().addLog('  2. USDC.transfer()');
          get().addLog('  3. x402PaymentContract.emit(PaymentCompleted)');

          setTimeout(() => {
            get().addLog('[Audit] 安全验证:');
            get().addLog('  ✓ 生物识别签名验证通过');
            get().addLog('  ✓ secp256r1 椭圆曲线签名有效');
            get().addLog('  ✓ 授权时间戳在有效期内');
            get().addLog('  ✓ 交易Nonce正确');
            get().addLog('  ✓ Gas限制未超出');
            get().addLog('[Audit] 审计完成！所有验证通过 ✓');
            get().addLog('========================================');
          }, 800);
        }, 800);
      }, 800);
    }, 500);
  },

  // 重置演示
  resetDemo: () => {
    set({
      currentStep: 1,
      paymentRequest: null,
      authorizationStatus: 'idle',
      transactionHash: null,
      logs: [
        '[System] Demo reset',
        '[System] BioAuthPay Demo initialized',
        '[System] Monitoring AI agent activity...'
      ],
      selectedDevice: 'iPhone Face ID',
      showDetailedAudit: false,
      blockNumber: null,
      gasUsed: null,
    });
  },
}));
