import { ethers } from "hardhat";
import deployment from "../deployment.json";

async function main() {
  if (process.argv.length < 3) {
    console.error("Usage: yarn swap:eth-to-usd <amount>");
    process.exit(1);
  }

  const amount = process.argv[2];
  const amountIn = ethers.parseUnits(amount, 18);

  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  console.log("\n=== Swapping OrbETH to OrbUSD ===");
  console.log("Signer:", signerAddress);
  console.log("Amount:", amount, "OrbETH");

  // Get contracts
  const orbETH = await ethers.getContractAt("OrbToken", deployment.tokens.orbETH);
  const pool = await ethers.getContractAt("OrbPool", deployment.pool);

  // Check balances
  const balance = await orbETH.balanceOf(signerAddress);
  console.log("OrbETH Balance:", ethers.formatUnits(balance, 18));

  if (balance < amountIn) {
    console.error("Insufficient balance!");
    process.exit(1);
  }

  // Approve pool
  console.log("\nApproving pool...");
  const approveTx = await orbETH.approve(deployment.pool, amountIn);
  await approveTx.wait();
  console.log("✓ Approved");

  // Get quote
  const quote = await pool.quote(amountIn, deployment.tokens.orbETH, deployment.tokens.orbUSD);
  console.log("\nExpected output:", ethers.formatUnits(quote, 18), "OrbUSD");

  // Execute swap
  console.log("\nExecuting swap...");
  const swapTx = await pool.swap(
    0, // amount0In
    amountIn, // amount1In
    0, // amount0OutMinimum
    (quote * 95n) / 100n, // amount1OutMinimum (5% slippage)
    signerAddress // to
  );
  await swapTx.wait();
  console.log("✓ Swap complete!");
  console.log("Transaction hash:", swapTx.hash);

  // Get new balances
  const orbUSD = await ethers.getContractAt("OrbToken", deployment.tokens.orbUSD);
  const newBalance = await orbUSD.balanceOf(signerAddress);
  console.log("\nNew OrbUSD balance:", ethers.formatUnits(newBalance, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
