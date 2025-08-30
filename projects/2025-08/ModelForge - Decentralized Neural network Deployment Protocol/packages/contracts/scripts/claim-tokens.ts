import { ethers } from "hardhat";

async function main() {
    console.log("🪣 FORGE Faucet - Claim Tokens");
    console.log("═".repeat(40));

    // Contract addresses (update these after deployment)
    const FORGE_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const FAUCET_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const [deployer, user1, user2] = await ethers.getSigners();

    // Get contract instances
    const forgeToken = await ethers.getContractAt("ForgeToken", FORGE_TOKEN_ADDRESS);
    const faucet = await ethers.getContractAt("ForgeFaucet", FAUCET_ADDRESS);

    console.log("\n📋 Available Accounts:");
    console.log("─────────────────────");
    console.log(`Deployer: ${await deployer.getAddress()}`);
    console.log(`User1: ${await user1.getAddress()}`);
    console.log(`User2: ${await user2.getAddress()}`);

    // Check balances before
    console.log("\n💰 Balances Before:");
    console.log("──────────────────");
    const user1Balance = await forgeToken.balanceOf(await user1.getAddress());
    const user2Balance = await forgeToken.balanceOf(await user2.getAddress());
    console.log(`User1: ${ethers.formatEther(user1Balance)} FORGE`);
    console.log(`User2: ${ethers.formatEther(user2Balance)} FORGE`);

    // Check if users can claim
    const user1CanClaim = await faucet.canClaim(await user1.getAddress());
    const user2CanClaim = await faucet.canClaim(await user2.getAddress());
    console.log(`User1 can claim: ${user1CanClaim}`);
    console.log(`User2 can claim: ${user2CanClaim}`);

    // User1 claims tokens
    if (user1CanClaim) {
        console.log("\n🪣 User1 claiming tokens...");
        const claimTx1 = await faucet.connect(user1).claimTokens();
        await claimTx1.wait();
        console.log("✅ User1 claim successful!");
    } else {
        console.log("\n⏰ User1 is in cooldown period");
    }

    // User2 claims tokens
    if (user2CanClaim) {
        console.log("\n🪣 User2 claiming tokens...");
        const claimTx2 = await faucet.connect(user2).claimTokens();
        await claimTx2.wait();
        console.log("✅ User2 claim successful!");
    } else {
        console.log("\n⏰ User2 is in cooldown period");
    }

    // Check balances after
    console.log("\n💰 Balances After:");
    console.log("─────────────────");
    const user1BalanceAfter = await forgeToken.balanceOf(await user1.getAddress());
    const user2BalanceAfter = await forgeToken.balanceOf(await user2.getAddress());
    console.log(`User1: ${ethers.formatEther(user1BalanceAfter)} FORGE`);
    console.log(`User2: ${ethers.formatEther(user2BalanceAfter)} FORGE`);

    // Show faucet stats
    const faucetStats = await faucet.getFaucetStats();
    console.log("\n📊 Faucet Statistics:");
    console.log("─────────────────────");
    console.log(`Remaining balance: ${ethers.formatEther(faucetStats.faucetBalance)} FORGE`);
    console.log(`Total dispensed: ${ethers.formatEther(faucetStats.totalDispensedAmount)} FORGE`);
    console.log(`Is paused: ${faucetStats.isPaused}`);

    console.log("\n🎯 How to use in your wallet:");
    console.log("─────────────────────────────");
    console.log("1. Connect to Hardhat network (localhost:8545)");
    console.log("2. Import FORGE token using contract address");
    console.log("3. Call faucet.claimTokens() to get 100 FORGE");
    console.log("4. Wait 1 hour between claims");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
