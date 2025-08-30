import { ethers } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface DeploymentAddresses {
    forgeToken: string;
    faucet: string;
    modelRegistry: string;
    deployer: string;
    network: string;
    timestamp: number;
}

async function main() {
    console.log("🚀 Starting local deployment...");

    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();

    console.log("📋 Deployment details:");
    console.log("  • Deployer:", deployerAddress);
    console.log("  • Network:", (await ethers.provider.getNetwork()).name);
    console.log("  • Chain ID:", (await ethers.provider.getNetwork()).chainId);

    // Get deployer balance
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log("  • Deployer balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        throw new Error("❌ Deployer has no ETH. Please fund the account first.");
    }

    console.log("\n1️⃣ Deploying ForgeToken...");
    const ForgeTokenFactory = await ethers.getContractFactory("ForgeToken");
    const forgeToken = await ForgeTokenFactory.deploy();
    await forgeToken.waitForDeployment();
    const forgeTokenAddress = await forgeToken.getAddress();
    console.log("   ✅ ForgeToken deployed at:", forgeTokenAddress);

    // Check initial supply
    const totalSupply = await forgeToken.totalSupply();
    console.log("   📊 Total supply:", ethers.formatEther(totalSupply), "FORGE");
    console.log("   👤 Owner:", await forgeToken.owner());

    console.log("\n2️⃣ Deploying ForgeFaucet...");
    const FaucetFactory = await ethers.getContractFactory("ForgeFaucet");
    const faucet = await FaucetFactory.deploy(forgeTokenAddress);
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress();
    console.log("   ✅ ForgeFaucet deployed at:", faucetAddress);

    // Fund the faucet with tokens
    console.log("   💰 Funding faucet with tokens...");
    const faucetFundAmount = ethers.parseEther("100000"); // 100k FORGE tokens
    await forgeToken.mint(faucetAddress, faucetFundAmount);
    const faucetBalance = await forgeToken.balanceOf(faucetAddress);
    console.log("   📊 Faucet balance:", ethers.formatEther(faucetBalance), "FORGE");

    console.log("\n3️⃣ Deploying ModelRegistry...");
    const ModelRegistryFactory = await ethers.getContractFactory("ModelRegistry");
    const modelRegistry = await ModelRegistryFactory.deploy();
    await modelRegistry.waitForDeployment();
    const modelRegistryAddress = await modelRegistry.getAddress();
    console.log("   ✅ ModelRegistry deployed at:", modelRegistryAddress);

    // Prepare deployment data
    const deploymentData: DeploymentAddresses = {
        forgeToken: forgeTokenAddress,
        faucet: faucetAddress,
        modelRegistry: modelRegistryAddress,
        deployer: deployerAddress,
        network: "localhost",
        timestamp: Date.now()
    };

    // Create artifacts directory if it doesn't exist
    const artifactsDir = join(__dirname, "..", "artifacts", "deployments");
    mkdirSync(artifactsDir, { recursive: true });

    // Save deployment addresses
    const addressesPath = join(artifactsDir, "localhost.json");
    writeFileSync(addressesPath, JSON.stringify(deploymentData, null, 2));
    console.log("\n📄 Deployment addresses saved to:", addressesPath);

    // Create a simple ABI export for easy integration
    const abiExports = {
        ForgeToken: {
            address: forgeTokenAddress,
            abi: ForgeTokenFactory.interface.format("json")
        },
        ForgeFaucet: {
            address: faucetAddress,
            abi: FaucetFactory.interface.format("json")
        },
        ModelRegistry: {
            address: modelRegistryAddress,
            abi: ModelRegistryFactory.interface.format("json")
        }
    };

    const abiPath = join(artifactsDir, "localhost-abis.json");
    writeFileSync(abiPath, JSON.stringify(abiExports, null, 2));
    console.log("📄 Contract ABIs saved to:", abiPath);

    console.log("\n🎉 Local deployment completed successfully!");
    console.log("\n📋 Summary:");
    console.log("┌─────────────────┬──────────────────────────────────────────────┐");
    console.log("│ Contract        │ Address                                      │");
    console.log("├─────────────────┼──────────────────────────────────────────────┤");
    console.log(`│ ForgeToken      │ ${forgeTokenAddress} │`);
    console.log(`│ ForgeFaucet     │ ${faucetAddress} │`);
    console.log(`│ ModelRegistry   │ ${modelRegistryAddress} │`);
    console.log("└─────────────────┴──────────────────────────────────────────────┘");

    console.log("\n🔧 Next steps:");
    console.log("1. Start the local Hardhat node:");
    console.log("   pnpm chain:local");
    console.log("2. Test the faucet:");
    console.log("   npx hardhat run scripts/test-faucet.ts --network localhost");
    console.log("3. Use contracts in your dApp by importing the deployment artifacts");

    return {
        forgeToken: forgeTokenAddress,
        faucet: faucetAddress,
        modelRegistry: modelRegistryAddress
    };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
