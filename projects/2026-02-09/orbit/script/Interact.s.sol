// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/OrbToken.sol";
import "../src/OrbPool.sol";

/**
 * @title InteractScript
 * @dev Interact with deployed OrbToken and OrbPool contracts
 *
 * Usage:
 * forge script script/Interact.s:InteractScript --rpc-url $RPC_URL --private-key $PRIVATE_KEY
 */
contract InteractScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Load deployment addresses from environment
        address orbUSDAddress = vm.envAddress("ORBUSD_ADDRESS");
        address orbETHAddress = vm.envAddress("ORBETH_ADDRESS");
        address poolAddress = vm.envAddress("POOL_ADDRESS");

        console.log("\n=== Interacting with Deployed Contracts ===");
        console.log("OrbUSD:", orbUSDAddress);
        console.log("OrbETH:", orbETHAddress);
        console.log("OrbPool:", poolAddress);

        // Get contract instances
        OrbToken orbUSD = OrbToken(orbUSDAddress);
        OrbToken orbETH = OrbToken(orbETHAddress);
        OrbPool pool = OrbPool(poolAddress);

        address sender = vm.addr(deployerPrivateKey);

        // Check balances
        uint256 orbUSDBalance = orbUSD.balanceOf(sender);
        uint256 orbETHBalance = orbETH.balanceOf(sender);
        uint256 lpBalance = pool.balanceOf(sender);

        console.log("\nBalances:");
        console.log("  OrbUSD:", orbUSDBalance / 1e18);
        console.log("  OrbETH:", orbETHBalance / 1e18);
        console.log("  LP Tokens:", lpBalance / 1e18);

        // Get pool reserves
        (uint256 reserve0, uint256 reserve1) = pool.getReserves();
        console.log("\nPool Reserves:");
        console.log("  OrbUSD:", reserve0 / 1e18);
        console.log("  OrbETH:", reserve1 / 1e18);

        // Calculate price
        uint256 price = (reserve0 * 1e18) / reserve1;
        console.log("  Price (USD per ETH):", price / 1e18);

        // Quote a swap (1 ETH)
        uint256 swapAmount = 1e18;
        uint256 quote = pool.quote(swapAmount, orbETHAddress, orbUSDAddress);
        console.log("\nSwap Quote (1 OrbETH):");
        console.log("  Output:", quote / 1e18, "OrbUSD");
        console.log("  Rate:", (quote * 1e18 / swapAmount) / 1e18, "USD per ETH");
    }
}
