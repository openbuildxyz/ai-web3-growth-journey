require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

try {
  require("dotenv").config();
} catch (error) {
  console.log("No .env file found. Using default configuration.");
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    }
    // 其他网络配置将在部署时添加
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
