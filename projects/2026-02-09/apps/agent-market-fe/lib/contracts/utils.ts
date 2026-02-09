/**
 * Contract interaction utilities
 */
import { Contract, BrowserProvider, type JsonRpcSigner } from 'ethers'

import { CONTRACT_ADDRESSES } from './addresses'
import type { ArbitrationCaseStruct, TaskStruct } from './types'
import {
  ARBITRATION_ABI,
  ESCROW_VAULT_ABI,
  PLATFORM_TOKEN_ABI,
  TASK_MANAGER_ABI,
  TOKEN_EXCHANGE_ABI,
} from './abis'

/**
 * Get Arbitration contract instance
 */
export function getArbitrationContract(
  providerOrSigner: BrowserProvider | JsonRpcSigner,
) {
  return new Contract(
    CONTRACT_ADDRESSES.Arbitration,
    ARBITRATION_ABI,
    providerOrSigner,
  )
}

/**
 * Get TaskManager contract instance
 */
export function getTaskManagerContract(
  providerOrSigner: BrowserProvider | JsonRpcSigner,
) {
  return new Contract(
    CONTRACT_ADDRESSES.TaskManager,
    TASK_MANAGER_ABI,
    providerOrSigner,
  )
}

/**
 * Get PlatformToken contract instance
 */
export function getPlatformTokenContract(
  providerOrSigner: BrowserProvider | JsonRpcSigner,
) {
  return new Contract(
    CONTRACT_ADDRESSES.PlatformToken,
    PLATFORM_TOKEN_ABI,
    providerOrSigner,
  )
}

/**
 * Read case from Arbitration contract
 */
export async function readCase(
  provider: BrowserProvider,
  taskId: bigint,
): Promise<ArbitrationCaseStruct | null> {
  const contract = getArbitrationContract(provider)
  try {
    const case_ = await contract.getCase(taskId)
    if (!case_.exists) {
      return null
    }
    return {
      exists: case_.exists,
      finalized: case_.finalized,
      buyer: case_.buyer,
      agent: case_.agent,
      amount: case_.amount,
      openedAt: case_.openedAt,
      deadline: case_.deadline,
      quorum: Number(case_.quorum),
      buyerVotes: Number(case_.buyerVotes),
      agentVotes: Number(case_.agentVotes),
      result: Number(case_.result),
    }
  } catch (error) {
    console.error('Failed to read case:', error)
    throw error
  }
}

/**
 * Read task from TaskManager contract
 */
export async function readTask(
  provider: BrowserProvider,
  taskId: bigint,
): Promise<TaskStruct | null> {
  const contract = getTaskManagerContract(provider)
  try {
    const task = await contract.getTask(taskId)
    return {
      buyer: task.buyer,
      agent: task.agent,
      amount: task.amount,
      status: Number(task.status),
      createdAt: task.createdAt,
      acceptedAt: task.acceptedAt,
      submittedAt: task.submittedAt,
      disputedAt: task.disputedAt,
      metaHash: task.metaHash,
      deliveryHash: task.deliveryHash,
    }
  } catch (error) {
    console.error('Failed to read task:', error)
    return null
  }
}

/**
 * Read minStake from Arbitration contract
 */
export async function readMinStake(provider: BrowserProvider): Promise<bigint> {
  const contract = getArbitrationContract(provider)
  return await contract.minStake()
}

/**
 * Read voteDuration from Arbitration contract
 */
export async function readVoteDuration(
  provider: BrowserProvider,
): Promise<bigint> {
  const contract = getArbitrationContract(provider)
  return await contract.voteDuration()
}

/**
 * Read defaultQuorum from Arbitration contract
 */
export async function readDefaultQuorum(
  provider: BrowserProvider,
): Promise<number> {
  const contract = getArbitrationContract(provider)
  const quorum = await contract.defaultQuorum()
  return Number(quorum)
}

/**
 * Read staked amount for an address
 */
export async function readStaked(
  provider: BrowserProvider,
  address: string,
): Promise<bigint> {
  const contract = getArbitrationContract(provider)
  return await contract.staked(address)
}

/**
 * Read total staked amount in the Arbitration contract
 */
export async function readTotalStaked(
  provider: BrowserProvider,
): Promise<bigint> {
  const tokenContract = getPlatformTokenContract(provider)
  return await tokenContract.balanceOf(CONTRACT_ADDRESSES.Arbitration)
}

/**
 * Check if address has voted on a case
 */
export async function readHasVoted(
  provider: BrowserProvider,
  taskId: bigint,
  address: string,
): Promise<boolean> {
  const contract = getArbitrationContract(provider)
  return await contract.hasVoted(taskId, address)
}

/**
 * Read PlatformToken symbol
 */
export async function readTokenSymbol(
  provider: BrowserProvider,
): Promise<string> {
  const contract = getPlatformTokenContract(provider)
  return await contract.symbol()
}

/**
 * Read PlatformToken decimals
 */
export async function readTokenDecimals(
  provider: BrowserProvider,
): Promise<number> {
  const contract = getPlatformTokenContract(provider)
  const decimals = await contract.decimals()
  return Number(decimals)
}

/**
 * Read token balance
 */
export async function readTokenBalance(
  provider: BrowserProvider,
  address: string,
): Promise<bigint> {
  const contract = getPlatformTokenContract(provider)
  return await contract.balanceOf(address)
}

/**
 * Read token allowance
 */
export async function readTokenAllowance(
  provider: BrowserProvider,
  owner: string,
  spender: string,
): Promise<bigint> {
  const contract = getPlatformTokenContract(provider)
  return await contract.allowance(owner, spender)
}

