import { useAccount, useBalance, useNetwork } from 'wagmi';

export const WalletInfo = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { chain } = useNetwork();

  if (!isConnected) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">钱包信息</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">地址:</span>
          <span className="font-mono text-gray-900">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">余额:</span>
          <span className="font-medium text-gray-900">
            {balance?.formatted ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '加载中...'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">网络:</span>
          <span className="font-medium text-gray-900">
            {chain?.name || '未知网络'}
          </span>
        </div>
      </div>
    </div>
  );
};