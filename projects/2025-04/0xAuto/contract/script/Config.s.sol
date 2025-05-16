// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";

contract Config is Script {
    struct NetworkConfig {
        string name;
        uint256 chainId;
        string tokenSymbol;
        string rpcUrl;
        string storageIndexerUrl;
        string chainExplorer;
        string storageExplorer;
        string faucet;
    }

    NetworkConfig public galileoConfig;

    constructor() {
        galileoConfig = NetworkConfig({
            name: "0G-Galileo-Testnet",
            chainId: 80087,
            tokenSymbol: "OG",
            rpcUrl: "https://evmrpc-testnet.0g.ai",
            storageIndexerUrl: "https://indexer-storage-testnet-turbo.0g.ai",
            chainExplorer: "https://chainscan-galileo.0g.ai/",
            storageExplorer: "https://storagescan-galileo.0g.ai/",
            faucet: "https://faucet.0g.ai/"
        });
    }

    function getActiveNetworkConfig() public view returns (NetworkConfig memory) {
        if (block.chainid == galileoConfig.chainId) {
            return galileoConfig;
        }
        
        // Default to Galileo testnet
        return galileoConfig;
    }
} 