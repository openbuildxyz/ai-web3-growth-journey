'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatUnits, encodeFunctionData, type Address } from 'viem';
import { orbSwapRouterAbi, orbPoolQuoteAbi } from '@/lib/contracts/abis';

const WETH_SEPOLIA = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' as const;

function getEnvAddress(key: string): Address | undefined {
  const v =
    key === 'ROUTER' ? process.env.NEXT_PUBLIC_ROUTER_ADDRESS
    : key === 'POOL' ? process.env.NEXT_PUBLIC_POOL_ADDRESS
    : key === 'ORBUSD' ? process.env.NEXT_PUBLIC_ORBUSD_ADDRESS
    : key === 'WETH' ? process.env.NEXT_PUBLIC_WETH_ADDRESS
    : undefined;
  return (v as Address) || undefined;
}

export interface RealSwapTokenInfo {
  address: Address | '0x0000000000000000000000000000000000000000';
  symbol: string;
  decimals: number;
  name: string;
}

export const REAL_SWAP_ETH: RealSwapTokenInfo = {
  address: '0x0000000000000000000000000000000000000000' as Address,
  symbol: 'ETH',
  decimals: 18,
  name: 'Ethereum',
};

export function getRealSwapOrbUSD(): RealSwapTokenInfo | null {
  const addr = getEnvAddress('ORBUSD');
  if (!addr) return null;
  return {
    address: addr,
    symbol: 'OrbUSD',
    decimals: 18,
    name: 'Orbit USD',
  };
}

/**
 * Real swap: native ETH → OrbUSD via OrbSwapRouter.
 * Only active when NEXT_PUBLIC_ROUTER_ADDRESS (and pool/OrbUSD) are set.
 */
export function useRealSwap() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const routerAddress = getEnvAddress('ROUTER');
  const poolAddress = getEnvAddress('POOL');
  const orbUSDAddress = getEnvAddress('ORBUSD');
  const wethAddress = getEnvAddress('WETH') ?? WETH_SEPOLIA;

  const isRealSwapEnabled =
    !!routerAddress && !!poolAddress && !!orbUSDAddress;

  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState<string>('0');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  // Fetch quote from pool when amount changes
  useEffect(() => {
    if (!isRealSwapEnabled || !publicClient || !poolAddress || !amountIn) {
      setAmountOut('0');
      return;
    }
    const raw = parseFloat(amountIn);
    if (Number.isNaN(raw) || raw <= 0) {
      setAmountOut('0');
      return;
    }

    let cancelled = false;
    setQuoteLoading(true);
    setError(null);

    const amountInWei = parseEther(amountIn);

    publicClient
      .readContract({
        address: poolAddress,
        abi: orbPoolQuoteAbi,
        functionName: 'quote',
        args: [amountInWei, wethAddress, orbUSDAddress],
      })
      .then((quote) => {
        if (!cancelled) {
          setAmountOut(formatUnits(quote, 18));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAmountOut('0');
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg.includes('InsufficientLiquidity') || msg.includes('liquidity')
            ? 'Pool has no liquidity yet. Add liquidity first.'
            : msg);
        }
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isRealSwapEnabled, publicClient, poolAddress, wethAddress, orbUSDAddress, amountIn]);

  const executeRealSwap = useCallback(
    async (ethAmount: string, minAmountOut: string) => {
      if (!routerAddress || !walletClient || !address) {
        throw new Error('Wallet not connected');
      }
      if (!ethAmount || parseFloat(ethAmount) <= 0) {
        throw new Error('Invalid amount');
      }

      setIsSwapping(true);
      setError(null);
      setTxHash(null);

      try {
        const value = parseEther(ethAmount);
        const minOutWei = BigInt(minAmountOut);

        const data = encodeFunctionData({
          abi: orbSwapRouterAbi,
          functionName: 'swapExactETHForTokens',
          args: [minOutWei],
        });

        const hash = await walletClient.sendTransaction({
          to: routerAddress,
          data,
          value,
          account: address,
        });

        setTxHash(hash);
        return { success: true, txHash: hash };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Swap failed';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsSwapping(false);
      }
    },
    [routerAddress, walletClient, address]
  );

  return {
    isRealSwapEnabled,
    amountIn,
    setAmountIn,
    amountOut,
    quoteLoading,
    isSwapping,
    txHash,
    error,
    executeRealSwap,
    orbUSDAddress,
    routerAddress,
  };
}
