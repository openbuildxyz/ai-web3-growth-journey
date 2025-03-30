const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

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
  
  // 本地测试环境使用模拟值代替Chainlink VRF
  // 注意：这仅用于本地测试，不要在测试网或主网上使用这些值
  const mockVrfCoordinator = deployer.address; // 本地开发时使用部署者地址作为模拟值
  const mockLinkToken = deployer.address;      // 本地开发时使用部署者地址作为模拟值
  const mockKeyHash = "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4"; // 模拟值
  
  // 部署游戏合约
  const TrisolarisDraw = await hre.ethers.getContractFactory("TrisolarisDraw");
  const trisolarisDraw = await TrisolarisDraw.deploy(
    triToken.address,
    cardLibrary.address,
    mockVrfCoordinator,
    mockLinkToken,
    mockKeyHash
  );
  await trisolarisDraw.deployed();
  console.log("TrisolarisDraw deployed to:", trisolarisDraw.address);
  
  // 将游戏合约设为代币的所有者，以便它可以铸造奖励代币
  await triToken.transferOwnership(trisolarisDraw.address);
  console.log("Ownership of TrisolarisCoin transferred to game contract");

  // 记录部署的合约地址，以便前端使用
  console.log("\n----- 复制以下地址到前端环境变量中 -----");
  console.log(`REACT_APP_TRI_TOKEN_ADDRESS=${triToken.address}`);
  console.log(`REACT_APP_GAME_CONTRACT_ADDRESS=${trisolarisDraw.address}`);
  console.log("----------------------------------------\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
