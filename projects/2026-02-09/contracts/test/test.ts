import { expect } from 'chai'
import { beforeEach, describe, it } from 'node:test'
import { network } from 'hardhat'
import { keccak256, parseEther, toHex, type Address, type Hex } from 'viem'

// Notes:
// - Uses Hardhat 3 + hardhat-toolbox-viem (no ethers).
// - Deploy order matters:
//   PlatformToken -> EscrowVault(token) -> TaskManager(vault) -> Arbitration(token, taskManager)
//   then: vault.setTaskManager(taskManager) and taskManager.setArbitration(arbitration)

describe('Task platform (viem)', () => {
  let publicClient: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof network.connect>>['viem']['getPublicClient']
    >
  >
  let deployer: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof network.connect>>['viem']['getWalletClients']
    >
  >[number]
  let buyer: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof network.connect>>['viem']['getWalletClients']
    >
  >[number]
  let agent: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof network.connect>>['viem']['getWalletClients']
    >
  >[number]
  let voter: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof network.connect>>['viem']['getWalletClients']
    >
  >[number]

  let token: any
  let vault: any
  let taskManager: any
  let arbitration: any

  async function wait(hash: Hex) {
    await publicClient.waitForTransactionReceipt({ hash })
  }

  beforeEach(async () => {
    const { viem } = await network.connect()
    publicClient = await viem.getPublicClient()
    const wallets = await viem.getWalletClients()
    ;[deployer, buyer, agent, voter] = wallets

    token = await viem.deployContract(
      'PlatformToken',
      [
        'PlatformToken',
        'PLT',
        parseEther('100000000'),
        deployer.account.address,
      ],
      { client: { wallet: deployer } },
    )

    vault = await viem.deployContract('EscrowVault', [token.address], {
      client: { wallet: deployer },
    })

    taskManager = await viem.deployContract('TaskManager', [vault.address], {
      client: { wallet: deployer },
    })

    arbitration = await viem.deployContract(
      'Arbitration',
      [token.address, taskManager.address],
      { client: { wallet: deployer } },
    )

    await wait(
      await vault.write.setTaskManager([taskManager.address as Address], {
        account: deployer.account,
      }),
    )

    await wait(
      await taskManager.write.setArbitration([arbitration.address as Address], {
        account: deployer.account,
      }),
    )
  })

  it('happy path: create -> accept -> submit -> approve (escrow released)', async () => {
    const amount = parseEther('10')
    const metaHash = keccak256(toHex('task-1'))
    const deliveryHash = keccak256(toHex('delivery-1'))

    // fund buyer
    await wait(
      await token.write.mint([buyer.account.address as Address, amount], {
        account: deployer.account,
      }),
    )

    const buyerBal0 = (await token.read.balanceOf([
      buyer.account.address as Address,
    ])) as bigint
    expect(buyerBal0).to.equal(amount)

    // approve vault
    await wait(
      await token.write.approve([vault.address as Address, amount], {
        account: buyer.account,
      }),
    )

    const taskId = (await taskManager.read.nextTaskId()) as bigint

    await wait(
      await taskManager.write.createTask([amount, metaHash], {
        account: buyer.account,
      }),
    )

    const t1 = (await taskManager.read.getTask([taskId])) as {
      buyer: Address
      agent: Address
      amount: bigint
      status: number
      metaHash: Hex
      deliveryHash: Hex
    }

    expect(t1.buyer.toLowerCase()).to.equal(buyer.account.address.toLowerCase())
    expect(t1.amount).to.equal(amount)
    expect(t1.status).to.equal(0) // Created

    expect((await vault.read.escrowOf([taskId])) as bigint).to.equal(amount)

    await wait(
      await taskManager.write.acceptTask([taskId], {
        account: agent.account,
      }),
    )

    await wait(
      await taskManager.write.submitDelivery([taskId, deliveryHash], {
        account: agent.account,
      }),
    )

    const agentBal0 = (await token.read.balanceOf([
      agent.account.address as Address,
    ])) as bigint

    await wait(
      await taskManager.write.approve([taskId], {
        account: buyer.account,
      }),
    )

    const t2 = (await taskManager.read.getTask([taskId])) as {
      status: number
    }
    expect(t2.status).to.equal(4) // Completed

    expect((await vault.read.escrowOf([taskId])) as bigint).to.equal(0n)

    const agentBal1 = (await token.read.balanceOf([
      agent.account.address as Address,
    ])) as bigint
    expect(agentBal1 - agentBal0).to.equal(amount)
  })

  it('dispute path: dispute -> vote -> finalize -> onArbitrated (buyer refunded)', async () => {
    const amount = parseEther('7')
    const metaHash = keccak256(toHex('task-2'))
    const deliveryHash = keccak256(toHex('delivery-2'))

    // lower quorum so we can finalize with a single vote
    await wait(
      await arbitration.write.setParams([parseEther('100'), 60n, 1n], {
        account: deployer.account,
      }),
    )

    // fund buyer and voter
    await wait(
      await token.write.mint([buyer.account.address as Address, amount], {
        account: deployer.account,
      }),
    )

    const minStake = (await arbitration.read.minStake()) as bigint
    await wait(
      await token.write.mint([voter.account.address as Address, minStake], {
        account: deployer.account,
      }),
    )

    // buyer approves vault and creates task
    await wait(
      await token.write.approve([vault.address as Address, amount], {
        account: buyer.account,
      }),
    )

    const taskId = (await taskManager.read.nextTaskId()) as bigint
    await wait(
      await taskManager.write.createTask([amount, metaHash], {
        account: buyer.account,
      }),
    )

    await wait(
      await taskManager.write.acceptTask([taskId], {
        account: agent.account,
      }),
    )

    await wait(
      await taskManager.write.submitDelivery([taskId, deliveryHash], {
        account: agent.account,
      }),
    )

    const buyerBal0 = (await token.read.balanceOf([
      buyer.account.address as Address,
    ])) as bigint

    // open dispute
    await wait(
      await taskManager.write.dispute([taskId], {
        account: buyer.account,
      }),
    )

    // voter stakes and votes BuyerWins
    await wait(
      await token.write.approve([arbitration.address as Address, minStake], {
        account: voter.account,
      }),
    )

    await wait(
      await arbitration.write.stake([minStake], {
        account: voter.account,
      }),
    )

    await wait(
      await arbitration.write.vote([taskId, 1], {
        account: voter.account,
      }),
    )

    await wait(
      await arbitration.write.finalize([taskId], {
        account: deployer.account,
      }),
    )

    const t = (await taskManager.read.getTask([taskId])) as { status: number }
    expect(t.status).to.equal(6) // Arbitrated

    // escrow consumed
    expect((await vault.read.escrowOf([taskId])) as bigint).to.equal(0n)

    // buyer got refund
    const buyerBal1 = (await token.read.balanceOf([
      buyer.account.address as Address,
    ])) as bigint
    expect(buyerBal1 - buyerBal0).to.equal(amount)
  })
})
