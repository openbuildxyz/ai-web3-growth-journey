import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Quick contract test...");

    const [deployer, user1] = await ethers.getSigners();

    console.log("📋 Test details:");
    console.log("  • Deployer:", await deployer.getAddress());
    console.log("  • User1:", await user1.getAddress());

    // Deploy contracts
    console.log("\n1️⃣ Deploying ForgeToken...");
    const ForgeTokenFactory = await ethers.getContractFactory("ForgeToken");
    const forgeToken = await ForgeTokenFactory.deploy();
    await forgeToken.waitForDeployment();
    const forgeTokenAddress = await forgeToken.getAddress();
    console.log("   ✅ ForgeToken deployed at:", forgeTokenAddress);

    console.log("\n2️⃣ Deploying ForgeFaucet...");
    const FaucetFactory = await ethers.getContractFactory("ForgeFaucet");
    const faucet = await FaucetFactory.deploy(forgeTokenAddress);
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress();
    console.log("   ✅ ForgeFaucet deployed at:", faucetAddress);

    // Fund the faucet
    console.log("\n3️⃣ Funding faucet...");
    const fundAmount = ethers.parseEther("10000");
    await forgeToken.mint(faucetAddress, fundAmount);
    const faucetBalance = await forgeToken.balanceOf(faucetAddress);
    console.log("   💰 Faucet balance:", ethers.formatEther(faucetBalance), "FORGE");

    // Test claiming
    console.log("\n4️⃣ Testing faucet claim...");
    const user1Address = await user1.getAddress();

    // User1 claims tokens
    console.log("   🪣 User1 claiming tokens...");
    const claimTx = await faucet.connect(user1).claimTokens();
    await claimTx.wait();

    const user1Balance = await forgeToken.balanceOf(user1Address);
    console.log("   ✅ User1 balance after claim:", ethers.formatEther(user1Balance), "FORGE");

    // Try to claim again (should fail)
    console.log("\n5️⃣ Testing cooldown...");
    try {
        await faucet.connect(user1).claimTokens();
        console.log("   ❌ Unexpected: User1 was able to claim again immediately");
    } catch (error) {
        console.log("   ✅ Cooldown working: User1 cannot claim again immediately");
    }

    console.log("\n🎉 All functionality working correctly!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
