/**
 * Minimal ABIs for OrbSwapRouter and OrbPool (real swap: ETH → OrbUSD)
 */

export const orbSwapRouterAbi = [
  {
    inputs: [{ name: 'amountOutMinimum', type: 'uint256' }],
    name: 'swapExactETHForTokens',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export const orbPoolQuoteAbi = [
  {
    inputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
    ],
    name: 'quote',
    outputs: [{ name: 'amountB', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
