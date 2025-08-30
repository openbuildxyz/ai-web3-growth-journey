'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
    isConnected: boolean;
    address: string | null;
    balance: string | null;
    network: string | null;
    isConnecting: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    error: string | null;
}const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}

interface WalletProviderProps {
    children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);    // Check if wallet is already connected on page load
    useEffect(() => {
        checkWalletConnection();
    }, []);

    const checkWalletConnection = async () => {
        try {
            if (typeof window !== 'undefined' && window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                    setIsConnected(true);
                    await updateBalance(accounts[0]);
                }
            }
        } catch (err) {
            console.error('Failed to check wallet connection:', err);
        }
    };

    const updateBalance = async (walletAddress: string) => {
        try {
            if (window.ethereum) {
                // Get current network
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                let networkName = 'Unknown';
                let currencySymbol = 'ETH';

                switch (chainId) {
                    case '0x1':
                        networkName = 'Ethereum Mainnet';
                        currencySymbol = 'ETH';
                        break;
                    case '0xaa36a7':
                        networkName = 'Sepolia Testnet';
                        currencySymbol = 'SEP';
                        break;
                    case '0x89':
                        networkName = 'Polygon';
                        currencySymbol = 'MATIC';
                        break;
                    default:
                        networkName = `Network ${chainId}`;
                }

                setNetwork(networkName);

                const balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [walletAddress, 'latest']
                });
                // Convert from wei to ETH/SEP
                const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
                setBalance(`${ethBalance.toFixed(4)} ${currencySymbol}`);
            }
        } catch (err) {
            console.error('Failed to get balance:', err);
        }
    }; const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
            }

            // Request wallet connection
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length > 0) {
                setAddress(accounts[0]);
                setIsConnected(true);
                await updateBalance(accounts[0]);

                // Switch to Sepolia testnet for ModelForge
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }], // Sepolia testnet
                    });
                } catch (switchError: any) {
                    // If Sepolia chain doesn't exist, add it
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: '0xaa36a7',
                                    chainName: 'Sepolia Test Network',
                                    nativeCurrency: {
                                        name: 'SepoliaETH',
                                        symbol: 'SEP',
                                        decimals: 18
                                    },
                                    rpcUrls: ['https://rpc.sepolia.org'],
                                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                                }]
                            });
                        } catch (addError) {
                            console.error('Failed to add Sepolia network:', addError);
                        }
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
            console.error('Wallet connection failed:', err);
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setIsConnected(false);
        setAddress(null);
        setBalance(null);
        setError(null);
    };

    // Listen for account changes
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else if (accounts[0]) {
                    setAddress(accounts[0]);
                    updateBalance(accounts[0]);
                }
            };

            const handleChainChanged = () => {
                // Reload the page when chain changes
                window.location.reload();
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                if (window.ethereum) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeListener('chainChanged', handleChainChanged);
                }
            };
        }

        return () => { }; // Always return a function
    }, []); const value: WalletContextType = {
        isConnected,
        address,
        balance,
        network,
        isConnecting,
        connectWallet,
        disconnectWallet,
        error
    }; return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

// Extend the Window interface to include ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}
