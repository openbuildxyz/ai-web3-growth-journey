const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Token Transfer contracts...");

  // Get the contract factory
  const TokenTransfer = await ethers.getContractFactory("TokenTransfer");
  const SimpleTokenTransfer = await ethers.getContractFactory("SimpleTokenTransfer");

  // Deploy the comprehensive token contract
  const tokenTransfer = await TokenTransfer.deploy(
    "MyToken",           // Token name
    "MTK",               // Token symbol
    1000000,             // Initial supply (1 million tokens)
    100,                 // Transfer fee: 1% (100 basis points)
    ethers.utils.parseEther("10000") // Max transfer: 10,000 tokens
  );
  await tokenTransfer.deployed();
  console.log("TokenTransfer deployed to:", tokenTransfer.address);

  // Deploy the simple token contract
  const simpleToken = await SimpleTokenTransfer.deploy(
    "SimpleToken",       // Token name
    "STK",               // Token symbol
    1000000              // Initial supply (1 million tokens)
  );
  await simpleToken.deployed();
  console.log("SimpleTokenTransfer deployed to:", simpleToken.address);

  console.log("\nDeployment completed successfully!");
  console.log("TokenTransfer (Advanced):", tokenTransfer.address);
  console.log("SimpleTokenTransfer (Basic):", simpleToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
