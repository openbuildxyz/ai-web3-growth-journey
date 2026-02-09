"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useCallback } from "react";
import { TrustBadge } from "@/components/agent/trust-badge";
import { GET_AGENT, type SubgraphAgent, type SubgraphFeedback } from "@/lib/subgraph";
import { CONTRACT_ADDRESSES, REPUTATION_REGISTRY_ABI } from "@/lib/contracts";

/**
 * Agent Detail Page
 * Shows agent profile, trust score, feedback history, and give-feedback form
 */
export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;
  const { address, isConnected } = useAccount();

  const { data, loading, error, refetch } = useQuery<{
    agent: SubgraphAgent & { feedbacks: SubgraphFeedback[] };
  }>(GET_AGENT, {
    variables: { id: agentId },
  });

  const agent = data?.agent || null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Could not load agent data. The subgraph may not be deployed yet.
          </p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center py-20">
        <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
          Agent #{agentId} not found
        </p>
      </div>
    );
  }

  const trustScore = agent.trustScore ? parseFloat(agent.trustScore) : null;
  const feedbackCount = parseInt(agent.feedbackCount, 10);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Agent Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Agent #{agent.agentId}
            </h1>
            <TrustBadge score={trustScore} />
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Registered on{" "}
            {new Date(
              parseInt(agent.createdAt, 10) * 1000
            ).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Agent Details */}
      <div className="mt-6 space-y-4">
        <DetailRow label="Owner" value={agent.owner} isAddress />
        {agent.agentWallet && (
          <DetailRow label="Agent Wallet" value={agent.agentWallet} isAddress />
        )}
        {agent.agentURI && (
          <DetailRow label="Agent URI" value={agent.agentURI} />
        )}
        <DetailRow
          label="Trust Score"
          value={trustScore !== null ? `${trustScore.toFixed(1)} / 100` : "No score yet"}
        />
        <DetailRow label="Feedback Count" value={String(feedbackCount)} />
      </div>

      {/* Give Feedback Section */}
      {isConnected && (
        <FeedbackForm agentId={agentId} onSuccess={() => refetch()} />
      )}

      {/* Feedback History */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Feedback History
        </h2>

        {agent.feedbacks && agent.feedbacks.length > 0 ? (
          <div className="mt-4 space-y-3">
            {agent.feedbacks.map((fb) => (
              <FeedbackRow key={fb.id} feedback={fb} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            No feedback yet. Be the first to review this agent.
          </p>
        )}
      </div>
    </div>
  );
}

/** Display a detail row with label and value */
function DetailRow({
  label,
  value,
  isAddress,
}: {
  label: string;
  value: string;
  isAddress?: boolean;
}) {
  return (
    <div className="flex items-start justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      {isAddress ? (
        <a
          href={`https://sepolia.etherscan.io/address/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-mono text-blue-600 hover:underline dark:text-blue-400"
        >
          {value.slice(0, 6)}...{value.slice(-4)}
        </a>
      ) : (
        <span className="text-sm text-zinc-700 dark:text-zinc-300 max-w-xs truncate">
          {value}
        </span>
      )}
    </div>
  );
}

/** Give Feedback form component */
function FeedbackForm({
  agentId,
  onSuccess,
}: {
  agentId: string;
  onSuccess: () => void;
}) {
  const [feedbackValue, setFeedbackValue] = useState("80");
  const [tag1, setTag1] = useState("starred");

  const {
    data: txHash,
    writeContract,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const handleSubmit = useCallback(() => {
    const value = parseInt(feedbackValue, 10);
    if (isNaN(value)) return;

    writeContract({
      address: CONTRACT_ADDRESSES.REPUTATION_REGISTRY,
      abi: REPUTATION_REGISTRY_ABI,
      functionName: "giveFeedback",
      args: [
        BigInt(agentId),
        BigInt(value),
        0, // valueDecimals
        tag1,
        "", // tag2
        "", // endpoint
        "", // feedbackURI
        "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`, // feedbackHash
      ],
    });
  }, [agentId, feedbackValue, tag1, writeContract]);

  if (isConfirmed) {
    onSuccess();
  }

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Give Feedback
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Score (0-100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={feedbackValue}
            onChange={(e) => setFeedbackValue(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Category
          </label>
          <select
            value={tag1}
            onChange={(e) => setTag1(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="starred">Quality Rating</option>
            <option value="reachable">Reachability</option>
            <option value="uptime">Uptime</option>
            <option value="successRate">Success Rate</option>
            <option value="responseTime">Response Time</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isWriting || isConfirming}
        className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {isWriting
          ? "Signing..."
          : isConfirming
            ? "Confirming..."
            : "Submit Feedback"}
      </button>

      {isConfirmed && (
        <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
          Feedback submitted successfully!
        </p>
      )}

      {writeError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Error: {writeError.message.slice(0, 150)}
        </p>
      )}
    </div>
  );
}

/** Single feedback row in the history list */
function FeedbackRow({ feedback }: { feedback: SubgraphFeedback }) {
  const date = new Date(
    parseInt(feedback.createdAt, 10) * 1000
  ).toLocaleDateString();

  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
        feedback.isRevoked
          ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30"
          : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
          {feedback.clientAddress.slice(0, 6)}...
          {feedback.clientAddress.slice(-4)}
        </span>
        {feedback.tag1 && (
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {feedback.tag1}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-semibold ${
            feedback.isRevoked
              ? "text-red-500 line-through"
              : parseInt(feedback.value) >= 70
                ? "text-emerald-600 dark:text-emerald-400"
                : parseInt(feedback.value) >= 40
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
          }`}
        >
          {feedback.value}
        </span>
        <span className="text-xs text-zinc-400">{date}</span>
      </div>
    </div>
  );
}
