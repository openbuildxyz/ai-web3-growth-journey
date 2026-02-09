'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits, formatUnits, keccak256 } from 'viem';
import { Mnemonic } from 'ethers';

// Token definitions for Sepolia testnet
const TOKENS = {
  ETH: {
    address: '0x0000000000000000000000000000000000000000' as const,
    symbol: 'ETH',
    decimals: 18,
    name: 'Ethereum',
  },
  USDC: {
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const,
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
  },
  USDT: {
    address: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06' as const,
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USD',
  },
  DAI: {
    address: '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6' as const,
    symbol: 'DAI',
    decimals: 18,
    name: 'Dai Stablecoin',
  },
  WETH: {
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' as const,
    symbol: 'WETH',
    decimals: 18,
    name: 'Wrapped Ether',
  },
} as const;

// Simple pool pricing (mock for POC - will be replaced by real DEX integration)
const MOCK_POOLS: Record<string, {
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  fee: number;
}> = {
  'ETH-USDC': {
    token0: TOKENS.ETH.address,
    token1: TOKENS.USDC.address,
    reserve0: '1000000000000000000000', // 1000 ETH
    reserve1: '3000000000', // 3000 USDC (6 decimals)
    fee: 0.003,
  },
  'ETH-USDT': {
    token0: TOKENS.ETH.address,
    token1: TOKENS.USDT.address,
    reserve0: '1000000000000000000000',
    reserve1: '3000000000',
    fee: 0.003,
  },
  'ETH-DAI': {
    token0: TOKENS.ETH.address,
    token1: TOKENS.DAI.address,
    reserve0: '1000000000000000000000',
    reserve1: '3000000000000000000000',
    fee: 0.003,
  },
  'USDC-USDT': {
    token0: TOKENS.USDC.address,
    token1: TOKENS.USDT.address,
    reserve0: '1000000000',
    reserve1: '1000000000',
    fee: 0.001,
  },
  'USDC-DAI': {
    token0: TOKENS.USDC.address,
    token1: TOKENS.DAI.address,
    reserve0: '1000000000',
    reserve1: '1000000000000000000000',
    fee: 0.001,
  },
  'USDT-DAI': {
    token0: TOKENS.USDT.address,
    token1: TOKENS.DAI.address,
    reserve0: '1000000000',
    reserve1: '1000000000000000000000',
    fee: 0.001,
  },
};

export type SwapStep =
  | 'idle'
  | 'preparing'
  | 'checking_balance'
  | 'shielding'
  | 'shielding_token'
  | 'waiting_poi'
  | 'generating_proof'
  | 'executing_swap'
  | 'unshielding'
  | 'complete'
  | 'error';

export interface SwapProgress {
  step: SwapStep;
  progress: number; // 0-100
  message: string;
  details?: string;

  // Shield phase
  shieldTxHash?: string;
  shieldResults?: any[];

  // POI phase
  poiProgress?: number;
  poiEstimatedTime?: number;

  // ZK Proof phase
  zkProofProgress?: number;
  zkProofCircuit?: string;

  // Swap phase
  swapTxHash?: string;

  // Unshield phase
  unshieldTxHash?: string;

  // Multi-token support
  currentTokenIndex?: number;
  totalTokens?: number;
  currentToken?: string;

  error?: string;
}

export interface SwapResult {
  success: boolean;

  // Transaction hashes
  shieldTxHash?: string;
  swapTxHash?: string;
  unshieldTxHash?: string;

  // Amounts
  amountIn?: string;
  amountOut?: string;

  // Addresses
  senderInfo: {
    publicAddress: string;
    railgunAddress?: string;
  };

  // Privacy proof
  privacyProof?: {
    shieldTxLink: string;
    swapTxLink?: string;
    unshieldTxLink?: string;
    explanation: string;
  };

  error?: string;
}

export interface TokenInfo {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  name: string;
}

interface PrivateSwapState {
  isSwapping: boolean;
  progress: SwapProgress;
  result: SwapResult | null;
  shieldedBalance: bigint;

  // RAILGUN wallet info
  railgunWalletID: string | null;
  railgunAddress: string | null;
  railgunWalletStatus: 'none' | 'creating' | 'ready' | 'error';
}

const STEP_MESSAGES: Record<SwapStep, string> = {
  idle: 'Ready to swap',
  preparing: 'Preparing swap...',
  checking_balance: 'Checking shielded balance...',
  shielding: 'Shielding tokens to private pool...',
  shielding_token: 'Shielding token...',
  waiting_poi: 'Waiting for Proof of Innocence verification...',
  generating_proof: 'Generating ZK proof...',
  executing_swap: 'Executing private swap...',
  unshielding: 'Unshielding output tokens...',
  complete: 'Swap complete!',
  error: 'Swap failed',
};

