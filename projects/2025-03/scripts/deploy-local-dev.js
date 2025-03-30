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

  // 部署本地版本的 TrisolarisDraw，只需要两个参数
  const TrisolarisDraw = await ethers.getContractFactory("TrisolarisDraw_Local");
  const trisolarisDraw = await TrisolarisDraw.deploy(triToken.address, cardLibrary.address);
  await trisolarisDraw.deployed();
  console.log("TrisolarisDraw_Local deployed to:", trisolarisDraw.address);

  // 将 TrisolarisCoin 的所有权转移给游戏合约
  await triToken.transferOwnership(trisolarisDraw.address);
  console.log("Ownership of TrisolarisCoin transferred to game contract");

  // 向部署者账户铸造一些代币进行测试
  await trisolarisDraw.mintTokens(deployer.address, ethers.utils.parseEther("1000"));
  console.log("Minted 1000 test tokens to deployer account");

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
