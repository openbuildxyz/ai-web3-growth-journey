const hre = require("hardhat");

async function main() {
  // 获取网络信息
  const network = await hre.ethers.provider.getNetwork();
  console.log("部署网络信息:");
  console.log("  - 网络名称:", network.name);
  console.log("  - Chain ID:", network.chainId);
  console.log("  - RPC URL:", hre.network.config.url);

  // 获取部署账户信息
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户信息:");
  console.log("  - 地址:", deployer.address);
  const balance = await deployer.getBalance();
  console.log("  - 余额:", hre.ethers.utils.formatEther(balance), "MON");

  console.log("\n开始部署合约...");
  const GameOfLifeDemo = await hre.ethers.getContractFactory("GameOfLifeDemo");
  console.log("  - 合约工厂创建成功");
  
  const gameOfLife = await GameOfLifeDemo.deploy();
  console.log("  - 合约部署交易已发送");

  await gameOfLife.deployed();
  console.log("合约部署成功！");
  console.log("  - 合约地址:", gameOfLife.address);
  
  // 输出验证信息
  console.log("\n合约验证信息:");
  console.log(`npx hardhat verify --network monad_testnet ${gameOfLife.address}`);
}

main().catch((error) => {
  console.error("部署失败:", error);
  process.exitCode = 1;
});
