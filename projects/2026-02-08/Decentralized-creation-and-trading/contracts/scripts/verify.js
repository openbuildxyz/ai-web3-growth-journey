const hre = require("hardhat");

/**
 * 验证脚本 - 在区块链浏览器上验证合约
 */
async function main() {
  const fs = require("fs");
  
  // 读取部署信息
  if (!fs.existsSync("deployment-info.json")) {
    console.error("错误: 未找到 deployment-info.json 文件");
    console.error("请先运行部署脚本: npx hardhat run scripts/deploy.js --network <network>");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json", "utf8"));
  const { deployer, contracts } = deploymentInfo;

  console.log("开始验证合约...\n");

  // 验证ContentToken
  console.log("正在验证 ContentToken...");
  try {
    await hre.run("verify:verify", {
      address: contracts.ContentToken,
      constructorArguments: [deployer]
    });
    console.log("✓ ContentToken 验证成功\n");
  } catch (error) {
    console.log("ContentToken 验证失败:", error.message, "\n");
  }

  // 验证ContentPlatform
  console.log("正在验证 ContentPlatform...");
  try {
    await hre.run("verify:verify", {
      address: contracts.ContentPlatform,
      constructorArguments: [contracts.ContentToken, deployer]
    });
    console.log("✓ ContentPlatform 验证成功\n");
  } catch (error) {
    console.log("ContentPlatform 验证失败:", error.message, "\n");
  }

  console.log("验证完成!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
