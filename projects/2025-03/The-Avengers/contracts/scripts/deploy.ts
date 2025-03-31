import { ethers } from 'hardhat';

async function main() {
  console.log('开始部署 TicTacToe 合约...');

  const TicTacToe = await ethers.getContractFactory('TicTacToe');
  const ticTacToe = await TicTacToe.deploy();

  await ticTacToe.waitForDeployment();

  const address = await ticTacToe.getAddress();
  console.log(`TicTacToe 合约已部署到地址: ${address}`);
}

// 执行部署脚本
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
