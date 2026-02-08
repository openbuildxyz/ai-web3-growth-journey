require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // 本地开发网络
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    
    // Polygon Mumbai测试网
    polygon_mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: 35000000000 // 35 gwei
    },
    
    // Monad测试网（待配置实际参数）
    monad_testnet: {
      url: process.env.MONAD_TESTNET_RPC_URL || "https://testnet-rpc.monad.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.MONAD_CHAIN_ID || "0"),
      gasPrice: "auto"
    }
  },
  
  // Etherscan验证配置
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      // Monad的验证API配置（待补充）
      monadTestnet: process.env.MONAD_API_KEY || ""
    },
    customChains: [
      {
        network: "monadTestnet",
        chainId: parseInt(process.env.MONAD_CHAIN_ID || "0"),
        urls: {
          apiURL: process.env.MONAD_API_URL || "",
          browserURL: process.env.MONAD_EXPLORER_URL || ""
        }
      }
    ]
  },
  
  // Gas报告配置
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true
  },
  
  // 路径配置
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
