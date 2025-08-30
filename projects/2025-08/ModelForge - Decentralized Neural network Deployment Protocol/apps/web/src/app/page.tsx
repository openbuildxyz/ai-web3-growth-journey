'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WalletButton from '@/components/WalletButton';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 cyber-grid overflow-hidden relative">
      {/* Cyberpunk Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Neon Particles */}
        <div className="absolute top-10 left-10 w-20 h-20 animate-blob" style={{ background: 'radial-gradient(circle, var(--neon-blue), var(--neon-purple))', opacity: 0.3 }}></div>
        <div className="absolute top-0 right-4 w-20 h-20 animate-blob animation-delay-2000" style={{ background: 'radial-gradient(circle, var(--neon-pink), var(--neon-orange))', opacity: 0.3 }}></div>
        <div className="absolute -bottom-8 left-20 w-20 h-20 animate-blob animation-delay-4000" style={{ background: 'radial-gradient(circle, var(--neon-green), var(--neon-blue))', opacity: 0.3 }}></div>

        {/* Data Streams */}
        <div className="data-stream" style={{ left: '10%', animationDelay: '0s' }}></div>
        <div className="data-stream" style={{ left: '30%', animationDelay: '1s' }}></div>
        <div className="data-stream" style={{ left: '70%', animationDelay: '2s' }}></div>
        <div className="data-stream" style={{ left: '90%', animationDelay: '0.5s' }}></div>

        {/* Scan Line */}
        <div className="scan-line" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="font-mono text-sm uppercase tracking-wider" style={{ color: 'var(--neon-green)' }}>
            [NEURAL_NETWORK_PROTOCOL]
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/setup">
              <button className="font-mono text-xs uppercase tracking-wider hover:scale-105 transition-transform duration-300 px-3 py-1 rounded"
                style={{ color: 'var(--neon-orange)', border: '1px solid var(--neon-orange)' }}>
                [SETUP]
              </button>
            </Link>
            <WalletButton variant="compact" />
          </div>
        </div>

        <header className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h1 className="text-7xl font-bold mb-4 neon-text animate-pulse-neon glitch"
            data-text="⚡ MODELFORGE"
            style={{ color: 'var(--neon-blue)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '3px' }}>
            ⚡ MODELFORGE
          </h1>
          <div className="terminal-text text-xl max-w-2xl mx-auto font-mono">
            <span className="text-green-400">&gt;</span> AI_MODEL_REGISTRY.INIT()
          </div>
          <p className="text-gray-300 mt-4 text-lg font-mono">
            [SYSTEM] Decentralized Neural Network Deployment Protocol
          </p>

          {/* Cyberpunk CTA Button */}
          <div className="mt-8">
            <Link href="/register">
              <button className="cyber-button px-8 py-4 text-lg rounded-none font-mono tracking-wider neon-glow-blue transform transition-all duration-300 hover:scale-105 active:scale-95">
                <span className="relative z-10">&gt; INITIALIZE_SESSION</span>
              </button>
            </Link>
          </div>
        </header>

        <div className={`grid md:grid-cols-4 gap-8 mb-12 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Register Models Card */}
          <div
            className="group cyber-card rounded-lg p-6 transform transition-all duration-500 hover:scale-105 cursor-pointer hologram"
            onMouseEnter={() => setActiveCard(0)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110"
              style={{ color: 'var(--neon-blue)', filter: 'drop-shadow(0 0 10px var(--neon-blue))' }}>
              📋
            </div>
            <h3 className="text-xl font-bold mb-2 font-mono tracking-wide" style={{ color: 'var(--neon-blue)' }}>
              NEURAL_REGISTRY.UPLOAD()
            </h3>
            <p className="text-gray-300 mb-4 font-mono text-sm">
              Deploy AI models to distributed IPFS network with blockchain verification
            </p>
            <Link href="/register">
              <button className="w-full py-2 px-4 cyber-button rounded-none font-mono text-xs tracking-wider neon-border transform transition-all duration-300 active:scale-95">
                &gt; INITIATE_UPLOAD
              </button>
            </Link>
          </div>

          {/* Discover Models Card */}
          <div
            className="group cyber-card rounded-lg p-6 transform transition-all duration-500 hover:scale-105 cursor-pointer hologram"
            onMouseEnter={() => setActiveCard(1)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110"
              style={{ color: 'var(--neon-pink)', filter: 'drop-shadow(0 0 10px var(--neon-pink))' }}>
              🔍
            </div>
            <h3 className="text-xl font-bold mb-2 font-mono tracking-wide" style={{ color: 'var(--neon-pink)' }}>
              DATABASE.QUERY()
            </h3>
            <p className="text-gray-300 mb-4 font-mono text-sm">
              Search decentralized neural network repository and model metadata
            </p>
            <Link href="/discover">
              <button className="w-full py-2 px-4 font-mono text-xs tracking-wider rounded-none transform transition-all duration-300 active:scale-95"
                style={{ background: 'linear-gradient(45deg, var(--neon-pink), var(--neon-purple))', border: '1px solid var(--neon-pink)' }}>
                &gt; ACCESS_DATABASE
              </button>
            </Link>
          </div>

          {/* Deploy Models Card */}
          <div
            className="group cyber-card rounded-lg p-6 transform transition-all duration-500 hover:scale-105 cursor-pointer hologram"
            onMouseEnter={() => setActiveCard(2)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110"
              style={{ color: 'var(--neon-green)', filter: 'drop-shadow(0 0 10px var(--neon-green))' }}>
              🚀
            </div>
            <h3 className="text-xl font-bold mb-2 font-mono tracking-wide" style={{ color: 'var(--neon-green)' }}>
              DEPLOY.EXECUTE()
            </h3>
            <p className="text-gray-300 mb-4 font-mono text-sm">
              Integrate neural networks into production environments via SDK
            </p>
            <Link href="/deploy">
              <button className="w-full py-2 px-4 font-mono text-xs tracking-wider rounded-none transform transition-all duration-300 active:scale-95"
                style={{ background: 'linear-gradient(45deg, var(--neon-green), var(--neon-blue))', border: '1px solid var(--neon-green)' }}>
                &gt; START_DEPLOYMENT
              </button>
            </Link>
          </div>

          {/* Repositories Card */}
          <div
            className="group cyber-card rounded-lg p-6 transform transition-all duration-500 hover:scale-105 cursor-pointer hologram"
            onMouseEnter={() => setActiveCard(3)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110"
              style={{ color: 'var(--neon-orange)', filter: 'drop-shadow(0 0 10px var(--neon-orange))' }}>
              📚
            </div>
            <h3 className="text-xl font-bold mb-2 font-mono tracking-wide" style={{ color: 'var(--neon-orange)' }}>
              REPO_MANAGER.ACCESS()
            </h3>
            <p className="text-gray-300 mb-4 font-mono text-sm">
              Create and manage model repositories like HuggingFace on blockchain
            </p>
            <Link href="/repositories">
              <button className="w-full py-2 px-4 font-mono text-xs tracking-wider rounded-none transform transition-all duration-300 active:scale-95"
                style={{ background: 'linear-gradient(45deg, var(--neon-orange), var(--neon-pink))', border: '1px solid var(--neon-orange)' }}>
                &gt; MANAGE_REPOS
              </button>
            </Link>
          </div>
        </div>

        {/* Cyberpunk Stats Dashboard */}
        <div className={`text-center transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="cyber-card rounded-lg p-8 max-w-5xl mx-auto neon-border hologram">
            <h2 className="text-3xl font-bold mb-8 font-mono tracking-wider" style={{ color: 'var(--neon-blue)' }}>
              [SYSTEM_STATUS] NETWORK_METRICS
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="group transform transition-all duration-300 hover:scale-110">
                <div className="text-4xl font-bold font-mono tracking-wider neon-text" style={{ color: 'var(--neon-blue)' }}>
                  1,337
                </div>
                <div className="text-gray-400 font-mono text-sm uppercase tracking-wider">Neural Networks</div>
              </div>
              <div className="group transform transition-all duration-300 hover:scale-110">
                <div className="text-4xl font-bold font-mono tracking-wider neon-text" style={{ color: 'var(--neon-green)' }}>
                  42.0K
                </div>
                <div className="text-gray-400 font-mono text-sm uppercase tracking-wider">Downloads</div>
              </div>
              <div className="group transform transition-all duration-300 hover:scale-110">
                <div className="text-4xl font-bold font-mono tracking-wider neon-text" style={{ color: 'var(--neon-pink)' }}>
                  888
                </div>
                <div className="text-gray-400 font-mono text-sm uppercase tracking-wider">Active Nodes</div>
              </div>
              <div className="group transform transition-all duration-300 hover:scale-110">
                <div className="text-4xl font-bold font-mono tracking-wider neon-text" style={{ color: 'var(--neon-orange)' }}>
                  Ξ15.5
                </div>
                <div className="text-gray-400 font-mono text-sm uppercase tracking-wider">Value Staked</div>
              </div>
            </div>

            {/* System Status */}
            <div className="mt-8 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--neon-green)' }}></div>
                <span className="font-mono text-sm uppercase tracking-wider" style={{ color: 'var(--neon-green)' }}>
                  [ONLINE] Network Active
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full animate-pulse animation-delay-1000" style={{ backgroundColor: 'var(--neon-blue)' }}></div>
                <span className="font-mono text-sm uppercase tracking-wider" style={{ color: 'var(--neon-blue)' }}>
                  [SYNC] Blockchain
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Footer */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--neon-blue)' }}></div>
              <span className="font-mono text-xs uppercase tracking-wider text-gray-400">Next.js Protocol</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse animation-delay-1000" style={{ backgroundColor: 'var(--neon-purple)' }}></div>
              <span className="font-mono text-xs uppercase tracking-wider text-gray-400">Ethereum Layer</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse animation-delay-2000" style={{ backgroundColor: 'var(--neon-green)' }}></div>
              <span className="font-mono text-xs uppercase tracking-wider text-gray-400">IPFS Storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
