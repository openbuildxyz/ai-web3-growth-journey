const hre = require('hardhat');

async function main() {
  // 获取合约实例
  const CarbonCredit = await hre.ethers.getContractFactory('CarbonCredit');
  const carbonCredit = await CarbonCredit.attach(
    '0x67d269191c92Caf3cD7723F116c85e6E9bf55933'
  );

  // 空投地址
  const airdropAddress = '0xA49Af136fa1759969f61FfE2742619F82dEFeF49';

  // 空投参数
  const credits = [
    { projectId: 'PROJ-001', standard: 'VCS', amount: 1000, vintageYear: 2023 },
    { projectId: 'PROJ-002', standard: 'GS', amount: 2000, vintageYear: 2022 },
    { projectId: 'PROJ-003', standard: 'CDM', amount: 1500, vintageYear: 2021 },
  ];

  console.log(`准备向地址 ${airdropAddress} 空投碳积分...`);

  // 执行空投
  try {
    for (const credit of credits) {
      console.log(
        `准备向地址 ${airdropAddress} 空投碳积分 ${credit.projectId}...`
      );

      const [signer] = await hre.ethers.getSigners();
      const tx = await carbonCredit
        .connect(signer)
        .mint(
          credit.projectId,
          credit.standard,
          credit.amount,
          credit.vintageYear,
          {
            gasPrice: 875000000, // 设置为与部署脚本一致的gasPrice
          }
        );
      const receipt = await tx.wait();
      const creditId = receipt.logs[0].args.id;

      // 直接将积分所有权转移给目标地址
      const transferTx = await carbonCredit
        .connect(signer)
        .transfer(creditId, airdropAddress);
      await transferTx.wait();

      console.log(
        `成功向地址 ${airdropAddress} 空投了 ${credit.amount} 吨碳积分 ${credit.projectId}！`
      );
      console.log(`交易哈希: ${receipt.hash}`);
    }
  } catch (error) {
    console.error('空投失败:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
