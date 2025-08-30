import { ethers } from "hardhat";

async function main() {
    console.log("🪣 FORGE Faucet - Get Free Tokens");
    console.log("═".repeat(40));

    // Your MetaMask address - REPLACE THIS WITH YOUR ACTUAL ADDRESS
    const YOUR_ADDRESS = "0xYourMetaMaskAddressHere"; // ⬅️ CHANGE THIS!

    // Contract addresses from deployment
    const FORGE_TOKEN = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const FAUCET_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    console.log(`🎯 Getting tokens for: ${YOUR_ADDRESS}`);

    // First, let's start a local node and deploy
    console.log("\n1️⃣ Setting up contracts...");

    // Deploy fresh contracts
    const ForgeTokenFactory = await ethers.getContractFactory("ForgeToken");
    const forgeToken = await ForgeTokenFactory.deploy();
    await forgeToken.waitForDeployment();

    const FaucetFactory = await ethers.getContractFactory("ForgeFaucet");
    const faucet = await FaucetFactory.deploy(await forgeToken.getAddress());
    await faucet.waitForDeployment();

    // Fund the faucet
    const faucetAddress = await faucet.getAddress();
    await forgeToken.mint(faucetAddress, ethers.parseEther("10000"));

    console.log("   ✅ Contracts ready!");
    console.log(`   Token: ${await forgeToken.getAddress()}`);
    console.log(`   Faucet: ${faucetAddress}`);

    // Now simulate claiming from faucet to your address
    console.log("\n2️⃣ Claiming tokens from faucet...");

    // We'll use a test account to demonstrate
    const [deployer, testUser] = await ethers.getSigners();
    const testAddress = await testUser.getAddress();

    console.log(`   📤 Claiming for test address: ${testAddress}`);

    // Check balance before
    const balanceBefore = await forgeToken.balanceOf(testAddress);
    console.log(`   💰 Balance before: ${ethers.formatEther(balanceBefore)} FORGE`);

    // Claim tokens
    const claimTx = await faucet.connect(testUser).claimTokens();
    await claimTx.wait();

    // Check balance after
    const balanceAfter = await forgeToken.balanceOf(testAddress);
    console.log(`   💰 Balance after: ${ethers.formatEther(balanceAfter)} FORGE`);
    console.log("   ✅ Faucet claim successful!");

    console.log("\n🎯 FOR YOUR METAMASK ADDRESS:");
    console.log("═".repeat(35));
    console.log(`1. Make sure your MetaMask is connected to:`);
    console.log(`   • Network: Hardhat Localhost`);
    console.log(`   • RPC: http://127.0.0.1:8545`);
    console.log(`   • Chain ID: 1337`);
    console.log("");
    console.log(`2. Add FORGE token to MetaMask:`);
    console.log(`   • Contract: ${await forgeToken.getAddress()}`);
    console.log(`   • Symbol: FORGE`);
    console.log(`   • Decimals: 18`);
    console.log("");
    console.log(`3. To get tokens, you need to interact with the faucet:`);
    console.log(`   • Faucet Address: ${faucetAddress}`);
    console.log(`   • Call function: claimTokens()`);
    console.log(`   • You'll get 100 FORGE tokens`);
    console.log("");
    console.log(`4. Or I can send you tokens directly!`);
    console.log(`   • Just replace YOUR_ADDRESS in this script`);
    console.log(`   • With your actual MetaMask address`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
