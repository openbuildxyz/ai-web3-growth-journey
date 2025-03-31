import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';

dotenv.config();

// 从环境变量获取私钥，如果不存在则使用默认值
const PRIVATE_KEY =
  process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';
const SEPOLIA_URL = process.env.SEPOLIA_URL || 'https://eth-sepolia.g.alchemy.com/v2/your-api-key';
const SCROLL_URL = process.env.SCROLL_URL || 'https://sepolia-rpc.scroll.io';

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  networks: {
    // 本地网络
    hardhat: {},
    // 测试网
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
    },
    // Scroll Sepolia测试网
    scrollSepolia: {
      url: SCROLL_URL,
      accounts: [PRIVATE_KEY],
    },
    // 添加其他需要的网络
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
