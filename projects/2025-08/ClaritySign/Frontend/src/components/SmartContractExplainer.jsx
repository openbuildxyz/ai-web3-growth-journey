import React, { useState } from "react";
import TypingEffect from "./TypingEffect";

const SkeletonLoader = () => (
  <div className="mt-8 p-6 bg-cyber-surface rounded-lg space-y-5 animate-pulse">
    <div className="space-y-3">
      <div className="h-5 bg-cyber-blue/50 rounded w-1/3"></div>
      <div className="h-4 bg-cyber-blue/50 rounded w-full"></div>
    </div>
    <div className="border-t border-cyber-blue/20 my-4"></div>
    <div className="space-y-3">
      <div className="h-5 bg-cyber-blue/50 rounded w-1/4"></div>
      <div className="h-4 bg-cyber-blue/50 rounded w-full"></div>
    </div>
    <div className="border-t border-cyber-blue/20 my-4"></div>
    <div className="p-4 bg-cyber-yellow/20 border border-cyber-yellow/50 rounded-lg">
      <div className="h-5 bg-cyber-yellow/50 rounded w-1/3 mb-3"></div>
      <div className="h-4 bg-cyber-yellow/50 rounded w-full"></div>
    </div>
  </div>
);

function SmartContractExplainer() {
  const [contractAddress, setContractAddress] = useState("");
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExplainContract = async () => {
    if (!contractAddress.trim()) {
      setError("Please paste a contract address before analyzing.");
      return;
    }
    setIsLoading(true);
    setSummary(null);
    setError("");
    try {
      const response = await fetch("/api/explainContract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress: contractAddress }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.rugPullRisks || "An unknown error occurred.");
      }
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch contract explanation:", err);
      setError(err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="group relative bg-cyber-surface backdrop-blur-md p-8 rounded-lg shadow-2xl border border-cyber-green/20 transition-all duration-300 hover:border-cyber-green/50 hover:-translate-y-2 hover:shadow-glow-green">
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-green rounded-tl-lg transition-opacity duration-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse-glow"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-green rounded-tr-lg transition-opacity duration-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse-glow"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-green rounded-bl-lg transition-opacity duration-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse-glow"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-green rounded-br-lg transition-opacity duration-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse-glow"></div>

      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-cyber-green">
          Smart Contract Analyzer
        </h2>
      </div>

      <input
        type="text"
        className="w-full bg-cyber-bg/70 text-cyber-blue p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-green transition-all placeholder-cyber-blue/50"
        placeholder="0x..."
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
      />

      <button
        onClick={handleExplainContract}
        disabled={isLoading}
        className="mt-6 w-full flex items-center justify-center bg-cyber-green/80 hover:bg-cyber-green text-cyber-bg font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
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
          "DECODE"
        )}
      </button>

      {error && (
        <p className="mt-4 text-cyber-red text-center animate-fade-in-up">
          {error}
        </p>
      )}
      {isLoading && <SkeletonLoader />}
      {summary && !isLoading && (
        <div className="mt-8 p-6 bg-cyber-surface rounded-lg space-y-5 animate-fade-in-up">
          <div>
            <h3 className="font-semibold text-lg text-cyber-green">
              Function Permissions:
            </h3>
            <TypingEffect text={summary.whoCanCall} />
          </div>
          <div className="border-t border-cyber-blue/20 my-4"></div>
          <div>
            <h3 className="font-semibold text-lg text-cyber-green">
              Admin Powers:
            </h3>
            <TypingEffect text={summary.adminPowers} />
          </div>
          <div className="border-t border-cyber-blue/20 my-4"></div>
          <div className="p-4 bg-cyber-yellow/20 border border-cyber-yellow/50 rounded-lg">
            <h3 className="font-bold text-lg text-cyber-yellow">
              Potential Risks:
            </h3>
            <TypingEffect text={summary.rugPullRisks} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartContractExplainer;
