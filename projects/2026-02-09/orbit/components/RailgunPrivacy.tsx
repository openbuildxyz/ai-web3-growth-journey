'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Loader2, Shield, ShieldOff, Wallet, ExternalLink, RefreshCw } from 'lucide-react';
import { usePrivateSwap } from '@/hooks/usePrivateSwap';
import { motion, AnimatePresence } from 'framer-motion';

const WETH_ADDRESS = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

const SHIELD_TOKENS = [
  { address: ETH_ADDRESS, symbol: 'ETH', decimals: 18 },
  { address: WETH_ADDRESS, symbol: 'WETH', decimals: 18 },
  ...(process.env.NEXT_PUBLIC_ORBUSD_ADDRESS
    ? [{ address: process.env.NEXT_PUBLIC_ORBUSD_ADDRESS, symbol: 'OrbUSD', decimals: 18 }]
    : []),
];

function parseSSE(response: Response, onEvent: (event: string, data: unknown) => void): Promise<void> {
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
          const eventMatch = part.match(/event:\s*(\S+)/);
          const dataMatch = part.match(/data:\s*(.+)/s);
          const event = eventMatch?.[1] || 'message';
          try {
            const data = dataMatch?.[1] ? JSON.parse(dataMatch[1].trim()) : {};
            onEvent(event, data);
          } catch {
            onEvent(event, {});
          }
        }
        processChunk();
      }).catch(reject);
    };
    processChunk();
  });
}

interface RailgunPrivacyProps {
  isPrivateMode?: boolean;
}

