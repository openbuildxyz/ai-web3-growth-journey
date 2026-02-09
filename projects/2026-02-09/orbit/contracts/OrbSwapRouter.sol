// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./OrbPool.sol";
import "./IWETH.sol";

/**
 * @title OrbSwapRouter
 * @dev Swap native ETH for OrbUSD via WETH/OrbUSD pool.
 *      User sends ETH; router wraps to WETH and swaps for OrbUSD in one tx.
 */
contract OrbSwapRouter is ReentrancyGuard {
    IWETH public immutable weth;
    OrbPool public immutable pool;

    /// pool must have token0 = WETH, token1 = OrbUSD
    constructor(address _weth, address _pool) {
        weth = IWETH(_weth);
        pool = OrbPool(payable(_pool));
    }

    /**
     * @dev Swap exact native ETH for OrbUSD (minimum amount out with slippage).
     * @param amountOutMinimum Minimum OrbUSD to receive (slippage protection).
     */
    function swapExactETHForTokens(uint256 amountOutMinimum) external payable nonReentrant returns (uint256 amountOut) {
        if (msg.value == 0) revert ZeroValue();

        // Wrap ETH to WETH
        weth.deposit{ value: msg.value }();

        // Pool expects token0 = WETH, token1 = OrbUSD. Swapping token0 for token1.
        weth.approve(address(pool), msg.value);

        (uint256 amount0Out, ) = pool.swap(
            msg.value,  // amount0In (WETH)
            0,         // amount1In
            amountOutMinimum, // amount0OutMinimum (min OrbUSD out)
            0,         // amount1OutMinimum
            msg.sender // to
        );

        return amount0Out; // OrbUSD out (pool returns token1 amount in first slot for this direction)
    }

    error ZeroValue();
}
