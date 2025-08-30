import { ethers } from "hardhat";

async function main() {
    console.log("💸 Send FORGE Tokens to Your Address");
    console.log("═".repeat(45));

    // Get your MetaMask address here
    const YOUR_ADDRESS = process.env.YOUR_ADDRESS || "0x2758737879B3B3A7E75EA70E7eD70FE31DEdf596"; // Your MetaMask address

    console.log(`🎯 Target address: ${YOUR_ADDRESS}`);
    console.log("");

    // Deploy contracts first
    console.log("1️⃣ Deploying ForgeToken...");
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

    // Send tokens to your address
    console.log("\n3️⃣ Sending FORGE tokens to your address...");
    const sendAmount = ethers.parseEther("1000"); // Send 1000 FORGE tokens

    const [deployer] = await ethers.getSigners();
    console.log("   📤 Sending from deployer:", await deployer.getAddress());
    console.log("   📥 Sending to your address:", YOUR_ADDRESS);
    console.log("   💰 Amount:", ethers.formatEther(sendAmount), "FORGE");

    // Transfer tokens
    const transferTx = await forgeToken.transfer(YOUR_ADDRESS, sendAmount);
    await transferTx.wait();
    console.log("   ✅ Transfer successful!");

    // Check balance
    const yourBalance = await forgeToken.balanceOf(YOUR_ADDRESS);
    console.log("   💰 Your FORGE balance:", ethers.formatEther(yourBalance), "FORGE");

    // Also fund the faucet for future claims
    console.log("\n4️⃣ Funding faucet for future claims...");
    const faucetFundAmount = ethers.parseEther("10000");
    await forgeToken.mint(faucetAddress, faucetFundAmount);
    const faucetBalance = await forgeToken.balanceOf(faucetAddress);
    console.log("   💰 Faucet balance:", ethers.formatEther(faucetBalance), "FORGE");

    console.log("\n🎉 Setup Complete!");
    console.log("═".repeat(45));
    console.log("\n📋 Contract Details for MetaMask:");
    console.log("─────────────────────────────────");
    console.log(`Token Contract: ${forgeTokenAddress}`);
    console.log(`Faucet Contract: ${faucetAddress}`);
    console.log("Token Symbol: FORGE");
    console.log("Token Decimals: 18");
    console.log("Network: Hardhat Local");
    console.log("Chain ID: 1337");

    console.log("\n📱 Next Steps:");
    console.log("──────────────");
    console.log("1. Add FORGE token to MetaMask using contract address above");
    console.log("2. Switch to Hardhat Localhost network");
    console.log("3. Check your FORGE balance");
    console.log("4. Use the faucet to get more tokens if needed");

    console.log("\n💡 Pro Tip:");
    console.log("─────────────");
    console.log("To send tokens to a different address, set YOUR_ADDRESS:");
    console.log("YOUR_ADDRESS=0xYourActualAddress npx hardhat run scripts/send-tokens.ts");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
