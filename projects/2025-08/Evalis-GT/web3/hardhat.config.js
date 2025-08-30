require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: '0.8.24',
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    sepolia: {
      url: SEPOLIA_RPC_URL || '',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};
