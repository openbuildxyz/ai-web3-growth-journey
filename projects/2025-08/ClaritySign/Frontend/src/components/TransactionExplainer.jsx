import React, { useState } from "react";
import TypingEffect from "./TypingEffect";
import { ethers } from "ethers";

const SkeletonLoader = () => (
  <div className="mt-8 space-y-4 animate-pulse">
    <div className="p-4 bg-cyber-surface rounded-lg">
      <div className="h-5 bg-cyber-blue/50 rounded w-1/3 mb-3"></div>
      <div className="h-4 bg-cyber-blue/50 rounded w-full"></div>
    </div>
    <div className="p-4 bg-cyber-red/20 border border-cyber-red/50 rounded-lg">
      <div className="h-5 bg-cyber-red/50 rounded w-1/4 mb-3"></div>
      <div className="h-4 bg-cyber-red/50 rounded w-full"></div>
    </div>
  </div>
);

function TransactionExplainer({ connectedAccount }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [explanation, setExplanation] = useState("");
  const [risk, setRisk] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExplain = async () => {
    // --- Start of Input Validation ---
    if (!connectedAccount) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!recipient || !amount) {
      setError("Please fill in both recipient and amount.");
      return;
    }

    // Check if the recipient address is a valid Ethereum address
    if (!ethers.isAddress(recipient)) {
      setError("Invalid recipient address. Please check and try again.");
      return;
    }

    // Check if the amount is a valid number
    try {
      ethers.parseEther(amount);
    } catch (e) {
      setError("Invalid amount. Please enter a valid number for ETH.");
      return;
    }
    // --- End of Input Validation ---

    setIsLoading(true);
    setExplanation("");
    setRisk("");
    setError("");

    const transaction = {
      from: connectedAccount,
      to: recipient,
      value: ethers.parseEther(amount).toString(),
    };

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction: JSON.stringify(transaction, null, 2),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setExplanation(data.explanation);
      setRisk(data.risk);
    } catch (error) {
      console.error("Failed to fetch explanation:", error);
      setError("Error: Could not retrieve the analysis.");
    }
    setIsLoading(false);
  };

  return (
    <div className="group relative bg-cyber-surface backdrop-blur-md p-8 rounded-lg shadow-2xl border border-cyber-cyan/20 transition-all duration-300 hover:border-cyber-cyan/50 hover:-translate-y-2 hover:shadow-glow-cyan">
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan rounded-tl-lg transition-opacity duration-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse-glow"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan rounded-tr-lg transition-opacity duration-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse-glow"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan rounded-bl-lg transition-opacity duration-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse-glow"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan rounded-br-lg transition-opacity duration-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse-glow"></div>

      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-cyber-cyan">
          Pre-Sign Analyzer
        </h2>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          className="w-full bg-cyber-bg/70 text-cyber-blue p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-cyan transition-all placeholder-cyber-blue/50"
          placeholder="Recipient Address (e.g., 0x...)"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={!connectedAccount}
        />
        <input
          type="text"
          className="w-full bg-cyber-bg/70 text-cyber-blue p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-cyan transition-all placeholder-cyber-blue/50"
          placeholder="Amount (in ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!connectedAccount}
        />
      </div>

      <button
        onClick={handleExplain}
        disabled={isLoading || !connectedAccount}
        className="mt-6 w-full flex items-center justify-center bg-cyber-cyan/80 hover:bg-cyber-cyan text-cyber-bg font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-cyber-surface disabled:text-cyber-blue/50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyber-bg"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          "Analyze Transaction"
        )}
      </button>

      {error && (
        <p className="mt-4 text-cyber-red text-center animate-fade-in-up">
          {error}
        </p>
      )}
      {isLoading && <SkeletonLoader />}
      {!isLoading && (explanation || risk) && (
        <div className="mt-8 space-y-4 animate-fade-in-up">
          {explanation && (
            <div className="p-4 bg-cyber-surface rounded-lg">
              <h3 className="font-semibold text-lg text-cyber-cyan">
                Summary:
              </h3>
              <TypingEffect text={explanation} />
            </div>
          )}
          {risk && (
            <div className="p-4 bg-cyber-red/20 border border-cyber-red/50 rounded-lg">
              <h3 className="font-bold text-lg text-cyber-red flex items-center">
                Risk Analysis:
              </h3>
              <TypingEffect text={risk} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TransactionExplainer;