/**
 * Calculate output amount using constant product formula (x * y = k)
 */
function calculateOutput(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
  fee: number
): bigint {
  if (reserveIn === 0n || reserveOut === 0n) return 0n;

  const amountInWithFee = amountIn * BigInt(Math.floor((1 - fee) * 1000000)) / 1000000n;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn + amountInWithFee;

  return numerator / denominator;
}

/**
 * Get output amount for a token pair
 */
export function getSwapOutput(
  tokenIn: TokenInfo,
  tokenOut: TokenInfo,
  amountIn: string
): string {
  const pairKey = [tokenIn.symbol, tokenOut.symbol].sort().join('-');

  if (tokenIn.address === tokenOut.address) {
    return amountIn;
  }

  const pool = MOCK_POOLS[pairKey];
  if (!pool) {
    return '0';
  }

  const isToken0First = pool.token0 === tokenIn.address;
  const amountInBigInt = parseUnits(amountIn, tokenIn.decimals);

  const output = calculateOutput(
    amountInBigInt,
    BigInt(isToken0First ? pool.reserve0 : pool.reserve1),
    BigInt(isToken0First ? pool.reserve1 : pool.reserve0),
    pool.fee
  );

  return formatUnits(output, tokenOut.decimals);
}

/**
 * Get all available tokens
 */
export function getAllTokens(): TokenInfo[] {
  return Object.values(TOKENS);
}

/**
 * Get token by symbol
 */
export function getTokenBySymbol(symbol: string): TokenInfo | undefined {
  return TOKENS[symbol as keyof typeof TOKENS];
}

/**
 * RAILGUN Wallet Derivation
 *
 * Derives a deterministic RAILGUN wallet from the connected wallet signature.
 * The same EOA always produces the same RAILGUN address.
 */
const DERIVATION_MESSAGE =
  'Sign this message to create your private RAILGUN wallet for Orbit Privacy Swap.\n\nThis signature is free and does not cost any gas.';

/**
 * Private Swap Hook with Real RAILGUN Integration
 *
 * Implements the complete private swap flow via API:
 * 1. RAILGUN wallet setup (deterministic from connected wallet)
 * 2. Shield input tokens (via relayer, gasless for user)
 * 3. POI verification (~60 seconds in production)
 * 4. ZK proof generation for swap
 * 5. Private swap execution
 * 6. Unshield output tokens (via relayer, gasless for user)
 *
 * Uses Server-Sent Events (SSE) for real-time progress updates.
 */
