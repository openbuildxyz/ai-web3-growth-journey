import { ethers } from "hardhat";
import deployment from "../deployment.json";

async function main() {
  if (process.argv.length < 3) {
    console.error("Usage: yarn swap:usd-to-eth <amount>");
    process.exit(1);
  }

  const amount = process.argv[2];
  const amountIn = ethers.parseUnits(amount, 18);

  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  console.log("\n=== Swapping OrbUSD to OrbETH ===");
  console.log("Signer:", signerAddress);
  console.log("Amount:", amount, "OrbUSD");

  // Get contracts
  const orbUSD = await ethers.getContractAt("OrbToken", deployment.tokens.orbUSD);
  const pool = await ethers.getContractAt("OrbPool", deployment.pool);

  // Check balances
  const balance = await orbUSD.balanceOf(signerAddress);
  console.log("OrbUSD Balance:", ethers.formatUnits(balance, 18));

  if (balance < amountIn) {
    console.error("Insufficient balance!");
    process.exit(1);
  }

  // Approve pool
  console.log("\nApproving pool...");
  const approveTx = await orbUSD.approve(deployment.pool, amountIn);
  await approveTx.wait();
  console.log("✓ Approved");

  // Get quote
  const quote = await pool.quote(amountIn, deployment.tokens.orbUSD, deployment.tokens.orbETH);
  console.log("\nExpected output:", ethers.formatUnits(quote, 18), "OrbETH");

  // Execute swap
  console.log("\nExecuting swap...");
  const swapTx = await pool.swap(
    amountIn, // amount0In
    0, // amount1In
    (quote * 95n) / 100n, // amount0OutMinimum (5% slippage)
    0, // amount1OutMinimum
    signerAddress // to
  );
  await swapTx.wait();
  console.log("✓ Swap complete!");
  console.log("Transaction hash:", swapTx.hash);

  // Get new balance
  const orbETH = await ethers.getContractAt("OrbToken", deployment.tokens.orbETH);
  const newBalance = await orbETH.balanceOf(signerAddress);
  console.log("\nNew OrbETH balance:", ethers.formatUnits(newBalance, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
