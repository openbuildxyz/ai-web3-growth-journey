'use client';

import { useState } from 'react';
import { PrivateSwap } from '@/components/PrivateSwap';
import { RealSwap } from '@/components/RealSwap';
import { RailgunPrivacy } from '@/components/RailgunPrivacy';
import { ConnectWallet } from '@/components/ConnectWallet';
import { Eye, EyeOff } from 'lucide-react';

const isRealSwapConfigured = !!process.env.NEXT_PUBLIC_ROUTER_ADDRESS;

export default function Home() {
  const [isPrivateMode, setIsPrivateMode] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black relative overflow-hidden">
      {/* Cyberpunk grid background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>

      <main className="w-full max-w-lg p-4 relative z-10">
        {/* Header with Connect Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black mb-1 tracking-tighter" style={{
              fontFamily: 'monospace',
              background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #00ffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
              letterSpacing: '-0.05em'
            }}>ORBIT</h1>
            <p className="text-cyan-400 text-sm font-mono tracking-widest uppercase" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
              &gt; Privacy-Preserving Token Swap
            </p>
            <p className="text-xs text-fuchsia-500 mt-1 font-mono">
              [RAILGUN Zero-Knowledge Proofs]
            </p>
          </div>
          <ConnectWallet />
        </div>

        {/* Public / Private mode toggle */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-fuchsia-500/30 bg-black/40">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Mode</span>
          <button
            type="button"
            onClick={() => setIsPrivateMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-sm transition-all ${
              !isPrivateMode
                ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50'
                : 'bg-black/40 text-gray-500 border border-transparent hover:text-gray-400'
            }`}
          >
            <Eye className="w-4 h-4" />
            Public
          </button>
          <button
            type="button"
            onClick={() => setIsPrivateMode(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-sm transition-all ${
              isPrivateMode
                ? 'bg-fuchsia-500/30 text-fuchsia-400 border border-fuchsia-500/50'
                : 'bg-black/40 text-gray-500 border border-transparent hover:text-gray-400'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            Private
          </button>
        </div>

        {/* Same swap UI; private mode = backend uses RAILGUN (create wallet + private transfer) */}
        {isRealSwapConfigured ? (
          <RealSwap isPrivateMode={isPrivateMode} />
        ) : (
          <PrivateSwap isPrivateMode={isPrivateMode} />
        )}

        {/* RAILGUN: Wallet, Shield, Unshield, Private Swap */}
        <RailgunPrivacy isPrivateMode={isPrivateMode} />

        {/* Info Section */}
        <div className="mt-8 p-5 relative" style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderImage: 'linear-gradient(135deg, #00ffff, #ff00ff) 1',
          borderRadius: '4px',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.5)',
          clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
        }}>
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-fuchsia-500"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-fuchsia-500"></div>

          <h3 className="text-sm font-black text-cyan-400 mb-3 font-mono tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
            // How it works
          </h3>
          <ul className="text-xs text-gray-300 space-y-2 font-mono">
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">&gt;</span>
              <span><strong className="text-fuchsia-400">[SHIELD]</strong> Deposit tokens into private pool via ZK proof</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">&gt;</span>
              <span><strong className="text-fuchsia-400">[SWAP]</strong> Execute private swap with no on-chain link</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">&gt;</span>
              <span><strong className="text-fuchsia-400">[UNSHIELD]</strong> Withdraw to recipient publicly (optional)</span>
            </li>
          </ul>
          <div className="mt-4 pt-3 border-t border-cyan-900/50">
            <p className="text-[10px] text-gray-500 font-mono">
              <span className="text-cyan-600">&gt;</span> Proof-of-concept on Sepolia testnet. Mock data demonstration.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
