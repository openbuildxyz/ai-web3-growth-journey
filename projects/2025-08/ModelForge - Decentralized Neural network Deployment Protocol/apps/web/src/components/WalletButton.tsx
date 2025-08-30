'use client';

import { useWallet } from '@/hooks/useWallet';

interface WalletButtonProps {
    variant?: 'default' | 'compact';
    className?: string;
}

export default function WalletButton({ variant = 'default', className = '' }: WalletButtonProps) {
    const { isConnected, address, balance, network, isConnecting, connectWallet, disconnectWallet, error } = useWallet(); const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (isConnected && address) {
        return (
            <div className={`relative group ${className}`}>
                <button
                    onClick={disconnectWallet}
                    className={`cyber-button font-mono uppercase tracking-wider neon-glow-green transform transition-all duration-300 hover:scale-105 ${variant === 'compact' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'
                        }`}
                >
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <div>
                            <div className="text-xs opacity-75">WALLET_CONNECTED</div>
                            <div className="font-bold">{truncateAddress(address)}</div>
                            {balance && variant === 'default' && (
                                <div className="text-xs opacity-75">{balance}</div>
                            )}
                            {network && variant === 'default' && (
                                <div className="text-xs opacity-60">{network}</div>
                            )}
                        </div>
                    </div>
                </button>

                {/* Wallet Info Tooltip */}
                <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg p-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 z-50">
                    <div className="font-mono text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Address:</span>
                            <span className="text-green-400">{address}</span>
                        </div>
                        {balance && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Balance:</span>
                                <span className="text-blue-400">{balance}</span>
                            </div>
                        )}
                        {network && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Network:</span>
                                <span className="text-purple-400">{network}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className="text-green-400">CONNECTED</span>
                        </div>
                        <div className="pt-2 border-t border-gray-700">
                            <button
                                onClick={disconnectWallet}
                                className="w-full py-2 bg-red-600 hover:bg-red-700 rounded font-mono text-xs uppercase tracking-wider transition-colors"
                            >
                                DISCONNECT_WALLET
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <button
                onClick={connectWallet}
                disabled={isConnecting}
                className={`cyber-button font-mono uppercase tracking-wider neon-glow-blue transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${variant === 'compact' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'
                    }`}
            >
                {isConnecting ? (
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>CONNECTING...</span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>CONNECT_WALLET</span>
                    </div>
                )}
            </button>

            {error && (
                <div className="mt-2 p-2 bg-red-900 border border-red-600 rounded text-red-300 font-mono text-xs">
                    <div className="uppercase tracking-wider mb-1">[ERROR]</div>
                    {error}
                </div>
            )}
        </div>
    );
}
