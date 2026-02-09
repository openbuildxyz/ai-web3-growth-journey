/**
 * Post-Consensus Execution
 *
 * Execute approved proposals for agreeing agents.
 */

import type { Proposal, Execution, ExecutionStatus } from '@uniforum/shared';
import { executeSwap, addLiquidity, removeLiquidity, executeLimitOrder } from '@uniforum/contracts';
import { sleep, retryWithBackoff } from '@uniforum/shared';

export interface ExecutionContext {
  proposal: Proposal;
  agentEnsName: string;
  agentPrivateKey: `0x${string}`;
  chainId?: number;
}

export interface ExecutionResult {
  agentEnsName: string;
  status: ExecutionStatus;
  txHash?: string;
  error?: string;
  gasUsed?: string;
}

/**
 * Execute a proposal for a single agent
 */
export async function executeForAgent(context: ExecutionContext): Promise<ExecutionResult> {
  const { proposal, agentEnsName, agentPrivateKey, chainId = 1301 } = context;

  try {
    let result;

    const hooks = proposal.hooks;

    switch (proposal.action) {
      case 'swap':
        result = await executeSwap({
          privateKey: agentPrivateKey,
          params: proposal.params as any,
          hooks,
          chainId,
        });
        break;

      case 'addLiquidity':
        result = await addLiquidity({
          privateKey: agentPrivateKey,
          params: proposal.params as any,
          hooks,
          chainId,
        });
        break;

      case 'removeLiquidity': {
        const rp = proposal.params as {
          tokenId: string;
          liquidityAmount: string;
          currency0?: string;
          currency1?: string;
          recipient?: string;
          amount0Min?: string;
          amount1Min?: string;
        };
        result = await removeLiquidity({
          privateKey: agentPrivateKey,
          tokenId: BigInt(rp.tokenId),
          liquidityToRemove: BigInt(rp.liquidityAmount),
          hooks,
          chainId,
          currency0: rp.currency0,
          currency1: rp.currency1,
          recipient: rp.recipient,
          amount0Min: rp.amount0Min,
          amount1Min: rp.amount1Min,
        });
        break;
      }

      case 'limitOrder':
        result = await executeLimitOrder({
          privateKey: agentPrivateKey,
          params: proposal.params as any,
          hooks,
          chainId,
        });
        break;

      default:
        throw new Error(`Unknown action: ${(proposal as any).action}`);
    }

    if (result.success) {
      return {
        agentEnsName,
        status: 'success',
        txHash: result.txHash,
      };
    } else {
      return {
        agentEnsName,
        status: 'failed',
        error: result.error,
      };
    }
  } catch (error) {
    return {
      agentEnsName,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute a proposal for the designated executor agent.
 *
 * Note: The function accepts an array for future extensibility, but in the
 * Uniforum flow we only ever execute using a single agent – the forum creator
 * whose proposal reached consensus. Callers should therefore pass an array
 * containing just that creator agent.
 */
export async function executeConsensus(
  proposal: Proposal,
  agreeingAgents: Array<{
    ensName: string;
    privateKey: `0x${string}`;
  }>,
  options: {
    chainId?: number;
    parallel?: boolean;
    delayBetweenMs?: number;
  } = {}
): Promise<ExecutionResult[]> {
  const { chainId = 1301, parallel = false, delayBetweenMs = 1000 } = options;

  // For Uniforum, we intentionally execute using a single agent (the forum
  // creator). If more than one agent is passed, we only execute for the first
  // one to preserve the "collective intelligence, single executor" model.
  const executors = agreeingAgents.slice(0, 1);

  const results: ExecutionResult[] = [];

  if (parallel) {
    // Execute in parallel (effectively a no-op difference with a single agent,
    // but kept for API symmetry).
    const promises = executors.map((agent) =>
      retryWithBackoff(
        () =>
          executeForAgent({
            proposal,
            agentEnsName: agent.ensName,
            agentPrivateKey: agent.privateKey,
            chainId,
          }),
        3,
        1000
      )
    );

    const parallelResults = await Promise.allSettled(promises);

    for (let i = 0; i < parallelResults.length; i++) {
      const result = parallelResults[i];
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          agentEnsName: executors[i].ensName,
          status: 'failed',
          error: result.reason?.message || 'Execution failed',
        });
      }
    }
  } else {
    // Execute sequentially with delay (again, typically a single agent).
    for (const agent of executors) {
      const result = await retryWithBackoff(
        () =>
          executeForAgent({
            proposal,
            agentEnsName: agent.ensName,
            agentPrivateKey: agent.privateKey,
            chainId,
          }),
        3,
        1000
      );

      results.push(result);

      // Delay between executions to avoid nonce issues
      if (delayBetweenMs > 0) {
        await sleep(delayBetweenMs);
      }
    }
  }

  return results;
}

/**
 * Summarize execution results
 */
export function summarizeExecutionResults(results: ExecutionResult[]): {
  total: number;
  successful: number;
  failed: number;
  txHashes: string[];
  errors: string[];
} {
  const successful = results.filter((r) => r.status === 'success');
  const failed = results.filter((r) => r.status === 'failed');

  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    txHashes: successful.map((r) => r.txHash!).filter(Boolean),
    errors: failed.map((r) => `${r.agentEnsName}: ${r.error}`),
  };
}
