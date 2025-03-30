const hre = require("hardhat");

async function main() {
  // 部署代币合约
  const TrisolarisCoin = await hre.ethers.getContractFactory("TrisolarisCoin");
  const triToken = await TrisolarisCoin.deploy();
  await triToken.deployed();
  console.log("TrisolarisCoin deployed to:", triToken.address);
  
  // 部署卡牌库合约
  const CardLibrary = await hre.ethers.getContractFactory("CardLibrary");
  const cardLibrary = await CardLibrary.deploy();
  await cardLibrary.deployed();
  console.log("CardLibrary deployed to:", cardLibrary.address);
  
  // 部署游戏合约
  // 注意：这里需要根据您使用的网络填入正确的Chainlink VRF地址
  const vrfCoordinator = "0x..."; // 根据网络填入
  const linkToken = "0x..."; // 根据网络填入
  const keyHash = "0x..."; // 根据网络填入
  
  const TrisolarisDraw = await hre.ethers.getContractFactory("TrisolarisDraw");
  const trisolarisDraw = await TrisolarisDraw.deploy(
    triToken.address,
    cardLibrary.address,
    vrfCoordinator,
    linkToken,
    keyHash
  );
  await trisolarisDraw.deployed();
  console.log("TrisolarisDraw deployed to:", trisolarisDraw.address);
  
  // 将游戏合约设为代币的所有者，以便它可以铸造奖励代币
  await triToken.transferOwnership(trisolarisDraw.address);
  console.log("Ownership of TrisolarisCoin transferred to game contract");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });