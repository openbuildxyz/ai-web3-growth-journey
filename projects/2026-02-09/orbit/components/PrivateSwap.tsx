'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ArrowDownUp, Eye, EyeOff, Shield, Loader2, ChevronDown, Wallet } from 'lucide-react';
import {
  usePrivateSwap,
  getSwapOutput,
  getAllTokens,
  getTokenBySymbol,
  type TokenInfo,
} from '@/hooks/usePrivateSwap';

interface PrivateSwapProps {
  className?: string;
}

// Token icon component with cyberpunk gradient style
const TokenIcon = ({ symbol, size = 32, className = '', style = {} }: { symbol: string; size?: number; className?: string; style?: React.CSSProperties }) => {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-sm font-mono ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
        boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
        ...style
      }}
    >
      {symbol[0]}
    </div>
  );
};

// Token selector dropdown
const TokenSelector = ({
  selectedToken,
  onSelect,
  disabled,
}: {
  selectedToken: TokenInfo;
  onSelect: (token: TokenInfo) => void;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const allTokens = getAllTokens();

  return (
    <div className="relative z-50">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 bg-black/60 hover:bg-black/80 border border-cyan-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)' }}
      >
        <TokenIcon symbol={selectedToken.symbol} size={20} className="rounded-full" style={{ filter: 'drop-shadow(0 0 5px currentColor)' }} />
        <span className="font-bold text-sm text-cyan-400 font-mono">{selectedToken.symbol}</span>
        <ChevronDown className="w-4 h-4 text-cyan-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 top-full left-0 mt-2 w-48 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 0, 40, 0.95) 100%)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)'
              }}
            >
              {allTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => {
                    onSelect(token);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-cyan-500/10 transition-colors flex items-center gap-3 border-b border-cyan-500/10 last:border-0"
                >
                  <TokenIcon symbol={token.symbol} size={32} className="rounded-full" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.5))' }} />
                  <div>
                    <div className="font-bold text-sm text-cyan-400 font-mono">{token.symbol}</div>
                    <div className="text-xs text-gray-500 font-mono">{token.name}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Progress step display component
