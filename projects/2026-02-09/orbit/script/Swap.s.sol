// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/OrbToken.sol";
import "../src/OrbPool.sol";

/**
 * @title SwapScript
 * @dev Execute a token swap on OrbPool
 *
 * Usage:
 * forge script script/Swap.s.sol:SwapScript --rpc-url $RPC_URL --private-key $PRIVATE_KEY
 */
contract SwapScript is Script {
    enum Direction {
        ETH_TO_USD,
        USD_TO_ETH
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address sender = vm.addr(deployerPrivateKey);

        // Get addresses from environment
        address orbUSDAddress = vm.envAddress("ORBUSD_ADDRESS");
        address orbETHAddress = vm.envAddress("ORBETH_ADDRESS");
        address poolAddress = vm.envAddress("POOL_ADDRESS");

        // Get swap parameters
        string memory directionStr = vm.envString("DIRECTION");
        Direction direction = keccak256(bytes(directionStr)) == keccak256(bytes("ETH_TO_USD"))
            ? Direction.ETH_TO_USD
            : Direction.USD_TO_ETH;
        uint256 amount = vm.envUint("AMOUNT");

        console.log("\n=== Executing Swap ===");
        console.log("Direction:", direction == Direction.ETH_TO_USD ? "ETH_TO_USD" : "USD_TO_ETH");
        console.log("Amount:", amount / 1e18);

        // Get contracts
        OrbToken orbUSD = OrbToken(orbUSDAddress);
        OrbToken orbETH = OrbToken(orbETHAddress);
        OrbPool pool = OrbPool(poolAddress);

        vm.startBroadcast(deployerPrivateKey);

        if (direction == Direction.ETH_TO_USD) {
            console.log("\nSwapping OrbETH -> OrbUSD");

            // Check balance
            uint256 balance = orbETH.balanceOf(sender);
            console.log("OrbETH Balance:", balance / 1e18);
            require(balance >= amount, "Insufficient balance");

            // Approve pool
            orbETH.approve(poolAddress, amount);
            console.log("Approved OrbETH");

            // Get quote
            uint256 expectedOutput = pool.quote(amount, orbETHAddress, orbUSDAddress);
            console.log("Expected Output:", expectedOutput / 1e18, "OrbUSD");

            // Execute swap with 5% slippage
            uint256 amount0OutMinimum = 0;
            uint256 amount1OutMinimum = (expectedOutput * 95) / 100;

            pool.swap(
                0, // amount0In
                amount, // amount1In
                amount0OutMinimum,
                amount1OutMinimum,
                sender // to
            );

            console.log("Swap complete");

        } else {
            console.log("\nSwapping OrbUSD -> OrbETH");

            // Check balance
            uint256 balance = orbUSD.balanceOf(sender);
            console.log("OrbUSD Balance:", balance / 1e18);
            require(balance >= amount, "Insufficient balance");

            // Approve pool
            orbUSD.approve(poolAddress, amount);
            console.log("Approved OrbUSD");

            // Get quote
            uint256 expectedOutput = pool.quote(amount, orbUSDAddress, orbETHAddress);
            console.log("Expected Output:", expectedOutput / 1e18, "OrbETH");

            // Execute swap with 5% slippage
            uint256 amount0OutMinimum = (expectedOutput * 95) / 100;
            uint256 amount1OutMinimum = 0;

            pool.swap(
                amount, // amount0In
                0, // amount1In
                amount0OutMinimum,
                amount1OutMinimum,
                sender // to
            );

            console.log("Swap complete");
        }

        vm.stopBroadcast();

        // Get new balances
        uint256 newUSDBalance = orbUSD.balanceOf(sender);
        uint256 newETHBalance = orbETH.balanceOf(sender);

        console.log("\nNew Balances:");
        console.log("  OrbUSD:", newUSDBalance / 1e18);
        console.log("  OrbETH:", newETHBalance / 1e18);
    }
}
