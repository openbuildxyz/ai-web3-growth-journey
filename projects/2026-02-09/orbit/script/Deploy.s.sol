// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/OrbToken.sol";
import "../src/OrbPool.sol";

/**
 * @title DeployScript
 * @dev Deploy OrbToken and OrbPool contracts
 *
 * Usage:
 * forge script script/Deploy.s:DeployScript --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
 */
contract DeployScript is Script {
    uint256 constant INITIAL_SUPPLY = 1_000_000 * 1e18;
    uint256 constant LIQUIDITY_USD = 10_000 * 1e18;
    uint256 constant LIQUIDITY_ETH = 5 * 1e18;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // ========================================
        // Deploy OrbUSD Token
        // ========================================
        console.log("Deploying OrbUSD token...");
        OrbToken orbUSD = new OrbToken(
            "Orbit USD",
            "ORBUSD",
            18,
            INITIAL_SUPPLY
        );
        console.log("OrbUSD deployed to:", address(orbUSD));

        // ========================================
        // Deploy OrbETH Token
        // ========================================
        console.log("Deploying OrbETH token...");
        OrbToken orbETH = new OrbToken(
            "Orbit ETH",
            "ORBETH",
            18,
            INITIAL_SUPPLY
        );
        console.log("OrbETH deployed to:", address(orbETH));

        // ========================================
        // Deploy OrbPool
        // ========================================
        console.log("Deploying OrbPool...");
        OrbPool pool = new OrbPool(
            address(orbUSD),
            address(orbETH)
        );
        console.log("OrbPool deployed to:", address(pool));

        // ========================================
        // Add Initial Liquidity
        // ========================================
        console.log("Adding initial liquidity...");

        // Approve pool to spend tokens
        orbUSD.approve(address(pool), type(uint256).max);
        orbETH.approve(address(pool), type(uint256).max);

        // Add liquidity
        (uint256 amount0, uint256 amount1, uint256 liquidity) = pool.addLiquidity(
            LIQUIDITY_USD,
            LIQUIDITY_ETH,
            0,
            0
        );

        console.log("Liquidity added:");
        console.log("  OrbUSD:", amount0 / 1e18);
        console.log("  OrbETH:", amount1 / 1e18);
        console.log("  LP Tokens:", liquidity / 1e18);

        // Get reserves
        (uint256 reserve0, uint256 reserve1) = pool.getReserves();
        console.log("\nPool reserves:");
        console.log("  OrbUSD:", reserve0 / 1e18);
        console.log("  OrbETH:", reserve1 / 1e18);

        vm.stopBroadcast();

        // ========================================
        // Verification
        // ========================================
        console.log("\n=== Deployment Complete ===");
        console.log("\nContract Addresses:");
        console.log("  OrbUSD:", address(orbUSD));
        console.log("  OrbETH:", address(orbETH));
        console.log("  OrbPool:", address(pool));

        console.log("\nAdd to .env.local:");
        console.log('  NEXT_PUBLIC_ORBUSD_ADDRESS=', address(orbUSD));
        console.log('  NEXT_PUBLIC_ORBETH_ADDRESS=', address(orbETH));
        console.log('  NEXT_PUBLIC_POOL_ADDRESS=', address(pool));

        console.log("\nInitial Price:", (reserve0 * 1e18 / reserve1) / 1e18, "USD per ETH");
    }
}