const ProgressStep = ({
  step,
  progress,
  message,
}: {
  step: string;
  progress: number;
  message: string;
}) => {
  if (step === 'idle') return null;

  const isError = step === 'error';
  const isComplete = step === 'complete';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl p-4 border relative overflow-hidden"
      style={{
        background: isError
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)'
          : isComplete
          ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
        border: isError
          ? '1px solid rgba(239, 68, 68, 0.5)'
          : isComplete
          ? '1px solid rgba(0, 255, 136, 0.5)'
          : '1px solid rgba(0, 255, 255, 0.5)',
        boxShadow: isError
          ? '0 0 20px rgba(239, 68, 68, 0.3)'
          : isComplete
          ? '0 0 20px rgba(0, 255, 136, 0.3)'
          : '0 0 20px rgba(0, 255, 255, 0.3)'
      }}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
        animation: 'scan 2s linear infinite'
      }}></div>

      <div className="flex items-center gap-3 relative z-10">
        {!isComplete && !isError && (
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#00ffff', filter: 'drop-shadow(0 0 5px #00ffff)' }} />
        )}
        {isComplete && (
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#00ff88', boxShadow: '0 0 10px #00ff88' }}>
            <span className="text-black text-[10px]">✓</span>
          </div>
        )}
        {isError && (
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}>
            <span className="text-white text-[10px]">!</span>
          </div>
        )}
        <div className="flex-1">
          <div className="text-xs font-bold font-mono" style={{
            color: isError ? '#ef4444' : isComplete ? '#00ff88' : '#00ffff',
            textShadow: `0 0 10px ${isError ? '#ef4444' : isComplete ? '#00ff88' : '#00ffff'}`
          }}>{message}</div>
          {!isComplete && !isError && (
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0, 255, 255, 0.2)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #00ffff, #ff00ff)', boxShadow: '0 0 10px #00ffff' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PrivateSwap = ({ className }: PrivateSwapProps) => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const {
    isSwapping,
    progress,
    result,
    shieldedBalance,
    railgunWalletStatus,
    executeSwap,
    resetSwap,
    tokens,
  } = usePrivateSwap();

  const [stealthMode, setStealthMode] = useState(true);
  const [tokenIn, setTokenIn] = useState<TokenInfo>(tokens.ETH);
  const [tokenOut, setTokenOut] = useState<TokenInfo>(tokens.USDC);
  const [amountIn, setAmountIn] = useState('1');
  const [slippage, setSlippage] = useState('0.5');

  // In private mode, wallet must be ready (or will be created on first swap)
  const isWalletPreparing = stealthMode && railgunWalletStatus === 'creating';
  const canSwap = !isWalletPreparing && (!stealthMode || railgunWalletStatus !== 'error');

  // Calculate output amount
  const amountOut = useMemo(() => {
    if (!amountIn || parseFloat(amountIn) <= 0) return '0';
    return getSwapOutput(tokenIn, tokenOut, amountIn);
  }, [amountIn, tokenIn, tokenOut]);

  // Handle swap direction flip
  const handleFlipTokens = useCallback(() => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
  }, [tokenIn, tokenOut]);

  // Handle swap execution
  const handleSwap = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (!amountIn || parseFloat(amountIn) <= 0) {
      return;
    }

    // Calculate minimum output with slippage
    const expectedOutput = parseFloat(amountOut);
    const minOutput = expectedOutput * (1 - parseFloat(slippage) / 100);

    await executeSwap(tokenIn, tokenOut, amountIn, stealthMode, minOutput.toString());
  }, [
    isConnected,
    amountIn,
    amountOut,
    slippage,
    tokenIn,
    tokenOut,
    stealthMode,
    executeSwap,
    openConnectModal,
  ]);

  // Reset result when parameters change
  React.useEffect(() => {
    if (result) {
      resetSwap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountIn, tokenIn, tokenOut, stealthMode]);

  return (
    <div className={`w-full p-6 space-y-6 relative ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 0, 40, 0.6) 100%)',
        border: '1px solid',
        borderImage: 'linear-gradient(135deg, #00ffff, #ff00ff) 1',
        borderRadius: '16px',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.15), inset 0 0 30px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-fuchsia-500"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-fuchsia-500"></div>

      {/* Scan line overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none rounded-[16px] overflow-hidden">
        <div className="w-full h-1" style={{
          background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
          animation: 'scanline 3s linear infinite'
        }}></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <h2 className="text-xl font-black font-mono tracking-wider" style={{
          background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
        }}>PRIVACY SWAP</h2>
        <div className="flex items-center gap-2">
          <Shield
            className={`w-4 h-4 transition-colors duration-300 ${
              stealthMode ? 'text-fuchsia-500' : 'text-gray-500'
            }`}
            style={stealthMode ? { filter: 'drop-shadow(0 0 5px #ff00ff)' } : {}}
          />
          <span className="text-xs font-bold text-cyan-400 font-mono">[ENCRYPTED]</span>
        </div>
      </div>

      {/* Stealth Mode Toggle */}
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(0, 255, 255, 0.2)' }}>
        <div className="flex items-center gap-2">
          {stealthMode ? (
            <EyeOff className="w-4 h-4 text-fuchsia-500" style={{ filter: 'drop-shadow(0 0 5px #ff00ff)' }} />
          ) : (
            <Eye className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-xs font-bold font-mono" style={{
            color: stealthMode ? '#ff00ff' : '#6b7280',
            textShadow: stealthMode ? '0 0 10px #ff00ff' : 'none'
          }}>
            {stealthMode ? 'STEALTH_MODE' : 'PUBLIC_MODE'}
          </span>
        </div>
        <button
          onClick={() => setStealthMode(!stealthMode)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-300 font-mono text-xs ${
            stealthMode
              ? 'border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-400'
              : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
          style={stealthMode ? { boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)' } : {}}
        >
          <span className="font-bold">{stealthMode ? 'PRIVATE' : 'PUBLIC'}</span>
          <div
            className={`relative w-8 h-4 rounded-full transition-all duration-300 ${
              stealthMode ? 'bg-fuchsia-600' : 'bg-gray-700'
            }`}
            style={stealthMode ? { boxShadow: '0 0 10px rgba(255, 0, 255, 0.5)' } : {}}
          >
            <div
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                stealthMode ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Shielded Balance Display */}
      {stealthMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-lg p-3 relative"
          style={{
            border: '1px solid rgba(255, 0, 255, 0.3)',
            background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%)',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)',
            zIndex: 1
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold font-mono tracking-wider" style={{ color: '#ff00ff', textShadow: '0 0 10px #ff00ff' }}>SHIELDED_BALANCE</div>
              <div className="text-sm font-bold font-mono" style={{ color: '#ff00ff', textShadow: '0 0 10px #ff00ff' }}>
                {shieldedBalance.toString()} WETH
              </div>
            </div>
            <Wallet className="w-4 h-4 text-fuchsia-500" style={{ filter: 'drop-shadow(0 0 5px #ff00ff)' }} />
          </div>
        </motion.div>
      )}

      {/* Swap Interface */}
      <div className="space-y-2">
        {/* Token In */}
        <div className="rounded-xl p-4 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 20, 40, 0.4) 100%)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.1)'
        }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono font-bold tracking-wider" style={{ color: '#00ffff' }}>&gt; INPUT</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-bold outline-none font-mono"
              style={{
                color: '#00ffff',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                fontFamily: 'monospace'
              }}
              disabled={isSwapping}
            />
            <TokenSelector
              selectedToken={tokenIn}
              onSelect={setTokenIn}
              disabled={isSwapping}
            />
          </div>
          <div className="text-xs font-mono mt-2" style={{ color: '#6b7280' }}>
            <span style={{ color: '#00ffff' }}>&gt;</span> BALANCE: {isConnected ? '10.0' : '0.0'} {tokenIn.symbol}
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleFlipTokens}
            disabled={isSwapping}
            className="w-10 h-10 rounded-full border-2 shadow-lg flex items-center justify-center transition-all disabled:opacity-50 hover:scale-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
              borderColor: '#000',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)'
            }}
          >
            <ArrowDownUp className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Token Out */}
        <div className="rounded-xl p-4 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(40, 0, 40, 0.4) 100%)',
          border: '1px solid rgba(255, 0, 255, 0.3)',
          boxShadow: '0 0 15px rgba(255, 0, 255, 0.1)'
        }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono font-bold tracking-wider" style={{ color: '#ff00ff' }}>&gt; OUTPUT</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={amountOut}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-bold outline-none font-mono"
              style={{
                color: '#ff00ff',
                textShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
                fontFamily: 'monospace'
              }}
            />
            <TokenSelector
              selectedToken={tokenOut}
              onSelect={setTokenOut}
              disabled={isSwapping}
            />
          </div>
        </div>
      </div>

      {/* Slippage Settings */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>[MAX_SLIPPAGE]</span>
        <button
          onClick={() => setSlippage('0.1')}
          className={`px-2 py-1 rounded text-xs font-bold font-mono transition-all ${
            slippage === '0.1'
              ? 'text-black'
              : 'text-gray-400'
          }`}
          style={{
            background: slippage === '0.1'
              ? 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)'
              : 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: slippage === '0.1' ? '0 0 15px rgba(0, 255, 255, 0.5)' : 'none'
          }}
        >
          0.1%
        </button>
        <button
          onClick={() => setSlippage('0.5')}
          className={`px-2 py-1 rounded text-xs font-bold font-mono transition-all ${
            slippage === '0.5'
              ? 'text-black'
              : 'text-gray-400'
          }`}
          style={{
            background: slippage === '0.5'
              ? 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)'
              : 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: slippage === '0.5' ? '0 0 15px rgba(0, 255, 255, 0.5)' : 'none'
          }}
        >
          0.5%
        </button>
        <button
          onClick={() => setSlippage('1.0')}
          className={`px-2 py-1 rounded text-xs font-bold font-mono transition-all ${
            slippage === '1.0'
              ? 'text-black'
              : 'text-gray-400'
          }`}
          style={{
            background: slippage === '1.0'
              ? 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)'
              : 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: slippage === '1.0' ? '0 0 15px rgba(0, 255, 255, 0.5)' : 'none'
          }}
        >
          1.0%
        </button>
      </div>

      {/* Swap Progress */}
      <AnimatePresence>
        {isSwapping && (
          <ProgressStep step={progress.step} progress={progress.progress} message={progress.message} />
        )}
      </AnimatePresence>

      {/* Result Message */}
      <AnimatePresence>
        {result && !isSwapping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl p-4 border relative overflow-hidden font-mono"
            style={{
              background: result.success
                ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
              border: result.success
                ? '1px solid rgba(0, 255, 136, 0.5)'
                : '1px solid rgba(239, 68, 68, 0.5)',
              boxShadow: result.success
                ? '0 0 20px rgba(0, 255, 136, 0.3)'
                : '0 0 20px rgba(239, 68, 68, 0.3)'
            }}
          >
            <div className="text-xs font-bold relative z-10">
              {result.success ? (
                <span style={{ color: '#00ff88', textShadow: '0 0 10px #00ff88' }}>
                  ✓ TRANSACTION_COMPLETE
                  {result.amountOut && (
                    <span className="text-gray-300">
                      {' '}// RECEIVED: {result.amountOut} {tokenOut.symbol}
                    </span>
                  )}
                </span>
              ) : (
                <span style={{ color: '#ef4444', textShadow: '0 0 10px #ef4444' }}>
                  ✗ ERROR: {result.error}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={isSwapping || !canSwap || !amountIn || parseFloat(amountIn) <= 0}
        className="w-full h-14 rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:hover:translate-y-0 relative overflow-hidden font-mono group"
        style={{
          background: stealthMode
            ? 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)'
            : 'linear-gradient(135deg, #00ffff 0%, #0099ff 100%)',
          color: '#000',
          boxShadow: stealthMode
            ? '0 0 30px rgba(255, 0, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.3)'
            : '0 0 30px rgba(0, 255, 255, 0.5)',
          transform: 'translateY(0)',
          border: '2px solid transparent'
        }}
        onMouseEnter={(e) => {
          if (!isSwapping && canSwap && amountIn && parseFloat(amountIn) > 0) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = stealthMode
              ? '0 0 40px rgba(255, 0, 255, 0.7), 0 0 80px rgba(0, 255, 255, 0.5)'
              : '0 0 40px rgba(0, 255, 255, 0.7)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = stealthMode
            ? '0 0 30px rgba(255, 0, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.3)'
            : '0 0 30px rgba(0, 255, 255, 0.5)';
        }}
      >
        {/* Glitch effect overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px)'
        }}></div>

        <span className="relative z-10 flex items-center justify-center gap-2">
          {isSwapping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              PROCESSING...
            </>
          ) : isWalletPreparing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              INITIALIZING_SECURE_WALLET...
            </>
          ) : !isConnected ? (
            'CONNECT_WALLET'
          ) : stealthMode ? (
            'PRIVATE_SWAP'
          ) : (
            'PUBLIC_SWAP'
          )}
        </span>
      </button>

      {/* Wallet error notice */}
      {stealthMode && railgunWalletStatus === 'error' && (
        <p className="text-center text-xs font-medium font-mono" style={{ color: '#ef4444', textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
          [ERROR] PRIVATE_WALLET_INIT_FAILED. RECONNECT REQUIRED.
        </p>
      )}

      {/* Privacy Notice */}
      {stealthMode && railgunWalletStatus !== 'error' && (
        <p className="text-center text-[9px] font-medium leading-relaxed font-mono" style={{ color: '#ff00ff' }}>
          <Shield className="w-3 h-3 inline mr-1" style={{ filter: 'drop-shadow(0 0 5px #ff00ff)' }} />
          ZERO_KNOWLEDGE_PROOF_ACTIVE // IDENTITY_SHIELDED
        </p>
      )}
    </div>
  );
};
