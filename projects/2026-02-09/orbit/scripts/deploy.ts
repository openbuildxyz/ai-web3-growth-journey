import { ethers } from "hardhat";

const INITIAL_SUPPLY = 1_000_000; // 1 million tokens

// Sepolia canonical WETH (Uniswap-deployed)
const SEPOLIA_WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

async function main() {
  console.log("\n=== Deploying Orbit Real Swap (ETH → OrbUSD) ===\n");

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);

  console.log("Deploying contracts with account:", deployerAddress);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // ========================================
  // Deploy OrbUSD
  // ========================================
  console.log("1. Deploying OrbUSD token...");
  const OrbUSD = await ethers.deployContract("OrbToken", [
    "Orbit USD",
    "ORBUSD",
    18,
    INITIAL_SUPPLY,
  ]);
  await OrbUSD.waitForDeployment();
  const orbUSDAddress = await OrbUSD.getAddress();
  console.log("   ✓ OrbUSD deployed to:", orbUSDAddress);

  // ========================================
  // Deploy Pool (WETH / OrbUSD). token0 = WETH, token1 = OrbUSD
  // ========================================
  console.log("\n2. Deploying OrbPool (WETH/OrbUSD)...");
  const OrbPool = await ethers.deployContract("OrbPool", [
    SEPOLIA_WETH,
    orbUSDAddress,
  ]);
  await OrbPool.waitForDeployment();
  const orbPoolAddress = await OrbPool.getAddress();
  console.log("   ✓ OrbPool deployed to:", orbPoolAddress);

  // ========================================
  // Add initial liquidity: wrap ETH → WETH, then add WETH + OrbUSD
  // ========================================
  // Use smaller amounts so deployer with ~0.5 ETH can complete (wrap + gas)
  const liquidityWeth = ethers.parseEther("0.1"); // 0.1 WETH
  const liquidityOrbUSD = ethers.parseUnits("200", 18); // 200 OrbUSD

  console.log("\n3. Wrapping ETH to WETH...");
  const wethAbi = [
    "function deposit() payable",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
  ];
  const weth = new ethers.Contract(SEPOLIA_WETH, wethAbi, deployer);
  const wrapTx = await weth.deposit({ value: liquidityWeth });
  await wrapTx.wait();
  console.log("   ✓ Wrapped", ethers.formatEther(liquidityWeth), "ETH to WETH");

  console.log("   Approving pool for WETH and OrbUSD...");
  await weth.approve(orbPoolAddress, ethers.MaxUint256);
  const approveUsd = await OrbUSD.approve(orbPoolAddress, ethers.MaxUint256);
  await approveUsd.wait();
  console.log("   ✓ Approved");

  console.log("   Adding liquidity (WETH + OrbUSD)...");
  const addLiquidityTx = await OrbPool.addLiquidity(
    liquidityWeth,   // amount0Desired (WETH)
    liquidityOrbUSD, // amount1Desired (OrbUSD)
    0,
    0
  );
  await addLiquidityTx.wait();
  console.log("   ✓ Liquidity added");

  const [reserve0, reserve1] = await OrbPool.getReserves();
  console.log("\n   Pool reserves:");
  console.log("   - WETH (token0):", ethers.formatEther(reserve0));
  console.log("   - OrbUSD (token1):", ethers.formatUnits(reserve1, 18));

  // ========================================
  // Deploy Router (swap native ETH → OrbUSD)
  // ========================================
  console.log("\n4. Deploying OrbSwapRouter...");
  const OrbSwapRouter = await ethers.deployContract("OrbSwapRouter", [
    SEPOLIA_WETH,
    orbPoolAddress,
  ]);
  await OrbSwapRouter.waitForDeployment();
  const routerAddress = await OrbSwapRouter.getAddress();
  console.log("   ✓ OrbSwapRouter deployed to:", routerAddress);

  // ========================================
  // Summary
  // ========================================
  console.log("\n=== Deployment Complete ===\n");
  console.log("Contract Addresses:");
  console.log("  WETH (Sepolia):", SEPOLIA_WETH);
  console.log("  OrbUSD:", orbUSDAddress);
  console.log("  OrbPool:", orbPoolAddress);
  console.log("  OrbSwapRouter:", routerAddress);

  console.log("\nInitial Pool (WETH/OrbUSD):");
  console.log("  WETH reserve:", ethers.formatEther(reserve0));
  console.log("  OrbUSD reserve:", ethers.formatUnits(reserve1, 18));

  console.log("\nNext Steps:");
  console.log("  1. Add to .env (for the app):");
  console.log(`     NEXT_PUBLIC_WETH_ADDRESS=${SEPOLIA_WETH}`);
  console.log(`     NEXT_PUBLIC_ORBUSD_ADDRESS=${orbUSDAddress}`);
  console.log(`     NEXT_PUBLIC_POOL_ADDRESS=${orbPoolAddress}`);
  console.log(`     NEXT_PUBLIC_ROUTER_ADDRESS=${routerAddress}`);
  console.log("\n  2. Verify on Etherscan (optional):");
  console.log("     npx hardhat verify --network sepolia", orbUSDAddress, '"Orbit USD" ORBUSD 18 1000000');
  console.log("     npx hardhat verify --network sepolia", orbPoolAddress, SEPOLIA_WETH, orbUSDAddress);
  console.log("     npx hardhat verify --network sepolia", routerAddress, SEPOLIA_WETH, orbPoolAddress);

  const fs = require("fs");
  const deployment = {
    network: "sepolia",
    weth: SEPOLIA_WETH,
    tokens: { orbUSD: orbUSDAddress },
    pool: orbPoolAddress,
    router: routerAddress,
    deploymentDate: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deployment, null, 2)
  );
  console.log("\n  3. Deployment saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
