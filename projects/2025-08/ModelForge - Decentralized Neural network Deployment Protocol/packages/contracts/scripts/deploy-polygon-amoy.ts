import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying to Polygon Amoy Testnet");
    console.log("═".repeat(40));

    const [deployer] = await ethers.getSigners();

    if (!deployer) {
        throw new Error("No deployer account found");
    }

    console.log("📤 Deploying from account:", await deployer.getAddress());

    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");

    if (balance === 0n) {
        console.log("");
        console.log("⚠️  WARNING: No MATIC balance detected!");
        console.log("🔗 Get test MATIC from: https://faucet.polygon.technology/");
        console.log("📍 Network: Polygon Amoy");
        console.log("🔗 Chain ID: 80002");
        console.log("");
        return;
    }

    // Deploy ForgeToken
    console.log("\n1️⃣ Deploying ForgeToken...");
    const ForgeTokenFactory = await ethers.getContractFactory("ForgeToken");
    const forgeToken = await ForgeTokenFactory.deploy();
    await forgeToken.waitForDeployment();
    const forgeTokenAddress = await forgeToken.getAddress();
    console.log("   ✅ ForgeToken deployed at:", forgeTokenAddress);

    // Deploy ForgeFaucet
    console.log("\n2️⃣ Deploying ForgeFaucet...");
    const FaucetFactory = await ethers.getContractFactory("ForgeFaucet");
    const faucet = await FaucetFactory.deploy(forgeTokenAddress);
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress();
    console.log("   ✅ ForgeFaucet deployed at:", faucetAddress);

    // Fund the faucet
    console.log("\n3️⃣ Funding faucet...");
    const faucetFundAmount = ethers.parseEther("10000");
    await forgeToken.mint(faucetAddress, faucetFundAmount);
    console.log("   ✅ Faucet funded with 10,000 FORGE tokens");

    console.log("\n🎉 Deployment Complete!");
    console.log("═".repeat(40));
    console.log("📋 Contract Addresses:");
    console.log("   ForgeToken:", forgeTokenAddress);
    console.log("   ForgeFaucet:", faucetAddress);
    console.log("\n🔗 Verify on PolygonScan:");
    console.log("   https://amoy.polygonscan.com/address/" + forgeTokenAddress);
    console.log("   https://amoy.polygonscan.com/address/" + faucetAddress);
    console.log("\n📝 To verify contracts, run:");
    console.log("   npx hardhat verify --network polygonAmoy", forgeTokenAddress);
    console.log("   npx hardhat verify --network polygonAmoy", faucetAddress, forgeTokenAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
