import { useSwitchNetwork, useNetwork } from 'wagmi';

export const NetworkSwitch = () => {
  const { chain } = useNetwork();
  const { chains, switchNetwork, isLoading, pendingChainId } = useSwitchNetwork();

  const supportedNetworks = [
    { id: 1, name: 'Ethereum', color: 'bg-blue-500' },
    { id: 11155111, name: 'Sepolia', color: 'bg-purple-500' },
    { id: 137, name: 'Polygon', color: 'bg-purple-600' }
  ];

  const currentNetwork = supportedNetworks.find(n => n.id === chain?.id);
  const isWrongNetwork = chain && !supportedNetworks.some(n => n.id === chain.id);

  if (isWrongNetwork) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-800">网络不支持</h3>
            <p className="text-sm text-red-600">请切换到支持的网络</p>
          </div>
          <div className="flex flex-col space-y-1">
            {supportedNetworks.map((network) => (
              <button
                key={network.id}
                onClick={() => switchNetwork?.(network.id)}
                disabled={!switchNetwork || isLoading}
                className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 disabled:opacity-50"
              >
                {isLoading && pendingChainId === network.id ? '切换中...' : network.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${currentNetwork?.color || 'bg-gray-400'} mr-2`}></div>
        <span className="text-sm font-medium text-green-800">
          已连接到 {currentNetwork?.name || chain?.name || '未知网络'}
        </span>
      </div>
    </div>
  );
};