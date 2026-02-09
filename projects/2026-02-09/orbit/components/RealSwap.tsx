'use client';

import React, { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Loader2, ExternalLink } from 'lucide-react';
import { useRealSwap } from '@/hooks/useRealSwap';
import { parseUnits } from 'viem';

export function RealSwap() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const {
    isRealSwapEnabled,
    amountIn,
    setAmountIn,
    amountOut,
    quoteLoading,
    isSwapping,
    txHash,
    error,
    executeRealSwap,
  } = useRealSwap();

  const [slippage, setSlippage] = useState('0.5');

  const handleSwap = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (!amountIn || parseFloat(amountIn) <= 0) return;
    const expected = parseFloat(amountOut);
    if (expected <= 0) return; // no liquidity or quote failed

    const minOut = expected * (1 - parseFloat(slippage) / 100);
    const minOutWei = parseUnits(minOut.toFixed(18), 18).toString();

    await executeRealSwap(amountIn, minOutWei);
  }, [isConnected, amountIn, amountOut, slippage, executeRealSwap, openConnectModal]);

  const canSwap = isConnected && amountIn && parseFloat(amountIn) > 0 && parseFloat(amountOut) > 0 && !quoteLoading && !isSwapping;

  if (!isRealSwapEnabled) {
    return null;
  }

  return (
    <div
      className="w-full p-6 space-y-6 relative"
      style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 0, 40, 0.6) 100%)',
        border: '1px solid',
        borderImage: 'linear-gradient(135deg, #00ffff, #ff00ff) 1',
        borderRadius: '16px',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.15), inset 0 0 30px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-fuchsia-500" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-fuchsia-500" />

      <h2
        className="text-xl font-black font-mono tracking-wider"
        style={{
          background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        REAL SWAP (ETH → OrbUSD)
      </h2>
      <p className="text-xs font-mono text-cyan-400">
        Native Sepolia ETH → OrbUSD via OrbPool. One tx, on-chain.
      </p>

      {/* Input: ETH */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 20, 40, 0.4) 100%)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
        }}
      >
        <div className="text-xs font-mono font-bold text-cyan-400 mb-2">&gt; INPUT (ETH)</div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            min="0"
            step="any"
            className="flex-1 bg-transparent text-2xl font-bold outline-none font-mono text-cyan-400"
            disabled={isSwapping}
          />
          <span className="font-mono font-bold text-cyan-400">ETH</span>
        </div>
      </div>

      {/* Output: OrbUSD */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(40, 0, 40, 0.4) 100%)',
          border: '1px solid rgba(255, 0, 255, 0.3)',
        }}
      >
        <div className="text-xs font-mono font-bold text-fuchsia-400 mb-2">&gt; OUTPUT (OrbUSD)</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-2xl font-bold font-mono text-fuchsia-400">
            {quoteLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Getting quote...
              </span>
            ) : (
              amountOut || '0'
            )}
          </div>
          <span className="font-mono font-bold text-fuchsia-400">OrbUSD</span>
        </div>
      </div>

      {/* Slippage */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-gray-400">Slippage:</span>
        <input
          type="text"
          value={slippage}
          onChange={(e) => setSlippage(e.target.value)}
          className="w-16 px-2 py-1 rounded bg-black/50 border border-cyan-500/50 text-cyan-400 font-mono text-xs"
        />
        <span className="text-xs text-gray-500">%</span>
      </div>

      {error && (
        <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/50 text-amber-400 text-sm font-mono space-y-1">
          <div>{error}</div>
          {error.includes('no liquidity') && (
            <div className="text-xs text-amber-500 mt-2">
              From project root: <code className="bg-black/30 px-1 rounded">npm run pool:add-weth-orbusd</code>
            </div>
          )}
        </div>
      )}

      {txHash && (
        <div className="rounded-lg p-3 bg-green-500/10 border border-green-500/50 text-green-400 text-sm font-mono flex items-center gap-2">
          <span>Swap submitted!</span>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
          >
            View on Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={!canSwap}
        className="w-full h-14 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
          color: '#000',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)',
        }}
      >
        {!isConnected ? (
          'Connect Wallet'
        ) : isSwapping ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Swapping...
          </>
        ) : (
          'Swap ETH → OrbUSD'
        )}
      </button>
    </div>
  );
}
