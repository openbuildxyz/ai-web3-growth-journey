import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
    console.log("🧪 Testing ForgeFaucet functionality...");

    // Load deployment addresses
    const deploymentPath = join(__dirname, "..", "artifacts", "deployments", "localhost.json");
    let deploymentData;

    try {
        deploymentData = JSON.parse(readFileSync(deploymentPath, "utf8"));
    } catch (error) {
        console.error("❌ Could not load deployment data. Make sure you've run the deployment script first.");
        console.error("   Run: npx hardhat run scripts/deploy-local.ts --network localhost");
        process.exit(1);
    }

    const [deployer, user1, user2] = await ethers.getSigners();

    console.log("📋 Test details:");
    console.log("  • Deployer:", await deployer.getAddress());
    console.log("  • User1:", await user1.getAddress());
    console.log("  • User2:", await user2.getAddress());

    // Get contract instances
    const forgeToken = await ethers.getContractAt("ForgeToken", deploymentData.forgeToken);
    const faucet = await ethers.getContractAt("ForgeFaucet", deploymentData.faucet);

    console.log("\n1️⃣ Testing ForgeToken functionality...");
    const totalSupply = await forgeToken.totalSupply();
    const faucetBalance = await forgeToken.balanceOf(deploymentData.faucet);
    console.log("   📊 Total supply:", ethers.formatEther(totalSupply), "FORGE");
    console.log("   💰 Faucet balance:", ethers.formatEther(faucetBalance), "FORGE");

    console.log("\n2️⃣ Testing faucet claims...");

    // Check initial balances
    const user1Address = await user1.getAddress();
    const user2Address = await user2.getAddress();

    let user1Balance = await forgeToken.balanceOf(user1Address);
    let user2Balance = await forgeToken.balanceOf(user2Address);
    console.log("   👤 User1 initial balance:", ethers.formatEther(user1Balance), "FORGE");
    console.log("   👤 User2 initial balance:", ethers.formatEther(user2Balance), "FORGE");

    // User1 claims tokens
    console.log("\n   🪣 User1 claiming tokens...");
    const claimTx1 = await faucet.connect(user1).claimTokens();
    await claimTx1.wait();

    user1Balance = await forgeToken.balanceOf(user1Address);
    console.log("   ✅ User1 balance after claim:", ethers.formatEther(user1Balance), "FORGE");

    // User2 claims tokens
    console.log("\n   🪣 User2 claiming tokens...");
    const claimTx2 = await faucet.connect(user2).claimTokens();
    await claimTx2.wait();

    user2Balance = await forgeToken.balanceOf(user2Address);
    console.log("   ✅ User2 balance after claim:", ethers.formatEther(user2Balance), "FORGE");

    // Check faucet statistics
    const faucetStats = await faucet.getFaucetStats();
    console.log("\n3️⃣ Faucet statistics:");
    console.log("   💰 Remaining balance:", ethers.formatEther(faucetStats.faucetBalance), "FORGE");
    console.log("   📊 Total dispensed:", ethers.formatEther(faucetStats.totalDispensedAmount), "FORGE");
    console.log("   ⏸️ Is paused:", faucetStats.isPaused);

    // Check user statistics
    const user1Stats = await faucet.getUserStats(user1Address);
    const user2Stats = await faucet.getUserStats(user2Address);

    console.log("\n4️⃣ User statistics:");
    console.log("   👤 User1 total claimed:", ethers.formatEther(user1Stats.userTotalClaimed), "FORGE");
    console.log("   👤 User1 can claim now:", user1Stats.userCanClaimNow);
    console.log("   👤 User2 total claimed:", ethers.formatEther(user2Stats.userTotalClaimed), "FORGE");
    console.log("   👤 User2 can claim now:", user2Stats.userCanClaimNow);

    // Try to claim again (should fail due to cooldown)
    console.log("\n5️⃣ Testing cooldown mechanism...");
    try {
        await faucet.connect(user1).claimTokens();
        console.log("   ❌ Unexpected: User1 was able to claim again immediately");
    } catch (error) {
        console.log("   ✅ Cooldown working: User1 cannot claim again immediately");
    }

    console.log("\n🎉 Faucet testing completed successfully!");
    console.log("\n📋 Final balances:");
    console.log(`   👤 User1: ${ethers.formatEther(await forgeToken.balanceOf(user1Address))} FORGE`);
    console.log(`   👤 User2: ${ethers.formatEther(await forgeToken.balanceOf(user2Address))} FORGE`);
    console.log(`   🪣 Faucet: ${ethers.formatEther(await forgeToken.balanceOf(deploymentData.faucet))} FORGE`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
