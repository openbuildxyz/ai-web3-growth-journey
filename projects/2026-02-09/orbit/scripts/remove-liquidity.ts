import { ethers } from "hardhat";
import deployment from "../deployment.json";

async function main() {
  if (process.argv.length < 3) {
    console.error("Usage: yarn pool:remove-liquidity <lpAmount>");
    process.exit(1);
  }

  const lpAmount = process.argv[2];
  const amount = ethers.parseUnits(lpAmount, 18);

  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  console.log("\n=== Removing Liquidity from OrbPool ===");
  console.log("Signer:", signerAddress);
  console.log("LP Tokens to Burn:", lpAmount);

  // Get contracts
  const pool = await ethers.getContractAt("OrbPool", deployment.pool);

  // Check LP balance
  const lpBalance = await pool.balanceOf(signerAddress);
  console.log("\nCurrent LP Balance:", ethers.formatUnits(lpBalance, 18));

  if (lpBalance < amount) {
    console.error("Insufficient LP tokens!");
    process.exit(1);
  }

  // Get current reserves
  const [reserve0, reserve1] = await pool.getReserves();
  console.log("\nCurrent Pool Reserves:");
  console.log("  OrbUSD:", ethers.formatUnits(reserve0, 18));
  console.log("  OrbETH:", ethers.formatUnits(reserve1, 18));

  // Calculate expected output
  const totalSupply = await pool.totalSupply();
  const expectedUSD = (amount * reserve0) / totalSupply;
  const expectedETH = (amount * reserve1) / totalSupply;

  console.log("\nExpected to receive:");
  console.log("  OrbUSD:", ethers.formatUnits(expectedUSD, 18));
  console.log("  OrbETH:", ethers.formatUnits(expectedETH, 18));

  // Remove liquidity
  console.log("\nRemoving liquidity...");
  const removeTx = await pool.removeLiquidity(
    amount,
    (expectedUSD * 95n) / 100n, // amount0Min (5% slippage)
    (expectedETH * 95n) / 100n, // amount1Min (5% slippage)
    signerAddress // to
  );
  const receipt = await removeTx.wait();
  console.log("✓ Liquidity removed!");
  console.log("Transaction hash:", receipt.hash);

  // Get new balances
  const orbUSD = await ethers.getContractAt("OrbToken", deployment.tokens.orbUSD);
  const orbETH = await ethers.getContractAt("OrbToken", deployment.tokens.orbETH);

  const newUSDBalance = await orbUSD.balanceOf(signerAddress);
  const newETHBalance = await orbETH.balanceOf(signerAddress);
  const newLPBalance = await pool.balanceOf(signerAddress);

  console.log("\nNew Balances:");
  console.log("  OrbUSD:", ethers.formatUnits(newUSDBalance, 18));
  console.log("  OrbETH:", ethers.formatUnits(newETHBalance, 18));
  console.log("  LP Tokens:", ethers.formatUnits(newLPBalance, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
