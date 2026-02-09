/**
 * Deploy only OrbSwapRouter for already-deployed OrbUSD + OrbPool.
 * Use these addresses from the partial deploy run.
 */
import { ethers } from "hardhat";

const SEPOLIA_WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const ORBUSD_ADDRESS = "0xB5De1ECbDDDb3fC4a94061618c1Df25c604D3294";
const ORB_POOL_ADDRESS = "0xE270273A4e75c150837bd22B6340268569f3eC14";

async function main() {
  console.log("Deploying OrbSwapRouter...");
  const OrbSwapRouter = await ethers.deployContract("OrbSwapRouter", [
    SEPOLIA_WETH,
    ORB_POOL_ADDRESS,
  ]);
  await OrbSwapRouter.waitForDeployment();
  const routerAddress = await OrbSwapRouter.getAddress();
  console.log("OrbSwapRouter deployed to:", routerAddress);

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
  console.log("\nNEXT_PUBLIC_ORBUSD_ADDRESS=" + ORBUSD_ADDRESS);
  console.log("NEXT_PUBLIC_POOL_ADDRESS=" + ORB_POOL_ADDRESS);
  console.log("NEXT_PUBLIC_ROUTER_ADDRESS=" + routerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
