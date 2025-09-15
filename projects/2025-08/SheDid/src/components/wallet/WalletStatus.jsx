import { useWalletStatus } from '../../hooks/useWalletStatus';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const WalletStatus = ({ children, requireConnection = true }) => {
  const { isConnected, isConnecting, isWrongNetwork, canInteract } = useWalletStatus();

  // 如果不需要连接，直接渲染子组件
  if (!requireConnection) {
    return children;
  }

  // 连接中状态
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">连接钱包中...</p>
      </div>
    );
  }

  // 未连接状态
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">连接钱包</h3>
        <p className="text-gray-600 text-center mb-6">
          请连接您的钱包以使用此功能
        </p>
        <ConnectButton />
      </div>
    );
  }

  // 网络错误状态
  if (isWrongNetwork) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">网络不支持</h3>
        <p className="text-gray-600 text-center mb-6">
          请切换到支持的网络（Ethereum、Sepolia 或 Polygon）
        </p>
        <ConnectButton />
      </div>
    );
  }

  // 一切正常，渲染子组件
  if (canInteract) {
    return children;
  }

  // 默认加载状态
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
};