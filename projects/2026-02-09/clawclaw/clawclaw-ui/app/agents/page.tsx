"use client";

import { useQuery } from "@apollo/client/react";
import { GET_AGENTS, type SubgraphAgent } from "@/lib/subgraph";
import { AgentCard } from "@/components/agent/agent-card";
import { useState } from "react";

/**
 * Agents List Page
 * Browse all registered agents with trust scores from the subgraph
 */
export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const { data, loading, error } = useQuery(GET_AGENTS, {
    variables: { first: 50, skip: 0, orderBy: sortBy },
  });

  const agents: SubgraphAgent[] = data?.agents || [];

  /** Filter agents by search query (owner address or agentId) */
  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      agent.agentId.includes(query) ||
      agent.owner.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Agent Directory
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Browse registered agents and their trust scores
          </p>
        </div>

        <div className="flex gap-3">
          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or address..."
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="createdAt">Newest</option>
            <option value="trustScore">Trust Score</option>
            <option value="feedbackCount">Most Reviews</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Subgraph not yet deployed. Showing empty state. Deploy the subgraph
            and update the endpoint in <code>lib/subgraph.ts</code>.
          </p>
        </div>
      )}

      {/* Agent List */}
      {!loading && filteredAgents.length > 0 && (
        <div className="mt-6 space-y-3">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAgents.length === 0 && (
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
            No agents found
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
            {searchQuery
              ? "Try a different search query"
              : "Be the first to register an agent!"}
          </p>
        </div>
      )}
    </div>
  );
}
