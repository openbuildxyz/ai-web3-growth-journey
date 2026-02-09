/**
 * Add liquidity to WETH/OrbUSD pool. Run after OrbUSD + OrbPool are deployed.
 * Usage: TS_NODE_PROJECT=tsconfig.hardhat.json npx hardhat run scripts/add-liquidity-weth-orbusd.ts --network sepolia
 */
import { ethers } from "hardhat";

const SEPOLIA_WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const ORBUSD = "0xB5De1ECbDDDb3fC4a94061618c1Df25c604D3294";
const POOL = "0xE270273A4e75c150837bd22B6340268569f3eC14";

const WETH_AMOUNT = ethers.parseEther("0.05");
const ORBUSD_AMOUNT = ethers.parseUnits("100", 18);

async function main() {
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  const OrbUSD = await ethers.getContractAt("OrbToken", ORBUSD);
  const Pool = await ethers.getContractAt("OrbPool", POOL);

  const [r0, r1] = await Pool.getReserves();
  console.log("Current reserves: token0", r0.toString(), "token1", r1.toString());

  const wethAbi = [
    "function deposit() payable",
    "function approve(address,uint256) returns (bool)",
    "function balanceOf(address) view returns (uint256)",
  ];
  const weth = new ethers.Contract(SEPOLIA_WETH, wethAbi, signer);

  console.log("Wrapping ETH...");
  const wrapTx = await weth.deposit({ value: WETH_AMOUNT });
  await wrapTx.wait();
  console.log("WETH balance:", ethers.formatEther(await weth.balanceOf(signerAddress)));

  console.log("Approving pool...");
  const a1 = await weth.approve(POOL, ethers.MaxUint256);
  await a1.wait();
  const a2 = await OrbUSD.approve(POOL, ethers.MaxUint256);
  await a2.wait();

  console.log("Adding liquidity:", ethers.formatEther(WETH_AMOUNT), "WETH +", ethers.formatUnits(ORBUSD_AMOUNT, 18), "OrbUSD");
  try {
    const tx = await Pool.addLiquidity(
      WETH_AMOUNT,
      ORBUSD_AMOUNT,
      0,
      0
    );
    await tx.wait();
    console.log("Liquidity added. Tx:", tx.hash);
    const [r0n, r1n] = await Pool.getReserves();
    console.log("New reserves: token0", ethers.formatEther(r0n), "token1", ethers.formatUnits(r1n, 18));
  } catch (e: unknown) {
    const err = e as { data?: string; reason?: string; message?: string };
    console.error("Revert reason:", err.reason ?? err.message);
    if (err.data) console.error("Revert data:", err.data);
    throw e;
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
