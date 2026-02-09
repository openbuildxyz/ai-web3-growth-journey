"use client";

import { useState, useCallback, useMemo } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES, IDENTITY_REGISTRY_ABI } from "@/lib/contracts";

/** Zero address constant for contract deployment check */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Agent Registration Page
 * Allows users to register a new agent identity on Ethereum Sepolia
 * by minting an ERC-721 NFT with agent metadata
 */
export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [agentImage, setAgentImage] = useState("");
  const [solanaAddress, setSolanaAddress] = useState("");
  const [mcpEndpoint, setMcpEndpoint] = useState("");

  /** Check if the IdentityRegistry contract has been deployed */
  const isContractDeployed = useMemo(
    () => CONTRACT_ADDRESSES.IDENTITY_REGISTRY !== ZERO_ADDRESS,
    []
  );

  const {
    data: txHash,
    writeContract,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  /** Build the agent registration file as a data URI */
  const buildAgentURI = useCallback(() => {
    const registrationFile = {
      type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
      name: agentName,
      description: agentDescription,
      image: agentImage || "",
      services: [
        ...(mcpEndpoint
          ? [{ name: "MCP", endpoint: mcpEndpoint, version: "2025-06-18" }]
          : []),
        ...(solanaAddress
          ? [{ name: "solana-wallet", endpoint: solanaAddress }]
          : []),
      ],
      x402Support: true,
      active: true,
      supportedTrust: ["reputation"],
    };
    const jsonString = JSON.stringify(registrationFile);
    const base64 = btoa(jsonString);
    return `data:application/json;base64,${base64}`;
  }, [agentName, agentDescription, agentImage, solanaAddress, mcpEndpoint]);

  /** Handle form submission — guards against undeployed contract */
  const handleRegister = useCallback(() => {
    if (!agentName.trim() || !isContractDeployed) return;
    const agentURI = buildAgentURI();
    writeContract({
      address: CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: "register",
      args: [agentURI],
    });
  }, [agentName, isContractDeployed, buildAgentURI, writeContract]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Register Agent
        </h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          Connect your wallet to register a new agent identity.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Register Agent Identity
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Mint an ERC-8004 identity NFT on Ethereum Sepolia. Your agent will be
        discoverable and can build on-chain reputation.
      </p>

      <div className="mt-8 space-y-6">
        {/* Agent Name */}
        <div>
          <label
            htmlFor="agentName"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Agent Name *
          </label>
          <input
            id="agentName"
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="e.g., TradingBot-Alpha"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Description *
          </label>
          <textarea
            id="description"
            value={agentDescription}
            onChange={(e) => setAgentDescription(e.target.value)}
            placeholder="Describe what your agent does, pricing, interaction methods..."
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Image URL */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Image URL
          </label>
          <input
            id="image"
            type="url"
            value={agentImage}
            onChange={(e) => setAgentImage(e.target.value)}
            placeholder="https://example.com/agent-avatar.png"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Solana Address */}
        <div>
          <label
            htmlFor="solana"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Solana Devnet Address 
          </label>
          <input
            id="solana"
            type="text"
            value={solanaAddress}
            onChange={(e) => setSolanaAddress(e.target.value)}
            placeholder="e.g., 7nYK9..."
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* MCP Endpoint */}
        <div>
          <label
            htmlFor="mcp"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            MCP Endpoint (optional)
          </label>
          <input
            id="mcp"
            type="url"
            value={mcpEndpoint}
            onChange={(e) => setMcpEndpoint(e.target.value)}
            placeholder="https://mcp.agent.example/"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Connected Wallet */}
        <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Connected wallet (agent owner &amp; initial agentWallet):
          </p>
          <p className="mt-1 text-sm font-mono text-zinc-700 dark:text-zinc-300">
            {address}
          </p>
        </div>

        {/* Contract not deployed warning */}
        {!isContractDeployed && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Contracts not deployed yet
            </p>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              The IdentityRegistry contract address is not configured. Deploy the
              contracts to Sepolia first, then update the address in{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
                lib/contracts.ts
              </code>.
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleRegister}
          disabled={!agentName.trim() || !isContractDeployed || isWriting || isConfirming}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!isContractDeployed
            ? "Deploy Contracts First"
            : isWriting
              ? "Signing Transaction..."
              : isConfirming
                ? "Confirming on-chain..."
                : "Register Agent (Mint NFT)"}
        </button>

        {/* Success */}
        {isConfirmed && txHash && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Agent registered successfully!
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-xs text-emerald-600 underline dark:text-emerald-400"
            >
              View on Etherscan: {txHash.slice(0, 12)}...
            </a>
          </div>
        )}

        {/* Error */}
        {writeError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Registration failed
            </p>
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {writeError.message.slice(0, 200)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