export function RailgunPrivacy({ isPrivateMode = false }: RailgunPrivacyProps) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const {
    ensureRailgunWallet,
    railgunWalletStatus,
    railgunAddress,
    getWalletCredentials,
  } = usePrivateSwap();

  const [shieldToken, setShieldToken] = useState(SHIELD_TOKENS[0]);
  const [shieldAmount, setShieldAmount] = useState('');
  const [shieldProgress, setShieldProgress] = useState<{ phase: string; message?: string; transactionHash?: string } | null>(null);
  const [shieldTxHash, setShieldTxHash] = useState<string | null>(null);
  const [shieldError, setShieldError] = useState<string | null>(null);
  const [isShielding, setIsShielding] = useState(false);

  const [unshieldToken, setUnshieldToken] = useState(SHIELD_TOKENS[0]);
  const [unshieldAmount, setUnshieldAmount] = useState('');
  const [unshieldRecipient, setUnshieldRecipient] = useState(address || '');
  const [unshieldProgress, setUnshieldProgress] = useState<{ phase: string; message?: string; transactionHash?: string } | null>(null);
  const [unshieldTxHash, setUnshieldTxHash] = useState<string | null>(null);
  const [unshieldError, setUnshieldError] = useState<string | null>(null);
  const [isUnshielding, setIsUnshielding] = useState(false);

  // Private Swap (private transfer: shield → POI → unshield via official proxy + relayer)
  const [privateToken, setPrivateToken] = useState(SHIELD_TOKENS[0]);
  const [privateAmount, setPrivateAmount] = useState('');
  const [privateRecipient, setPrivateRecipient] = useState(address || '');
  const [privateProgress, setPrivateProgress] = useState<{ step: string; progress: number; message: string; txHash?: string } | null>(null);
  const [privateResult, setPrivateResult] = useState<{ shieldTxHash?: string; unshieldTxHash?: string } | null>(null);
  const [privateError, setPrivateError] = useState<string | null>(null);
  const [isPrivateTransferring, setIsPrivateTransferring] = useState(false);
  const [relayerAddress, setRelayerAddress] = useState<string | null>(null);

  React.useEffect(() => {
    if (address) setUnshieldRecipient((r) => r || address);
  }, [address]);
  React.useEffect(() => {
    if (address) setPrivateRecipient((r) => r || address);
  }, [address]);

  useEffect(() => {
    fetch('/api/railgun/relayer-address')
      .then((r) => r.json())
      .then((d) => d.address && setRelayerAddress(d.address))
      .catch(() => {});
  }, []);

  const handleCreateWallet = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    try {
      await ensureRailgunWallet();
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, ensureRailgunWallet, openConnectModal]);

  const handleShield = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    const creds = getWalletCredentials();
    if (!creds) {
      setShieldError('Create RAILGUN wallet first');
      return;
    }
    if (!shieldAmount || parseFloat(shieldAmount) <= 0) {
      setShieldError('Enter amount');
      return;
    }
    const amountWei = BigInt(parseFloat(shieldAmount) * 10 ** shieldToken.decimals).toString();
    setIsShielding(true);
    setShieldError(null);
    setShieldTxHash(null);
    setShieldProgress({ phase: 'preparing', message: 'Preparing shield...' });

    try {
      await ensureRailgunWallet();
      setShieldProgress({ phase: 'zk_proof', message: 'Generating ZK proof...' });

      const res = await fetch('/api/railgun/shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mnemonic: creds.mnemonic,
          password: creds.password,
          tokenAddress: shieldToken.address,
          amount: amountWei,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Shield request failed');
      }

      await parseSSE(res, (event, data) => {
        const d = data as Record<string, unknown>;
        if (event === 'progress') {
          setShieldProgress({
            phase: (d.phase as string) || 'progress',
            message: (d.message as string) || (d.zkProofProgress as Record<string, unknown>)?.message as string,
            transactionHash: d.transactionHash as string | undefined,
          });
        } else if (event === 'complete') {
          setShieldProgress({ phase: 'complete', message: 'Shield submitted', transactionHash: d.transactionHash as string });
          setShieldTxHash((d.transactionHash as string) || null);
        } else if (event === 'error') {
          setShieldError((d.error as string) || 'Shield failed');
        }
      });
    } catch (e) {
      setShieldError(e instanceof Error ? e.message : 'Shield failed');
    } finally {
      setIsShielding(false);
      setShieldProgress(null);
    }
  }, [isConnected, getWalletCredentials, ensureRailgunWallet, shieldAmount, shieldToken, openConnectModal]);

  const handleUnshield = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    const creds = getWalletCredentials();
    if (!creds) {
      setUnshieldError('Create RAILGUN wallet first');
      return;
    }
    if (!unshieldAmount || parseFloat(unshieldAmount) <= 0) {
      setUnshieldError('Enter amount');
      return;
    }
    if (!unshieldRecipient) {
      setUnshieldError('Enter recipient');
      return;
    }
    const amountWei = BigInt(parseFloat(unshieldAmount) * 10 ** unshieldToken.decimals).toString();
    setIsUnshielding(true);
    setUnshieldError(null);
    setUnshieldTxHash(null);
    setUnshieldProgress({ phase: 'preparing', message: 'Preparing unshield...' });

    try {
      const res = await fetch('/api/railgun/unshield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mnemonic: creds.mnemonic,
          password: creds.password,
          tokenAddress: unshieldToken.address,
          amount: amountWei,
          recipient: unshieldRecipient,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unshield request failed');
      }

      await parseSSE(res, (event, data) => {
        const d = data as Record<string, unknown>;
        if (event === 'progress') {
          setUnshieldProgress({
            phase: (d.phase as string) || 'progress',
            message: (d.message as string) || '',
            transactionHash: d.transactionHash as string | undefined,
          });
        } else if (event === 'complete') {
          setUnshieldProgress({ phase: 'complete', message: 'Unshield submitted', transactionHash: d.transactionHash as string });
          setUnshieldTxHash((d.transactionHash as string) || null);
        } else if (event === 'error') {
          setUnshieldError((d.error as string) || 'Unshield failed');
        }
      });
    } catch (e) {
      setUnshieldError(e instanceof Error ? e.message : 'Unshield failed');
    } finally {
      setIsUnshielding(false);
      setUnshieldProgress(null);
    }
  }, [isConnected, getWalletCredentials, unshieldAmount, unshieldToken, unshieldRecipient, openConnectModal]);

  const handlePrivateTransfer = useCallback(async () => {
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }
    const creds = getWalletCredentials();
    if (!creds) {
      setPrivateError('Create RAILGUN wallet first');
      return;
    }
    if (!privateAmount || parseFloat(privateAmount) <= 0) {
      setPrivateError('Enter amount');
      return;
    }
    if (!privateRecipient) {
      setPrivateError('Enter recipient');
      return;
    }
    setIsPrivateTransferring(true);
    setPrivateError(null);
    setPrivateResult(null);
    setPrivateProgress({ step: 'preparing', progress: 0, message: 'Preparing private transfer...' });

    try {
      await ensureRailgunWallet();
      const walletRes = await fetch('/api/railgun/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mnemonic: creds.mnemonic, password: creds.password }),
      });
      const walletData = await walletRes.json();
      if (!walletRes.ok || !walletData.success || !walletData.walletID || !walletData.railgunAddress || !walletData.encryptionKey) {
        throw new Error(walletData.error || 'Failed to get wallet for private transfer');
      }

      const amountWei = BigInt(parseFloat(privateAmount) * 10 ** privateToken.decimals).toString();

      const res = await fetch('/api/railgun/private-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderWalletID: walletData.walletID,
          senderEncryptionKey: walletData.encryptionKey,
          senderRailgunAddress: walletData.railgunAddress,
          recipientAddress: privateRecipient,
          tokenAddress: privateToken.address,
          amount: amountWei,
          userAddress: address,
          gasAbstraction: 'approved',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Private transfer request failed');
      }

      await parseSSE(res, (_event, raw) => {
        const obj = raw as { type?: string; data?: unknown; error?: string };
        if (obj.type === 'progress' && obj.data) {
          const p = obj.data as { step: string; progress: number; message: string; txHash?: string };
          setPrivateProgress({ step: p.step, progress: p.progress, message: p.message, txHash: p.txHash });
        } else if (obj.type === 'complete' && obj.data) {
          const d = obj.data as { shieldTxHash?: string; unshieldTxHash?: string };
          setPrivateProgress({ step: 'complete', progress: 100, message: 'Private transfer complete.' });
          setPrivateResult({ shieldTxHash: d.shieldTxHash, unshieldTxHash: d.unshieldTxHash });
        } else if (obj.type === 'error') {
          setPrivateError((obj as { data?: { error?: string }; error?: string }).data?.error ?? (obj as { error?: string }).error ?? 'Private transfer failed');
        }
      });
    } catch (e) {
      setPrivateError(e instanceof Error ? e.message : 'Private transfer failed');
    } finally {
      setIsPrivateTransferring(false);
      setPrivateProgress(null);
    }
  }, [isConnected, address, getWalletCredentials, ensureRailgunWallet, privateAmount, privateToken, privateRecipient, openConnectModal]);

  const privateSwapButtonLabel =
    railgunWalletStatus !== 'ready'
      ? isPrivateTransferring
        ? 'Creating wallet & private swap...'
        : 'Create wallet & private swap'
      : isPrivateTransferring
        ? 'Private swap...'
        : 'Private swap';

  const cardStyle = {
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(40, 0, 60, 0.5) 100%)',
    border: '1px solid rgba(255, 0, 255, 0.3)',
    borderRadius: '16px',
    boxShadow: '0 0 20px rgba(255, 0, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div className="w-full space-y-6 p-6 relative" style={cardStyle}>
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-fuchsia-500" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-fuchsia-500" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-fuchsia-500" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-fuchsia-500" />

      <h2
        className="text-xl font-black font-mono tracking-wider"
        style={{
          background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        RAILGUN PRIVACY
      </h2>
      <p className="text-xs font-mono text-fuchsia-400">
        Create wallet → Shield (ZK proof + Relayer) → POI verification → Unshield
      </p>

      {/* RAILGUN Wallet */}
      <div className="rounded-xl p-4 space-y-2" style={{ border: '1px solid rgba(255, 0, 255, 0.2)' }}>
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-fuchsia-400" />
          <span className="text-xs font-mono font-bold text-fuchsia-400">RAILGUN WALLET</span>
        </div>
        {!isConnected ? (
          <button
            type="button"
            onClick={() => openConnectModal?.()}
            className="w-full py-2 rounded-lg border border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400 text-sm font-mono"
          >
            Connect wallet first
          </button>
        ) : railgunWalletStatus === 'ready' ? (
          <div className="text-xs font-mono text-fuchsia-300 break-all">
            {railgunAddress ? `Ready: ${railgunAddress.slice(0, 10)}...${railgunAddress.slice(-8)}` : 'Ready'}
          </div>
        ) : railgunWalletStatus === 'creating' ? (
          <div className="flex items-center gap-2 text-fuchsia-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating RAILGUN wallet...
          </div>
        ) : railgunWalletStatus === 'error' ? (
          <div className="text-xs text-red-400">Wallet setup failed. Try again.</div>
        ) : (
          <button
            type="button"
            onClick={handleCreateWallet}
            className="w-full py-2 rounded-lg border border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-400 text-sm font-mono hover:bg-fuchsia-500/30"
          >
            Create RAILGUN wallet (sign to derive)
          </button>
        )}
      </div>

      {/* Shield */}
      <div className="rounded-xl p-4 space-y-3" style={{ border: '1px solid rgba(255, 0, 255, 0.2)' }}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-cyan-400">SHIELD → PRIVATE POOL</span>
        </div>
        <p className="text-[10px] font-mono text-gray-400">ZK proof → Relayer → TX submitted for POI</p>
        <div className="flex gap-2">
          <select
            value={shieldToken.address}
            onChange={(e) => setShieldToken(SHIELD_TOKENS.find((t) => t.address === e.target.value) || SHIELD_TOKENS[0])}
            className="flex-1 rounded-lg bg-black/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-mono px-2 py-2"
          >
            {SHIELD_TOKENS.map((t) => (
              <option key={t.address} value={t.address}>{t.symbol}</option>
            ))}
          </select>
          <input
            type="number"
            value={shieldAmount}
            onChange={(e) => setShieldAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="any"
            className="flex-1 rounded-lg bg-black/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-mono px-2 py-2"
          />
        </div>
        <AnimatePresence>
          {shieldProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg p-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono"
            >
              {shieldProgress.message}
              {shieldProgress.transactionHash && (
                <div className="mt-1">
                  TX: {shieldProgress.transactionHash.slice(0, 10)}... → POI verification
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {shieldError && (
          <div className="text-xs text-red-400 font-mono">{shieldError}</div>
        )}
        {shieldTxHash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${shieldTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-400 text-xs hover:underline"
          >
            View on Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <button
          type="button"
          onClick={handleShield}
          disabled={!isConnected || isShielding || railgunWalletStatus !== 'ready' || !shieldAmount}
          className="w-full py-2 rounded-lg border border-cyan-500/50 bg-cyan-500/20 text-cyan-400 text-sm font-mono disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isShielding ? <><Loader2 className="w-4 h-4 animate-spin" /> Shielding...</> : 'Shield to private pool'}
        </button>
      </div>

      {/* Unshield */}
      <div className="rounded-xl p-4 space-y-3" style={{ border: '1px solid rgba(255, 0, 255, 0.2)' }}>
        <div className="flex items-center gap-2">
          <ShieldOff className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold text-amber-400">UNSHIELD → RECIPIENT</span>
        </div>
        <p className="text-[10px] font-mono text-gray-400">ZK proof → Relayer → Tokens sent publicly</p>
        <div className="flex gap-2">
          <select
            value={unshieldToken.address}
            onChange={(e) => setUnshieldToken(SHIELD_TOKENS.find((t) => t.address === e.target.value) || SHIELD_TOKENS[0])}
            className="flex-1 rounded-lg bg-black/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-mono px-2 py-2"
          >
            {SHIELD_TOKENS.map((t) => (
              <option key={t.address} value={t.address}>{t.symbol}</option>
            ))}
          </select>
          <input
            type="number"
            value={unshieldAmount}
            onChange={(e) => setUnshieldAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="any"
            className="flex-1 rounded-lg bg-black/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-mono px-2 py-2"
          />
        </div>
        <input
          type="text"
          value={unshieldRecipient}
          onChange={(e) => setUnshieldRecipient(e.target.value)}
          placeholder="0x... recipient"
          className="w-full rounded-lg bg-black/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-mono px-2 py-2"
        />
        <AnimatePresence>
          {unshieldProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg p-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono"
            >
              {unshieldProgress.message}
            </motion.div>
          )}
        </AnimatePresence>
        {unshieldError && (
          <div className="text-xs text-red-400 font-mono">{unshieldError}</div>
        )}
        {unshieldTxHash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${unshieldTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-400 text-xs hover:underline"
          >
            View on Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <button
          type="button"
          onClick={handleUnshield}
          disabled={!isConnected || isUnshielding || railgunWalletStatus !== 'ready' || !unshieldAmount || !unshieldRecipient}
          className="w-full py-2 rounded-lg border border-amber-500/50 bg-amber-500/20 text-amber-400 text-sm font-mono disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isUnshielding ? <><Loader2 className="w-4 h-4 animate-spin" /> Unshielding...</> : 'Unshield to recipient'}
        </button>
      </div>

      {/* Private Swap (private transfer: official proxy + relayer) */}
      <div className="rounded-xl p-4 space-y-3" style={{ border: '1px solid rgba(0, 255, 255, 0.2)' }}>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-emerald-400">PRIVATE SWAP (TRANSFER)</span>
        </div>
        <p className="text-[10px] font-mono text-gray-400">
          Shield → POI → Unshield via official RAILGUN proxy. Relayer pays gas. Approve relayer for token first.
        </p>
        {relayerAddress && (
          <p className="text-[10px] font-mono text-cyan-400 break-all">
            Relayer: {relayerAddress.slice(0, 10)}...{relayerAddress.slice(-8)} (approve this for token)
          </p>
        )}
        <div className="flex gap-2">
          <select
            value={privateToken.address}
            onChange={(e) => setPrivateToken(SHIELD_TOKENS.find((t) => t.address === e.target.value) || SHIELD_TOKENS[0])}
            className="flex-1 rounded-lg bg-black/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-mono px-2 py-2"
          >
            {SHIELD_TOKENS.map((t) => (
              <option key={t.address} value={t.address}>{t.symbol}</option>
            ))}
          </select>
          <input
            type="number"
            value={privateAmount}
            onChange={(e) => setPrivateAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="any"
            className="flex-1 rounded-lg bg-black/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-mono px-2 py-2"
          />
        </div>
        <input
          type="text"
          value={privateRecipient}
          onChange={(e) => setPrivateRecipient(e.target.value)}
          placeholder="0x... recipient"
          className="w-full rounded-lg bg-black/50 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-mono px-2 py-2"
        />
        <AnimatePresence>
          {privateProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono"
            >
              {privateProgress.message} {privateProgress.progress > 0 && `(${privateProgress.progress}%)`}
              {privateProgress.txHash && (
                <div className="mt-1">TX: {privateProgress.txHash.slice(0, 12)}...</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {privateError && (
          <div className="text-xs text-red-400 font-mono">{privateError}</div>
        )}
        {privateResult && (
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {privateResult.shieldTxHash && (
              <a href={`https://sepolia.etherscan.io/tx/${privateResult.shieldTxHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-400 hover:underline">
                Shield TX <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {privateResult.unshieldTxHash && (
              <a href={`https://sepolia.etherscan.io/tx/${privateResult.unshieldTxHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-400 hover:underline">
                Unshield TX <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={handlePrivateTransfer}
          disabled={!isConnected || isPrivateTransferring || railgunWalletStatus !== 'ready' || !privateAmount || !privateRecipient}
          className="w-full py-2 rounded-lg border border-emerald-500/50 bg-emerald-500/20 text-emerald-400 text-sm font-mono disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPrivateTransferring ? <><Loader2 className="w-4 h-4 animate-spin" /> Private transfer...</> : 'Execute private transfer'}
        </button>
      </div>
    </div>
  );
}
