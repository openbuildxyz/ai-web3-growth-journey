const hre = require("hardhat");

/**
 * 部署脚本 - 部署ContentToken和ContentPlatform合约
 */
async function main() {
  console.log("开始部署合约...\n");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 部署ContentToken
  console.log("正在部署 ContentToken...");
  const ContentToken = await hre.ethers.getContractFactory("ContentToken");
  const contentToken = await ContentToken.deploy(deployer.address);
  await contentToken.waitForDeployment();
  const tokenAddress = await contentToken.getAddress();
  console.log("✓ ContentToken 部署成功:", tokenAddress, "\n");

  // 部署ContentPlatform
  console.log("正在部署 ContentPlatform...");
  const ContentPlatform = await hre.ethers.getContractFactory("ContentPlatform");
  const contentPlatform = await ContentPlatform.deploy(tokenAddress, deployer.address);
  await contentPlatform.waitForDeployment();
  const platformAddress = await contentPlatform.getAddress();
  console.log("✓ ContentPlatform 部署成功:", platformAddress, "\n");

  // 授予平台合约铸币权限
  console.log("正在授予平台合约铸币权限...");
  const addMinterTx = await contentToken.addMinter(platformAddress);
  await addMinterTx.wait();
  console.log("✓ 铸币权限授予成功\n");

  // 向平台合约转入代币用于分润
  console.log("正在向平台合约转入代币...");
  const transferAmount = hre.ethers.parseEther("10000000"); // 1000万代币
  const transferTx = await contentToken.transfer(platformAddress, transferAmount);
  await transferTx.wait();
  console.log("✓ 已转入", hre.ethers.formatEther(transferAmount), "CPT 到平台合约\n");

  // 打印部署摘要
  console.log("=".repeat(60));
  console.log("部署摘要");
  console.log("=".repeat(60));
  console.log("ContentToken 地址:", tokenAddress);
  console.log("ContentPlatform 地址:", platformAddress);
  console.log("部署账户:", deployer.address);
  console.log("平台代币余额:", hre.ethers.formatEther(await contentToken.balanceOf(platformAddress)), "CPT");
  console.log("=".repeat(60));

  // 保存部署信息到文件
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ContentToken: tokenAddress,
      ContentPlatform: platformAddress
    }
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✓ 部署信息已保存到 deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
