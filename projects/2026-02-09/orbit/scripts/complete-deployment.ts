/**
 * Complete deployment: add liquidity to existing OrbUSD/OrbPool and deploy Router.
 * Use after deploy.ts has run and deployed OrbUSD + OrbPool but failed at wrap (e.g. low balance).
 *
 * Already deployed (from failed run):
 *   OrbUSD: 0xB5De1ECbDDDb3fC4a94061618c1Df25c604D3294
 *   OrbPool: 0xE270273A4e75c150837bd22B6340268569f3eC14
 */
import { ethers } from "hardhat";

const SEPOLIA_WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const ORBUSD_ADDRESS = "0xB5De1ECbDDDb3fC4a94061618c1Df25c604D3294";
const ORB_POOL_ADDRESS = "0xE270273A4e75c150837bd22B6340268569f3eC14";

// Small amounts so deployer with ~0.5 ETH can complete
const LIQUIDITY_WETH = ethers.parseEther("0.1");
const LIQUIDITY_ORBUSD = ethers.parseUnits("200", 18);

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("Account:", deployerAddress, "Balance:", ethers.formatEther(balance), "ETH\n");

  const OrbUSD = await ethers.getContractAt("OrbToken", ORBUSD_ADDRESS);
  const OrbPool = await ethers.getContractAt("OrbPool", ORB_POOL_ADDRESS);

  console.log("1. Wrapping", ethers.formatEther(LIQUIDITY_WETH), "ETH to WETH...");
  const wethAbi = [
    "function deposit() payable",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
  ];
  const weth = new ethers.Contract(SEPOLIA_WETH, wethAbi, deployer);
  const wrapTx = await weth.deposit({ value: LIQUIDITY_WETH });
  await wrapTx.wait();
  console.log("   ✓ Wrapped\n");

  console.log("2. Approving pool...");
  await weth.approve(ORB_POOL_ADDRESS, ethers.MaxUint256);
  await OrbUSD.approve(ORB_POOL_ADDRESS, ethers.MaxUint256);
  console.log("   ✓ Approved\n");

  console.log("3. Adding liquidity (0.1 WETH + 200 OrbUSD)...");
  const addTx = await OrbPool.addLiquidity(
    LIQUIDITY_WETH,
    LIQUIDITY_ORBUSD,
    0,
    0
  );
  await addTx.wait();
  const [r0, r1] = await OrbPool.getReserves();
  console.log("   ✓ Liquidity added. Reserves: WETH", ethers.formatEther(r0), "OrbUSD", ethers.formatUnits(r1, 18), "\n");

  console.log("4. Deploying OrbSwapRouter...");
  const OrbSwapRouter = await ethers.deployContract("OrbSwapRouter", [
    SEPOLIA_WETH,
    ORB_POOL_ADDRESS,
  ]);
  await OrbSwapRouter.waitForDeployment();
  const routerAddress = await OrbSwapRouter.getAddress();
  console.log("   ✓ OrbSwapRouter:", routerAddress, "\n");

  const deployment = {
    network: "sepolia",
    weth: SEPOLIA_WETH,
    tokens: { orbUSD: ORBUSD_ADDRESS },
    pool: ORB_POOL_ADDRESS,
    router: routerAddress,
    deploymentDate: new Date().toISOString(),
  };
  const fs = require("fs");
  fs.writeFileSync("./deployment.json", JSON.stringify(deployment, null, 2));
  console.log("=== Complete ===\n");
  console.log("NEXT_PUBLIC_ORBUSD_ADDRESS=" + ORBUSD_ADDRESS);
  console.log("NEXT_PUBLIC_POOL_ADDRESS=" + ORB_POOL_ADDRESS);
  console.log("NEXT_PUBLIC_ROUTER_ADDRESS=" + routerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