export function usePrivateSwap() {
  const { address: senderAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<PrivateSwapState>({
    isSwapping: false,
    progress: { step: 'idle', progress: 0, message: STEP_MESSAGES.idle },
    result: null,
    shieldedBalance: 0n,
    railgunWalletID: null,
    railgunAddress: null,
    railgunWalletStatus: 'none',
  });

  // Auto-restore RAILGUN wallet from localStorage when connected
  useEffect(() => {
    if (!isConnected || !senderAddress || state.railgunWalletStatus !== 'none') {
      return;
    }

    const storageKey = `railgun_wallet_${senderAddress}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const { walletID, railgunAddress } = JSON.parse(stored);
        console.log('[usePrivateSwap] Restored RAILGUN wallet:', railgunAddress);
        setState(prev => ({
          ...prev,
          railgunWalletID: walletID,
          railgunAddress,
          railgunWalletStatus: 'ready',
        }));
      } catch (err) {
        console.error('[usePrivateSwap] Failed to restore wallet:', err);
        localStorage.removeItem(storageKey);
      }
    }
  }, [isConnected, senderAddress, state.railgunWalletStatus]);

  /**
   * Initialize RAILGUN engine
   */
  const initializeEngine = useCallback(async () => {
    const response = await fetch('/api/railgun/init', { method: 'POST' });
    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      throw new Error(data.error || 'Failed to initialize RAILGUN engine');
    }

    console.log('[usePrivateSwap] RAILGUN engine initialized');
    return data;
  }, []);

  /**
   * Create or restore RAILGUN wallet
   */
  const ensureRailgunWallet = useCallback(async (): Promise<{ walletID: string | null; railgunAddress: string | null }> => {
    if (state.railgunWalletStatus === 'ready') {
      return {
        walletID: state.railgunWalletID,
        railgunAddress: state.railgunAddress,
      };
    }

    if (state.railgunWalletStatus === 'creating') {
      throw new Error('Wallet creation already in progress');
    }

    setState(prev => ({ ...prev, railgunWalletStatus: 'creating' }));

    try {
      // Initialize engine first
      await initializeEngine();

      // Check if we have a stored wallet
      const storageKey = `railgun_wallet_${senderAddress}`;
      const stored = localStorage.getItem(storageKey);

      let walletData;
      if (stored) {
        // Restore existing wallet
        const { mnemonic, password } = JSON.parse(stored);
        console.log('[usePrivateSwap] Creating RAILGUN wallet from stored mnemonic...');

        const response = await fetch('/api/railgun/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mnemonic, password }),
        });

        walletData = await response.json();

        if (!response.ok || !walletData.success) {
          throw new Error(walletData.error || 'Failed to restore wallet');
        }
      } else {
        // Create new deterministic wallet from signature
        if (!walletClient) {
          throw new Error('Wallet client not available');
        }

        console.log('[usePrivateSwap] Creating deterministic RAILGUN wallet...');

        // Request signature to derive wallet
        const signature = await walletClient.signMessage({
          account: senderAddress,
          message: DERIVATION_MESSAGE,
        });

        // Hash signature to create entropy for mnemonic
        const hash = keccak256(signature as `0x${string}`);
        const entropy = hash.slice(0, 34); // 0x + 32 hex chars = 16 bytes

        // Generate 12-word mnemonic from entropy
        const mnemonic = Mnemonic.fromEntropy(entropy).phrase;
        const password = `orbit_${senderAddress}`;

        // Save to localStorage for persistence
        localStorage.setItem(storageKey, JSON.stringify({ mnemonic, password }));

        // Create wallet
        const response = await fetch('/api/railgun/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mnemonic, password }),
        });

        walletData = await response.json();

        if (!response.ok || !walletData.success) {
          throw new Error(walletData.error || 'Failed to create wallet');
        }

        console.log('[usePrivateSwap] Created RAILGUN wallet:', walletData.railgunAddress);
      }

      setState(prev => ({
        ...prev,
        railgunWalletID: walletData.walletID || null,
        railgunAddress: walletData.railgunAddress || null,
        railgunWalletStatus: 'ready',
      }));

      return walletData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to setup wallet';
      setState(prev => ({
        ...prev,
        railgunWalletStatus: 'error',
      }));
      throw error;
    }
  }, [senderAddress, walletClient, state.railgunWalletStatus, initializeEngine]);

  const updateProgress = useCallback((
    step: SwapStep,
    progress: number,
    message: string,
    details?: SwapProgress['details']
  ) => {
    setState(prev => ({
      ...prev,
      progress: { step, progress, message, details },
    }));
  }, []);

  /**
   * Load wallet credentials from localStorage
   */
  const getWalletCredentials = useCallback((): { mnemonic: string; password: string } | null => {
    if (!senderAddress) return null;

    const storageKey = `railgun_wallet_${senderAddress}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) return null;

    try {
      const { mnemonic, password } = JSON.parse(stored);
      return { mnemonic, password };
    } catch {
      return null;
    }
  }, [senderAddress]);

  /**
   * Execute a private swap via RAILGUN API with SSE streaming
   */
  const executeSwap = useCallback(async (
    tokenIn: TokenInfo,
    tokenOut: TokenInfo,
    amountIn: string,
    stealthMode: boolean = true,
    minAmountOut?: string
  ): Promise<SwapResult> => {
    if (!senderAddress) {
      throw new Error('Wallet not connected');
    }

    if (!publicClient || !walletClient) {
      throw new Error('Wallet client not available');
    }

    setState(prev => ({ ...prev, isSwapping: true, result: null }));

    try {
      // Ensure RAILGUN wallet is ready for stealth mode; use returned data (state may not have updated yet)
      let walletData: { walletID: string | null; railgunAddress: string | null } | null = null;
      if (stealthMode) {
        walletData = await ensureRailgunWallet();
      }

      updateProgress('preparing', 5, 'Initializing swap...');

      const amountInBigInt = parseUnits(amountIn, tokenIn.decimals);
      const expectedOutput = getSwapOutput(tokenIn, tokenOut, amountIn);
      const minAmount = minAmountOut || expectedOutput;

      // Get wallet credentials from localStorage
      const credentials = getWalletCredentials();

      if (stealthMode && !credentials) {
        throw new Error('RAILGUN wallet not found. Please try again.');
      }

      // Call swap API with SSE streaming (use walletData from ensureRailgunWallet, not stale state)
      const response = await fetch('/api/railgun/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderWalletID: (walletData?.walletID ?? state.railgunWalletID) || '',
          senderEncryptionKey: '', // Will be populated by API
          senderRailgunAddress: (walletData?.railgunAddress ?? state.railgunAddress) || '',
          userAddress: senderAddress,
          mnemonic: credentials?.mnemonic || '',
          password: credentials?.password || '',
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amountIn: amountInBigInt.toString(),
          minAmountOut: parseUnits(minAmount, tokenOut.decimals).toString(),
          slippage: 0.5,
          gasAbstraction: 'permit',
          privateMode: stealthMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Swap failed');
      }

      // Check if we got SSE streaming response
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('text/event-stream') && response.body) {
        // Parse SSE events for real-time progress
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalData: any = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events (format: "event: {...}\ndata: {...}\n\n")
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            try {
              const eventData = JSON.parse(line.slice(6));

              if (eventData.type === 'progress') {
                updateProgress(
                  eventData.data.step,
                  eventData.data.progress,
                  eventData.data.message,
                  eventData.data
                );
              } else if (eventData.type === 'complete') {
                finalData = eventData.data;
              } else if (eventData.type === 'error') {
                throw new Error(eventData.data.error || 'Swap failed');
              }
            } catch (parseError) {
              console.warn('[usePrivateSwap] Failed to parse SSE event:', line);
            }
          }
        }

        if (!finalData) {
          throw new Error('Swap failed: no final response received');
        }

        const result: SwapResult = {
          success: true,
          shieldTxHash: finalData.shieldTxHash,
          swapTxHash: finalData.swapTxHash,
          unshieldTxHash: finalData.unshieldTxHash,
          amountIn,
          amountOut: finalData.amountOut,
          senderInfo: {
            publicAddress: senderAddress,
            railgunAddress: state.railgunAddress || undefined,
          },
          privacyProof: {
            shieldTxLink: finalData.shieldTxHash
              ? `https://sepolia.etherscan.io/tx/${finalData.shieldTxHash}`
              : '',
            swapTxLink: finalData.swapTxHash
              ? `https://sepolia.etherscan.io/tx/${finalData.swapTxHash}`
              : '',
            unshieldTxLink: finalData.unshieldTxHash
              ? `https://sepolia.etherscan.io/tx/${finalData.unshieldTxHash}`
              : '',
            explanation: stealthMode
              ? `Privately swapped ${amountIn} ${tokenIn.symbol} for ${finalData.amountOut} ${tokenOut.symbol}. No on-chain link between sender and recipient.`
              : `Public swap - transaction is visible on blockchain.`,
          },
        };

        setState(prev => ({ ...prev, isSwapping: false, result }));
        return result;

      } else {
        // Fallback: non-streaming JSON response
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Swap failed');
        }

        const result: SwapResult = {
          success: true,
          shieldTxHash: data.shieldTxHash,
          swapTxHash: data.swapTxHash,
          unshieldTxHash: data.unshieldTxHash,
          amountIn,
          amountOut: data.amountOut,
          senderInfo: {
            publicAddress: senderAddress,
            railgunAddress: state.railgunAddress || undefined,
          },
        };

        setState(prev => ({ ...prev, isSwapping: false, result }));
        return result;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Swap failed';
      updateProgress('error', 0, errorMessage);

      const result: SwapResult = {
        success: false,
        senderInfo: {
          publicAddress: senderAddress,
        },
        error: errorMessage,
      };

      setState(prev => ({ ...prev, isSwapping: false, result }));
      return result;
    }
  }, [
    senderAddress,
    publicClient,
    walletClient,
    state.railgunWalletID,
    state.railgunAddress,
    state.railgunWalletStatus,
    ensureRailgunWallet,
    updateProgress,
  ]);

  const resetSwap = useCallback(() => {
    setState({
      isSwapping: false,
      progress: { step: 'idle', progress: 0, message: STEP_MESSAGES.idle },
      result: null,
      shieldedBalance: state.shieldedBalance,
      railgunWalletID: state.railgunWalletID,
      railgunAddress: state.railgunAddress,
      railgunWalletStatus: state.railgunWalletStatus,
    });
  }, [state.shieldedBalance, state.railgunWalletID, state.railgunAddress, state.railgunWalletStatus]);

  return {
    ...state,
    executeSwap,
    resetSwap,
    tokens: TOKENS,
    initializeEngine,
    ensureRailgunWallet,
  };
}
