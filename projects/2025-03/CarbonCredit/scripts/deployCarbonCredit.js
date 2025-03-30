const hre = require('hardhat');

async function main() {
  const deployer = await ethers.getSigner(
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  );
  const CarbonCredit = await hre.ethers.getContractFactory('CarbonCredit');

  const nonce = await deployer.getNonce();
  const carbonCredit = await CarbonCredit.deploy({
    nonce: nonce,
    gasLimit: 2000000, // 增加gasLimit以适应合约部署需求
    gasPrice: 875000000, // 设置与本地节点匹配的gasPrice
  });
  await carbonCredit.waitForDeployment();

  console.log(`CarbonCredit deployed to: ${await carbonCredit.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
