'use client';

import React, { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Loader2, ExternalLink } from 'lucide-react';
import { useRealSwap } from '@/hooks/useRealSwap';
import { usePrivateSwap } from '@/hooks/usePrivateSwap';
import { parseUnits } from 'viem';

const WETH_SEPOLIA = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';

function parseSSE(response: Response, onData: (obj: { type?: string; data?: unknown; error?: string }) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = response.body?.getReader();
    if (!reader) {
      reject(new Error('No response body'));
      return;
    }
    const decoder = new TextDecoder();
    let buffer = '';
    const processChunk = () => {
      reader.read().then(({ done, value }) => {
        if (done) {
          resolve();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const dataMatch = part.match(/data:\s*(.+)/s);
          try {
            const data = dataMatch?.[1] ? JSON.parse(dataMatch[1].trim()) : {};
            onData(data);
          } catch {
            onData({});
          }
        }
        processChunk();
      }).catch(reject);
    };
    processChunk();
  });
}

interface RealSwapProps {
  isPrivateMode?: boolean;
}

export function RealSwap({ isPrivateMode = false }: RealSwapProps) {
  const { address, isConnected } = useAccount();
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
  const { ensureRailgunWallet, getWalletCredentials } = usePrivateSwap();

  const [slippage, setSlippage] = useState('0.5');
  const [isPrivateSwapping, setIsPrivateSwapping] = useState(false);
  const [privateError, setPrivateError] = useState<string | null>(null);
  const [privateTxHash, setPrivateTxHash] = useState<string | null>(null);

  const handleSwap = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (!amountIn || parseFloat(amountIn) <= 0) return;

    if (isPrivateMode) {
      setIsPrivateSwapping(true);
      setPrivateError(null);
      setPrivateTxHash(null);
      try {
        await ensureRailgunWallet();
        const creds = getWalletCredentials();
        if (!creds) {
          setPrivateError('Wallet creation failed or was cancelled.');
          return;
        }
        const walletRes = await fetch('/api/railgun/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mnemonic: creds.mnemonic, password: creds.password }),
        });
        const walletData = await walletRes.json();
        if (!walletRes.ok || !walletData.success || !walletData.walletID || !walletData.railgunAddress || !walletData.encryptionKey) {
          setPrivateError(walletData.error || 'Failed to get wallet');
          return;
        }
        const amountWei = parseUnits(amountIn, 18).toString();
        const res = await fetch('/api/railgun/private-transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderWalletID: walletData.walletID,
            senderEncryptionKey: walletData.encryptionKey,
            senderRailgunAddress: walletData.railgunAddress,
            recipientAddress: address,
            tokenAddress: WETH_SEPOLIA,
            amount: amountWei,
            userAddress: address,
            gasAbstraction: 'approved',
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setPrivateError(data.error || 'Private transfer failed');
          return;
        }
        await parseSSE(res, (obj) => {
          if (obj.type === 'complete' && obj.data) {
            const d = obj.data as { unshieldTxHash?: string };
            setPrivateTxHash(d.unshieldTxHash || null);
          } else if (obj.type === 'error') {
            setPrivateError((obj as { data?: { error?: string }; error?: string }).data?.error ?? (obj as { error?: string }).error ?? 'Private transfer failed');
          }
        });
      } catch (e) {
        setPrivateError(e instanceof Error ? e.message : 'Private transfer failed');
      } finally {
        setIsPrivateSwapping(false);
      }
      return;
    }

    const expected = parseFloat(amountOut);
    if (expected <= 0) return;
    const minOut = expected * (1 - parseFloat(slippage) / 100);
    const minOutWei = parseUnits(minOut.toFixed(18), 18).toString();
    await executeRealSwap(amountIn, minOutWei);
  }, [isConnected, address, amountIn, amountOut, slippage, isPrivateMode, ensureRailgunWallet, getWalletCredentials, executeRealSwap, openConnectModal]);

  const swapping = isPrivateMode ? isPrivateSwapping : isSwapping;
  const displayError = isPrivateMode ? privateError : error;
  const displayTxHash = isPrivateMode ? privateTxHash : txHash;
  const canSwap = isConnected && amountIn && parseFloat(amountIn) > 0 && !swapping && (isPrivateMode || (parseFloat(amountOut) > 0 && !quoteLoading));

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
        {isPrivateMode ? 'PRIVATE SWAP (ETH)' : 'REAL SWAP (ETH → OrbUSD)'}
      </h2>
      <p className="text-xs font-mono text-cyan-400">
        {isPrivateMode
          ? 'Same UI: backend uses RAILGUN (create wallet → shield → POI → unshield).'
          : 'Native Sepolia ETH → OrbUSD via OrbPool. One tx, on-chain.'}
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

      {displayError && (
        <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/50 text-amber-400 text-sm font-mono space-y-1">
          <div>{displayError}</div>
          {!isPrivateMode && displayError.includes('no liquidity') && (
            <div className="text-xs text-amber-500 mt-2">
              From project root: <code className="bg-black/30 px-1 rounded">npm run pool:add-weth-orbusd</code>
            </div>
          )}
        </div>
      )}

      {displayTxHash && (
        <div className="rounded-lg p-3 bg-green-500/10 border border-green-500/50 text-green-400 text-sm font-mono flex items-center gap-2">
          <span>{isPrivateMode ? 'Private transfer complete!' : 'Swap submitted!'}</span>
          <a
            href={`https://sepolia.etherscan.io/tx/${displayTxHash}`}
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
        ) : swapping ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isPrivateMode ? 'Private swap...' : 'Swapping...'}
          </>
        ) : isPrivateMode ? (
          'Private swap (create wallet + transfer)'
        ) : (
          'Swap ETH → OrbUSD'
        )}
      </button>
    </div>
  );
}
