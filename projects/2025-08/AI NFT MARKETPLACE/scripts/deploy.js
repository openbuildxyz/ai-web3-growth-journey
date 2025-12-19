const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy AI_NFT
  const AINFT = await hre.ethers.getContractFactory("AI_NFT");
  const aiNft = await AINFT.deploy();
  await aiNft.deployed();
  console.log(`AI_NFT contract deployed to: ${aiNft.address}`);

  // Deploy Marketplace
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.deployed();
  console.log(`Marketplace contract deployed to: ${marketplace.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
