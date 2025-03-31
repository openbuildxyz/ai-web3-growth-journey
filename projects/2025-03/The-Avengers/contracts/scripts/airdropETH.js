const hre = require('hardhat');

async function main() {
  // 获取本地节点账户
  const [deployer] = await hre.ethers.getSigners();

  // 空投地址
  const airdropAddress = '0xA49Af136fa1759969f61FfE2742619F82dEFeF49';

  // 空投金额 (10 ETH)
  const amount = hre.ethers.parseEther('10');

  console.log(`准备向地址 ${airdropAddress} 空投 ${hre.ethers.formatEther(amount)} ETH...`);

  // 执行空投
  try {
    const tx = await deployer.sendTransaction({
      to: airdropAddress,
      value: amount,
      gasPrice: 875000000, // 设置为高于baseFeePerGas(685558186)的值
    });

    await tx.wait();

    console.log(`成功向地址 ${airdropAddress} 空投了 ${hre.ethers.formatEther(amount)} ETH！`);
    console.log(`交易哈希: ${tx.hash}`);
  } catch (error) {
    console.error('空投失败:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
