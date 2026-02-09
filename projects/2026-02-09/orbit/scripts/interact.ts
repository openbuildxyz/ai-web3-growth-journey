import { ethers } from "hardhat";
import deployment from "../deployment.json";

async function main() {
  const network = deployment.network as "sepolia" | "hardhat";
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  console.log("\n=== Interacting with Deployed Contracts ===");
  console.log("Network:", network);
  console.log("Signer:", signerAddress);

  // Get deployed contracts
  const orbUSD = await ethers.getContractAt("OrbToken", deployment.tokens.orbUSD);
  const orbETH = await ethers.getContractAt("OrbToken", deployment.tokens.orbETH);
  const pool = await ethers.getContractAt("OrbPool", deployment.pool);

  // Check balances
  const orbUSDBalance = await orbUSD.balanceOf(signerAddress);
  const orbETHBalance = await orbETH.balanceOf(signerAddress);
  const lpBalance = await pool.balanceOf(signerAddress);

  console.log("\nBalances:");
  console.log("  OrbUSD:", ethers.formatUnits(orbUSDBalance, 18));
  console.log("  OrbETH:", ethers.formatUnits(orbETHBalance, 18));
  console.log("  LP Tokens:", ethers.formatUnits(lpBalance, 18));

  // Get pool reserves
  const [reserve0, reserve1] = await pool.getReserves();
  console.log("\nPool Reserves:");
  console.log("  OrbUSD:", ethers.formatUnits(reserve0, 18));
  console.log("  OrbETH:", ethers.formatUnits(reserve1, 18));

  // Calculate price
  const price = Number(ethers.formatUnits(reserve0, 18)) / Number(ethers.formatUnits(reserve1, 18));
  console.log("  Price (USD per ETH):", price.toFixed(2));

  // Quote a swap
  const swapAmount = ethers.parseUnits("1", 18); // 1 OrbETH
  const quote = await pool.quote(swapAmount, deployment.tokens.orbETH, deployment.tokens.orbUSD);
  console.log("\nSwap Quote:");
  console.log("  Input:", ethers.formatUnits(swapAmount, 18), "OrbETH");
  console.log("  Output:", ethers.formatUnits(quote, 18), "OrbUSD");
  console.log("  Rate:", Number(ethers.formatUnits(quote, 18)).toFixed(2), "USD per ETH");

  console.log("\nCommands to interact:");
  console.log("  yarn swap:eth-to-usd <amount>");
  console.log("  yarn swap:usd-to-eth <amount>");
  console.log("  yarn pool:add-liquidity");
  console.log("  yarn pool:remove-liquidity <lpAmount>");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
