"use client";

import { useState, useCallback } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, pad, toHex } from "viem";
import {
  CONTRACT_ADDRESSES,
  AGENT_PAYMENT_ABI,
  ERC20_ABI,
} from "@/lib/contracts";
import { CCTP_DOMAINS, CCTP_API } from "@/lib/chains";
import { TrustBadge } from "@/components/agent/trust-badge";

/** Minimum trust score required for the demo payment */
const DEMO_TRUST_THRESHOLD = 70;

/** Demo step states */
type DemoStep = "idle" | "checking" | "approved" | "approving_usdc" | "tipping" | "confirming" | "polling_attestation" | "complete";

/**
 * Cross-Chain Demo Page
 * Demonstrates the full AgentBridge flow:
 * 1. Enter agent ID and Solana recipient
 * 2. Check trust score via subgraph
 * 3. If trust passes, approve USDC and execute tip
 * 4. For cross-chain: burn USDC on Sepolia, poll attestation, display result
 */
export default function DemoPage() {
  const { address, isConnected } = useAccount();

  const [agentId, setAgentId] = useState("");
  const [amount, setAmount] = useState("1");
  const [solanaRecipient, setSolanaRecipient] = useState("");
  const [isCrossChain, setIsCrossChain] = useState(true);

  const [step, setStep] = useState<DemoStep>("idle");
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [isTrustPassed, setIsTrustPassed] = useState(false);
  const [attestationStatus, setAttestationStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // USDC Approve
  const {
    data: approveTxHash,
    writeContract: writeApprove,
    isPending: isApproving,
  } = useWriteContract();

  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // Tip transaction
  const {
    data: tipTxHash,
    writeContract: writeTip,
    isPending: isTipping,
    error: tipError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isTipConfirmed } =
    useWaitForTransactionReceipt({ hash: tipTxHash });

  /** Step 1: Check trust score */
  const handleCheckTrust = useCallback(async () => {
    setStep("checking");
    setErrorMessage("");

    try {
      // In production, this queries the subgraph
      // For demo, we simulate a trust score check
      const simulatedScore = 85; // Simulated trust score
      setTrustScore(simulatedScore);

      if (simulatedScore >= DEMO_TRUST_THRESHOLD) {
        setIsTrustPassed(true);
        setStep("approved");
      } else {
        setIsTrustPassed(false);
        setStep("idle");
        setErrorMessage(
          `Trust score ${simulatedScore} is below threshold ${DEMO_TRUST_THRESHOLD}. Payment blocked.`
        );
      }
    } catch (err) {
      setStep("idle");
      setErrorMessage("Failed to check trust score. Ensure the subgraph is deployed.");
    }
  }, []);

  /** Step 2: Approve USDC spending */
  const handleApproveUSDC = useCallback(() => {
    setStep("approving_usdc");
    const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals

    writeApprove({
      address: CONTRACT_ADDRESSES.USDC_SEPOLIA,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.AGENT_PAYMENT, amountInWei],
    });
  }, [amount, writeApprove]);

  /** Step 3: Execute the tip (direct or cross-chain) */
  const handleTip = useCallback(() => {
    setStep("tipping");
    const amountInWei = parseUnits(amount, 6);

    if (isCrossChain && solanaRecipient) {
      // Cross-chain via CCTP
      // Convert Solana address to bytes32 (pad to 32 bytes)
      const mintRecipientBytes = pad(toHex(Buffer.from(solanaRecipient)), {
        size: 32,
      });

      writeTip({
        address: CONTRACT_ADDRESSES.AGENT_PAYMENT,
        abi: AGENT_PAYMENT_ABI,
        functionName: "tipAgentCrossChain",
        args: [
          BigInt(agentId),
          amountInWei,
          CCTP_DOMAINS.SOLANA_DEVNET,
          mintRecipientBytes,
          parseUnits("0.01", 6), // maxFee: 0.01 USDC
          2000, // Standard finality
        ],
      });
    } else {
      // Direct Sepolia payment
      writeTip({
        address: CONTRACT_ADDRESSES.AGENT_PAYMENT,
        abi: AGENT_PAYMENT_ABI,
        functionName: "tipAgent",
        args: [BigInt(agentId), amountInWei, true],
      });
    }
  }, [agentId, amount, isCrossChain, solanaRecipient, writeTip]);

  /** Step 4: Poll CCTP attestation (for cross-chain only) */
  const handlePollAttestation = useCallback(async () => {
    if (!tipTxHash) return;
    setStep("polling_attestation");
    setAttestationStatus("Polling Circle attestation API...");

    try {
      // Poll the CCTP attestation API
      const url = `${CCTP_API.TESTNET}/v2/messages?transactionHash=${tipTxHash}`;
      let attempts = 0;
      const maxAttempts = 20;

      while (attempts < maxAttempts) {
        attempts++;
        setAttestationStatus(
          `Polling attestation (attempt ${attempts}/${maxAttempts})...`
        );

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data?.messages?.length > 0 && data.messages[0].attestation) {
            setAttestationStatus("Attestation received! USDC can be minted on Solana Devnet.");
            setStep("complete");
            return;
          }
        }

        // Wait 15 seconds between polls
        await new Promise((resolve) => setTimeout(resolve, 15000));
      }

      setAttestationStatus(
        "Attestation not yet available. It may take a few minutes. Check Circle API manually."
      );
      setStep("complete");
    } catch (err) {
      setAttestationStatus("Failed to poll attestation. Check the Circle API manually.");
      setStep("complete");
    }
  }, [tipTxHash]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Cross-Chain Demo
        </h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          Connect your wallet to try the cross-chain demo.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Cross-Chain Demo
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Evaluate an agent&apos;s trust score, then send a USDC tip. For cross-chain,
        USDC is burned on Sepolia via CCTP and minted on Solana Devnet.
      </p>

      {/* Step Indicator */}
      <div className="mt-8 flex items-center gap-2">
        <StepIndicator label="1. Trust Check" isActive={step === "checking"} isDone={isTrustPassed} />
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        <StepIndicator label="2. Approve USDC" isActive={step === "approving_usdc"} isDone={isApproveConfirmed} />
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        <StepIndicator label="3. Tip Agent" isActive={step === "tipping" || step === "confirming"} isDone={isTipConfirmed} />
        {isCrossChain && (
          <>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <StepIndicator label="4. CCTP" isActive={step === "polling_attestation"} isDone={step === "complete"} />
          </>
        )}
      </div>

      {/* Form */}
      <div className="mt-8 space-y-5">
        {/* Agent ID */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Agent ID
          </label>
          <input
            type="text"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="e.g., 0"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            USDC Amount
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Cross-Chain Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="crossChain"
            checked={isCrossChain}
            onChange={(e) => setIsCrossChain(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="crossChain" className="text-sm text-zinc-700 dark:text-zinc-300">
            Cross-chain via CCTP (Sepolia → Solana Devnet)
          </label>
        </div>

        {/* Solana Recipient */}
        {isCrossChain && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Solana Devnet Recipient Address
            </label>
            <input
              type="text"
              value={solanaRecipient}
              onChange={(e) => setSolanaRecipient(e.target.value)}
              placeholder="e.g., 7nYK9..."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-mono dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        )}

        {/* Trust Score Display */}
        {trustScore !== null && (
          <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Trust Score:
            </span>
            <TrustBadge score={trustScore} />
            <span className="text-sm text-zinc-500">
              {isTrustPassed
                ? `>= ${DEMO_TRUST_THRESHOLD} threshold - Payment approved`
                : `Below ${DEMO_TRUST_THRESHOLD} threshold - Payment blocked`}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Step 1: Check Trust */}
          {step === "idle" && (
            <button
              onClick={handleCheckTrust}
              disabled={!agentId}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              Check Trust Score
            </button>
          )}

          {/* Step 2: Approve USDC */}
          {step === "approved" && !isApproveConfirmed && (
            <button
              onClick={handleApproveUSDC}
              disabled={isApproving}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isApproving ? "Approving USDC..." : "Approve USDC Spending"}
            </button>
          )}

          {/* Step 3: Execute Tip */}
          {(step === "approved" && isApproveConfirmed) && (
            <button
              onClick={handleTip}
              disabled={isTipping || isConfirming}
              className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isTipping
                ? "Signing..."
                : isConfirming
                  ? "Confirming..."
                  : isCrossChain
                    ? `Tip ${amount} USDC via CCTP`
                    : `Tip ${amount} USDC (Direct)`}
            </button>
          )}

          {/* Step 4: Poll Attestation (Cross-Chain only) */}
          {isTipConfirmed && isCrossChain && step !== "complete" && step !== "polling_attestation" && (
            <button
              onClick={handlePollAttestation}
              className="w-full rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
            >
              Poll CCTP Attestation
            </button>
          )}
        </div>

        {/* Attestation Status */}
        {attestationStatus && (
          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950/30">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {attestationStatus}
            </p>
          </div>
        )}

        {/* Transaction Links */}
        {tipTxHash && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {isCrossChain ? "CCTP burn transaction submitted!" : "Tip sent successfully!"}
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${tipTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-xs text-emerald-600 underline dark:text-emerald-400"
            >
              View on Etherscan: {tipTxHash.slice(0, 16)}...
            </a>
          </div>
        )}

        {/* Error Messages */}
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
          </div>
        )}

        {tipError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <p className="text-sm text-red-700 dark:text-red-300">
              Transaction failed: {tipError.message.slice(0, 200)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Step indicator dot with label */
function StepIndicator({
  label,
  isActive,
  isDone,
}: {
  label: string;
  isActive: boolean;
  isDone: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-3 w-3 rounded-full ${
          isDone
            ? "bg-emerald-500"
            : isActive
              ? "bg-blue-500 animate-pulse"
              : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      />
      <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
