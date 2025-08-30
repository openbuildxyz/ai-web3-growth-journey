import { readFileSync, existsSync } from "fs";
import { join } from "path";

async function main() {
    console.log("🪙 FORGE Token - Wallet Setup Guide");
    console.log("═".repeat(50));

    // Check if deployment exists
    const deploymentPath = join(__dirname, "..", "artifacts", "deployments", "localhost.json");

    if (!existsSync(deploymentPath)) {
        console.log("❌ No local deployment found!");
        console.log("\n🔧 To deploy contracts first:");
        console.log("1. pnpm chain:local     # Start Hardhat node");
        console.log("2. pnpm deploy:local    # Deploy contracts");
        console.log("3. Run this script again");
        return;
    }

    // Load deployment data
    const deploymentData = JSON.parse(readFileSync(deploymentPath, "utf8"));

    console.log("\n📋 Token Details:");
    console.log("──────────────────");
    console.log(`Name: ModelForge Token`);
    console.log(`Symbol: FORGE`);
    console.log(`Decimals: 18`);
    console.log(`Contract Address: ${deploymentData.forgeToken}`);
    console.log(`Network: Localhost`);
    console.log(`Chain ID: 1337`);
    console.log(`RPC URL: http://127.0.0.1:8545`);

    console.log("\n🦊 MetaMask Setup:");
    console.log("──────────────────");
    console.log("1. Open MetaMask");
    console.log("2. Click 'Import tokens' at bottom");
    console.log("3. Enter these details:");
    console.log(`   • Token contract address: ${deploymentData.forgeToken}`);
    console.log(`   • Token symbol: FORGE`);
    console.log(`   • Token decimals: 18`);
    console.log("4. Click 'Add Custom Token'");

    console.log("\n🌐 Network Setup (if not already added):");
    console.log("────────────────────────────────────────");
    console.log("1. Open MetaMask → Settings → Networks → Add Network");
    console.log("2. Enter these details:");
    console.log(`   • Network name: Hardhat Localhost`);
    console.log(`   • New RPC URL: http://127.0.0.1:8545`);
    console.log(`   • Chain ID: 1337`);
    console.log(`   • Currency symbol: ETH`);
    console.log("3. Save and switch to this network");

    console.log("\n💰 Get Test Tokens:");
    console.log("───────────────────");
    console.log("• Use the faucet to get 100 FORGE tokens");
    console.log("• Cooldown: 1 hour between claims");
    console.log(`• Faucet contract: ${deploymentData.faucet}`);

    console.log("\n🔑 Test Account (with ETH):");
    console.log("───────────────────────────");
    console.log("Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    console.log("Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    console.log("⚠️  WARNING: Only use for local testing!");

    console.log("\n📱 Other Wallets (Coinbase, Trust, etc.):");
    console.log("─────────────────────────────────────────");
    console.log("1. Add custom network with RPC: http://127.0.0.1:8545");
    console.log("2. Import custom token with contract address above");
    console.log("3. Some wallets may not support localhost networks");

    console.log("\n🚀 Quick Test:");
    console.log("──────────────");
    console.log("1. Import the test account private key");
    console.log("2. Switch to Hardhat Localhost network");
    console.log("3. Add FORGE token using contract address");
    console.log("4. You should see your FORGE balance!");

    console.log("\n📄 Contract Addresses:");
    console.log("─────────────────────");
    console.log(`FORGE Token: ${deploymentData.forgeToken}`);
    console.log(`Faucet: ${deploymentData.faucet}`);
    console.log(`Model Registry: ${deploymentData.modelRegistry}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error.message);
        process.exit(1);
    });
