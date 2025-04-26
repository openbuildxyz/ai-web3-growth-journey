// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Config} from "./Config.s.sol";

contract DeployToGalileo is Script {
    Config config;

    function setUp() public {
        config = new Config();
    }

    function run() public {
        Config.NetworkConfig memory networkConfig = config.getActiveNetworkConfig();
        console.log("Deploying to %s (Chain ID: %s)", networkConfig.name, networkConfig.chainId);
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy your contracts here
        // Example:
        // MyContract myContract = new MyContract();
        
        vm.stopBroadcast();
    }
} 