"use client";

import Link from "next/link";
import { TrustBadge } from "./trust-badge";
import type { SubgraphAgent } from "@/lib/subgraph";

/**
 * AgentCard displays a summary card for an agent in the agent list
 */
export function AgentCard({ agent }: { agent: SubgraphAgent }) {
  const trustScore = agent.trustScore ? parseFloat(agent.trustScore) : null;
  const feedbackCount = parseInt(agent.feedbackCount, 10);
  const createdDate = new Date(parseInt(agent.createdAt, 10) * 1000).toLocaleDateString();

  return (
    <Link
      href={`/agents/${agent.agentId}`}
      className="group block rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-600"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
              Agent #{agent.agentId}
            </h3>
            <TrustBadge score={trustScore} />
          </div>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 truncate">
            Owner: {agent.owner.slice(0, 6)}...{agent.owner.slice(-4)}
          </p>

          {agent.agentWallet && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 truncate">
              Wallet: {agent.agentWallet.slice(0, 6)}...{agent.agentWallet.slice(-4)}
            </p>
          )}
        </div>

        <div className="ml-4 text-right text-sm text-zinc-500 dark:text-zinc-400">
          <p>{feedbackCount} reviews</p>
          <p className="mt-0.5">{createdDate}</p>
        </div>
      </div>

      {agent.agentURI && (
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500 truncate">
          URI: {agent.agentURI.slice(0, 60)}{agent.agentURI.length > 60 ? "..." : ""}
        </p>
      )}
    </Link>
  );
}
