require('dotenv/config');
require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-verify');

const rpcUrl =
  process.env.SEPOLIA_RPC_URL ||
  process.env.ETH_RPC_URL ||
  'https://sepolia.drpc.org';

const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    sepolia: {
      url: rpcUrl,
      accounts: deployerKey ? [deployerKey] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || '',
  },
};
