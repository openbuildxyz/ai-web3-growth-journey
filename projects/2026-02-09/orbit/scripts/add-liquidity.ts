import { ethers } from "hardhat";
import deployment from "../deployment.json";

async function main() {
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  console.log("\n=== Adding Liquidity to OrbPool ===");
  console.log("Signer:", signerAddress);

  // Get contracts
  const orbUSD = await ethers.getContractAt("OrbToken", deployment.tokens.orbUSD);
  const orbETH = await ethers.getContractAt("OrbToken", deployment.tokens.orbETH);
  const pool = await ethers.getContractAt("OrbPool", deployment.pool);

  // Check balances
  const orbUSDBalance = await orbUSD.balanceOf(signerAddress);
  const orbETHBalance = await orbETH.balanceOf(signerAddress);

  console.log("\nCurrent Balances:");
  console.log("  OrbUSD:", ethers.formatUnits(orbUSDBalance, 18));
  console.log("  OrbETH:", ethers.formatUnits(orbETHBalance, 18));

  // Get current reserves
  const [reserve0, reserve1] = await pool.getReserves();
  console.log("\nCurrent Pool Reserves:");
  console.log("  OrbUSD:", ethers.formatUnits(reserve0, 18));
  console.log("  OrbETH:", ethers.formatUnits(reserve1, 18));

  // Calculate optimal deposit amounts (20% of current balances)
  const depositUSD = orbUSDBalance / 5n;
  const depositETH = orbETHBalance / 5n;

  console.log("\nAdding Liquidity:");
  console.log("  OrbUSD:", ethers.formatUnits(depositUSD, 18));
  console.log("  OrbETH:", ethers.formatUnits(depositETH, 18));

  // Approve pool
  console.log("\nApproving tokens...");
  const approveUSDTx = await orbUSD.approve(deployment.pool, depositUSD);
  await approveUSDTx.wait();
  console.log("  ✓ OrbUSD approved");

  const approveETHTx = await orbETH.approve(deployment.pool, depositETH);
  await approveETHTx.wait();
  console.log("  ✓ OrbETH approved");

  // Add liquidity
  console.log("\nAdding liquidity...");
  const addTx = await pool.addLiquidity(
    depositUSD,
    depositETH,
    0, // amount0Min (accept any amount)
    0  // amount1Min (accept any amount)
  );
  const receipt = await addTx.wait();
  console.log("✓ Liquidity added!");
  console.log("Transaction hash:", receipt.hash);

  // Get LP tokens
  const lpBalance = await pool.balanceOf(signerAddress);
  console.log("\nLP Token Balance:", ethers.formatUnits(lpBalance, 18));

  // Get new reserves
  const [newReserve0, newReserve1] = await pool.getReserves();
  console.log("\nNew Pool Reserves:");
  console.log("  OrbUSD:", ethers.formatUnits(newReserve0, 18));
  console.log("  OrbETH:", ethers.formatUnits(newReserve1, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
