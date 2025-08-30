'use client';

import Link from 'next/link';
import WalletButton from '@/components/WalletButton';

export default function SetupPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 cyber-grid">
            {/* Cyberpunk Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="data-stream" style={{ left: '15%', animationDelay: '0s' }}></div>
                <div className="data-stream" style={{ left: '85%', animationDelay: '1.5s' }}></div>
                <div className="scan-line" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Top Navigation Bar */}
                <div className="flex justify-between items-center mb-8">
                    <Link href="/">
                        <button className="font-mono text-sm uppercase tracking-wider hover:scale-105 transition-transform duration-300"
                            style={{ color: 'var(--neon-green)' }}>
                            &lt; RETURN_TO_MAINFRAME
                        </button>
                    </Link>
                    <WalletButton variant="compact" />
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 neon-text font-mono tracking-wider"
                        style={{ color: 'var(--neon-blue)', letterSpacing: '3px' }}>
                        [SETUP_PROTOCOL]
                    </h1>
                    <div className="terminal-text text-lg max-w-2xl mx-auto font-mono">
                        <span className="text-green-400">&gt;</span> CONFIGURE_IPFS.INIT()
                    </div>
                    <p className="text-gray-300 mt-4 font-mono text-sm uppercase tracking-wider">
                        [SYSTEM] Setup Web3.Storage for decentralized file hosting
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Step 1: Web3.Storage Setup */}
                    <div className="cyber-card rounded-lg p-8 neon-border hologram">
                        <h2 className="text-3xl font-mono font-bold mb-6 tracking-wider"
                            style={{ color: 'var(--neon-green)' }}>
                            [STEP_1] WEB3.STORAGE_SETUP
                        </h2>

                        <div className="space-y-6 font-mono">
                            <div className="border-l-4 border-green-400 pl-6">
                                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--neon-green)' }}>
                                    1.1 CREATE_ACCOUNT
                                </h3>
                                <p className="text-gray-300 mb-4">
                                    Visit <a href="https://web3.storage" target="_blank" rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 underline">
                                        https://web3.storage
                                    </a> and create a free account.
                                </p>
                                <div className="bg-gray-800 p-4 rounded border" style={{ borderColor: 'var(--neon-green)' }}>
                                    <p className="text-green-400 text-sm">
                                        ✅ Free tier includes: <strong>5 GiB storage</strong> on IPFS network
                                    </p>
                                </div>
                            </div>

                            <div className="border-l-4 border-blue-400 pl-6">
                                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--neon-blue)' }}>
                                    1.2 GENERATE_API_TOKEN
                                </h3>
                                <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                                    <li>Login to your Web3.Storage account</li>
                                    <li>Navigate to "Account" → "Create an API Token"</li>
                                    <li>Enter a name like "ModelForge-IPFS"</li>
                                    <li>Click "Create API Token"</li>
                                    <li>Copy the generated token (starts with "eyJ...")</li>
                                </ol>
                            </div>

                            <div className="border-l-4 border-purple-400 pl-6">
                                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--neon-purple)' }}>
                                    1.3 CONFIGURE_ENVIRONMENT
                                </h3>
                                <p className="text-gray-300 mb-4">
                                    Create a <code className="bg-gray-700 px-2 py-1 rounded">.env.local</code> file in
                                    the <code className="bg-gray-700 px-2 py-1 rounded">apps/web</code> directory:
                                </p>
                                <div className="bg-gray-900 p-4 rounded border border-purple-400 overflow-x-auto">
                                    <pre className="text-purple-300 text-sm">
                                        {`# Web3.Storage API Token for IPFS uploads
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                                    </pre>
                                </div>
                                <p className="text-yellow-400 text-sm mt-2">
                                    ⚠️ Replace with your actual token from Web3.Storage
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Wallet Setup */}
                    <div className="cyber-card rounded-lg p-8 neon-border hologram">
                        <h2 className="text-3xl font-mono font-bold mb-6 tracking-wider"
                            style={{ color: 'var(--neon-orange)' }}>
                            [STEP_2] WALLET_CONFIGURATION
                        </h2>

                        <div className="space-y-6 font-mono">
                            <div className="border-l-4 border-orange-400 pl-6">
                                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--neon-orange)' }}>
                                    2.1 INSTALL_METAMASK
                                </h3>
                                <p className="text-gray-300 mb-4">
                                    Install MetaMask browser extension from{' '}
                                    <a href="https://metamask.io" target="_blank" rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 underline">
                                        https://metamask.io
                                    </a>
                                </p>
                            </div>

                            <div className="border-l-4 border-orange-400 pl-6">
                                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--neon-orange)' }}>
                                    2.2 SEPOLIA_TESTNET_SETUP
                                </h3>
                                <p className="text-gray-300 mb-4">
                                    ModelForge automatically configures Sepolia testnet when you connect your wallet.
                                </p>
                                <div className="bg-gray-800 p-4 rounded border border-orange-400">
                                    <p className="text-orange-400 text-sm mb-2">
                                        💰 Get free Sepolia ETH from faucets:
                                    </p>
                                    <ul className="text-gray-300 text-sm space-y-1">
                                        <li>• <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 underline">
                                            SepoliaFaucet.com
                                        </a></li>
                                        <li>• <a href="https://faucets.chain.link/sepolia" target="_blank" rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 underline">
                                            Chainlink Faucet
                                        </a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Test Upload */}
                    <div className="cyber-card rounded-lg p-8 neon-border hologram">
                        <h2 className="text-3xl font-mono font-bold mb-6 tracking-wider"
                            style={{ color: 'var(--neon-pink)' }}>
                            [STEP_3] TEST_DEPLOYMENT
                        </h2>

                        <div className="space-y-6 font-mono">
                            <p className="text-gray-300">
                                Once configured, test the system:
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <Link href="/register">
                                    <div className="cyber-card p-6 rounded border hover:scale-105 transition-transform duration-300 cursor-pointer"
                                        style={{ borderColor: 'var(--neon-blue)' }}>
                                        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--neon-blue)' }}>
                                            MODEL_UPLOAD.TEST()
                                        </h3>
                                        <p className="text-gray-300 text-sm">
                                            Upload a single model file to IPFS
                                        </p>
                                    </div>
                                </Link>

                                <Link href="/repositories">
                                    <div className="cyber-card p-6 rounded border hover:scale-105 transition-transform duration-300 cursor-pointer"
                                        style={{ borderColor: 'var(--neon-green)' }}>
                                        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--neon-green)' }}>
                                            REPOSITORY.CREATE()
                                        </h3>
                                        <p className="text-gray-300 text-sm">
                                            Create a repository with multiple files
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className="cyber-card rounded-lg p-8 neon-border hologram">
                        <h2 className="text-3xl font-mono font-bold mb-6 tracking-wider"
                            style={{ color: 'var(--neon-blue)' }}>
                            [SYSTEM_STATUS]
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6 font-mono">
                            <div>
                                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--neon-green)' }}>
                                    IPFS_CLIENT
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Status:</span>
                                        <span className={process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN ? "text-green-400" : "text-yellow-400"}>
                                            {process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN ? "CONFIGURED" : "NEEDS_TOKEN"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Mode:</span>
                                        <span className="text-blue-400">
                                            {process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN ? "REAL_IPFS" : "DEMO_MODE"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--neon-orange)' }}>
                                    WALLET_STATUS
                                </h3>
                                <div className="text-sm">
                                    <WalletButton variant="default" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
