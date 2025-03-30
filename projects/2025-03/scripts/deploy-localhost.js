const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 部署 TrisolarisCoin
  const TrisolarisCoin = await ethers.getContractFactory("TrisolarisCoin");
  const triToken = await TrisolarisCoin.deploy();
  await triToken.deployed();
  console.log("TrisolarisCoin deployed to:", triToken.address);

  // 部署 CardLibrary
  const CardLibrary = await ethers.getContractFactory("CardLibrary");
  const cardLibrary = await CardLibrary.deploy();
  await cardLibrary.deployed();
  console.log("CardLibrary deployed to:", cardLibrary.address);

  // 部署 TrisolarisDraw，传入 TrisolarisCoin 地址和 CardLibrary 地址
  const TrisolarisDraw = await ethers.getContractFactory("TrisolarisDraw");
  const trisolarisDraw = await TrisolarisDraw.deploy(triToken.address, cardLibrary.address);
  await trisolarisDraw.deployed();
  console.log("TrisolarisDraw deployed to:", trisolarisDraw.address);

  // 将 TrisolarisCoin 的所有权转移给游戏合约
  await triToken.transferOwnership(trisolarisDraw.address);
  console.log("Ownership of TrisolarisCoin transferred to game contract");

  // 输出前端所需的合约地址
  console.log("\n----- 复制以下地址到前端环境变量中 -----");
  console.log(`REACT_APP_TRI_TOKEN_ADDRESS=${triToken.address}`);
  console.log(`REACT_APP_GAME_CONTRACT_ADDRESS=${trisolarisDraw.address}`);
  console.log("----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
