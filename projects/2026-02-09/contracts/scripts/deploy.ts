import fs from 'fs'
import path from 'path'
import { network } from 'hardhat'
import { parseEther } from 'viem'

async function main() {
  const { viem, networkName } = await network.connect()
  const publicClient = await viem.getPublicClient()
  const [deployer] = await viem.getWalletClients()
  console.log('Network:', networkName)
  console.log('Deployer:', deployer.account.address)

  const token = await viem.deployContract(
    'PlatformToken',
    ['Qian', 'Q', parseEther('100000000'), deployer.account.address],
    { client: { wallet: deployer } },
  )

  console.log('PlatformToken:', token.address)

  const tokensPerEth = parseEther('100')
  const exchange = await viem.deployContract(
    'TokenExchange',
    [token.address, tokensPerEth, deployer.account.address],
    { client: { wallet: deployer } },
  )
  console.log('TokenExchange:', exchange.address)

  const minterRole = await token.read.MINTER_ROLE()
  const tx0 = await token.write.grantRole([minterRole, exchange.address], {
    account: deployer.account,
  })
  await publicClient.waitForTransactionReceipt({ hash: tx0 })
  console.log('PlatformToken.grantRole(MINTER_ROLE) OK')

  const vault = await viem.deployContract('EscrowVault', [token.address], {
    client: { wallet: deployer },
  })

  console.log('EscrowVault:', vault.address)

  const taskManager = await viem.deployContract(
    'TaskManager',
    [vault.address],
    { client: { wallet: deployer } },
  )

  console.log('TaskManager:', taskManager.address)

  const arbitration = await viem.deployContract(
    'Arbitration',
    [token.address, taskManager.address],
    { client: { wallet: deployer } },
  )
  console.log('Arbitration:', arbitration.address)

  const tx1 = await vault.write.setTaskManager([taskManager.address], {
    account: deployer.account,
  })

  await publicClient.waitForTransactionReceipt({ hash: tx1 })
  console.log('Vault.setTaskManager OK')

  const tx2 = await taskManager.write.setArbitration([arbitration.address], {
    account: deployer.account,
  })

  await publicClient.waitForTransactionReceipt({ hash: tx2 })
  console.log('TaskManager.setArbitration OK')
  const outDir = path.join(process.cwd(), 'deployments')

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
  }

  const outPath = path.join(outDir, `${networkName}.json`)

  const payload = {
    network: networkName,
    deployer: deployer.account.address,
    token: token.address,
    exchange: exchange.address,
    vault: vault.address,
    taskManager: taskManager.address,
    arbitration: arbitration.address,
  }
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2))
  console.log('Saved:', outPath)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