/**
 * Write: Stake tokens
 */
export async function writeStake(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  amount: bigint,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getArbitrationContract(signer)
  const tx = await contract.stake(amount)
  await tx.wait()
  return tx.hash
}

/**
 * Write: Unstake tokens
 */
export async function writeUnstake(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  amount: bigint,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getArbitrationContract(signer)
  const tx = await contract.unstake(amount)
  await tx.wait()
  return tx.hash
}

/**
 * Write: Vote on a case
 */
export async function writeVote(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  taskId: bigint,
  decision: number, // ArbitrationDecision enum value
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getArbitrationContract(signer)
  const tx = await contract.vote(taskId, decision)
  await tx.wait()
  return tx.hash
}

/**
 * Write: Finalize a case
 */
export async function writeFinalize(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  taskId: bigint,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getArbitrationContract(signer)
  const tx = await contract.finalize(taskId)
  await tx.wait()
  return tx.hash
}

/**
 * Write: Approve token spending
 */
export async function writeApprove(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  spender: string,
  amount: bigint,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getPlatformTokenContract(signer)
  const tx = await contract.approve(spender, amount)
  await tx.wait()
  return tx.hash
}

//新增写方法
export async function writeCreateTask(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  amount: bigint,
  metaHash: string,
): Promise<{ txHash: string; taskId: bigint | null }> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getTaskManagerContract(signer)
  const tx = await contract.createTask(amount, metaHash)
  const receipt = await tx.wait()
  const parsed = receipt?.logs
    ?.map((log: any) => {
      try {
        return contract.interface.parseLog(log)
      } catch {
        return null
      }
    })
    .find((entry: any) => entry?.name === 'TaskCreated')
  const taskId = parsed?.args?.taskId
  return { txHash: tx.hash, taskId: taskId ? BigInt(taskId) : null }
}

export async function writeAcceptTask(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  taskId: bigint,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getTaskManagerContract(signer)
  const tx = await contract.acceptTask(taskId)
  await tx.wait()
  return tx.hash
}

export async function writeStartTask(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  taskId: bigint,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getTaskManagerContract(signer)
  const tx = await contract.startTask(taskId)
  await tx.wait()
  return tx.hash
}

export async function writeSubmitDelivery(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  taskId: bigint,
  deliveryHash: string,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getTaskManagerContract(signer)
  const tx = await contract.submitDelivery(taskId, deliveryHash)
  await tx.wait()
  return tx.hash
}

export async function writeApproveTask(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  taskId: bigint,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getTaskManagerContract(signer)
  const tx = await contract.approve(taskId)
  await tx.wait()
  return tx.hash
}

export async function writeCancelTask(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  taskId: bigint,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getTaskManagerContract(signer)
  const tx = await contract.cancelTask(taskId)
  await tx.wait()
  return tx.hash
}

export async function writeDisputeTask(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  taskId: bigint,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getTaskManagerContract(signer)
  const tx = await contract.dispute(taskId)
  await tx.wait()
  return tx.hash
}

// 增加实例方法 getEscrowVaultContract
export function getEscrowVaultContract(
  providerOrSigner: BrowserProvider | JsonRpcSigner,
) {
  return new Contract(
    CONTRACT_ADDRESSES.EscrowVault,
    ESCROW_VAULT_ABI,
    providerOrSigner,
  )
}

// 新增CaseOpened事件
export async function readCaseOpenedTaskIds(
  provider: BrowserProvider,
  fromBlock?: number,
): Promise<string[]> {
  const contract = getArbitrationContract(provider)
  const filter = contract.filters.CaseOpened()
  const logs = await contract.queryFilter(filter, fromBlock ?? 0, 'latest')
  return logs
    .map((log) => {
      try {
        const parsed = contract.interface.parseLog(log)
        if (!parsed || parsed.name !== 'CaseOpened') return null
        const taskId = parsed.args?.taskId
        return taskId ? taskId.toString() : null
      } catch {
        return null
      }
    })
    .filter((id): id is string => Boolean(id))
}

// 读取质押地址
export async function readStakerAddresses(
  provider: BrowserProvider,
  fromBlock?: number,
): Promise<string[]> {
  const contract = getArbitrationContract(provider)
  const filters = [contract.filters.Staked(), contract.filters.Unstaked()]
  const logs = (
    await Promise.all(
      filters.map((f) => contract.queryFilter(f, fromBlock ?? 0, 'latest')),
    )
  ).flat()

  const addresses = logs
    .map((log) => {
      try {
        const parsed = contract.interface.parseLog(log)
        if (!parsed) return null
        const user = parsed.args?.user
        return user ? String(user).toLowerCase() : null
      } catch {
        return null
      }
    })
    .filter((addr): addr is string => Boolean(addr))

  return Array.from(new Set(addresses))
}

export function getTokenExchangeContract(
  providerOrSigner: BrowserProvider | JsonRpcSigner,
) {
  return new Contract(
    CONTRACT_ADDRESSES.TokenExchange,
    TOKEN_EXCHANGE_ABI,
    providerOrSigner,
  )
}

export async function readTokensPerEth(
  provider: BrowserProvider,
): Promise<bigint> {
  const contract = getTokenExchangeContract(provider)
  return await contract.tokensPerEth()
}

export async function writeBuyQ(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  value: bigint,
): Promise<string> {
  const signer =
    signerOrProvider instanceof BrowserProvider
      ? await signerOrProvider.getSigner()
      : signerOrProvider
  const contract = getTokenExchangeContract(signer)
  const tx = await contract.buy({ value })
  await tx.wait()
  return tx.hash
}
