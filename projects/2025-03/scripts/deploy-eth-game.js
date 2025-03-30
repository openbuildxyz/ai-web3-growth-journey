const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // 部署 CardLibrary
  const CardLibrary = await ethers.getContractFactory("CardLibrary");
  const cardLibrary = await CardLibrary.deploy();
  await cardLibrary.deployed();
  console.log("CardLibrary deployed to:", cardLibrary.address);

  // 部署基于ETH的 TrisolarisDraw
  const TrisolarisDraw = await ethers.getContractFactory("TrisolarisDraw_ETH");
  const trisolarisDraw = await TrisolarisDraw.deploy(cardLibrary.address);
  await trisolarisDraw.deployed();
  console.log("TrisolarisDraw_ETH deployed to:", trisolarisDraw.address);

  // 输出前端所需的合约地址
  console.log("\n----- 复制以下地址到前端环境变量中 -----");
  console.log(`REACT_APP_GAME_CONTRACT_ADDRESS=${trisolarisDraw.address}`);
  console.log("----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
