import React, { useState } from "react";
import { ethers } from "ethers";

function WalletConnector({ account, setAccount }) {
  const [error, setError] = useState("");

  const connectWallet = async () => {
    setError("");
    if (typeof window.ethereum === "undefined") {
      setError(
        "MetaMask is not installed. Please install the extension and refresh the page."
      );
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  return (
    <div>
      {account ? (
        <div className="bg-cyber-surface border border-cyber-cyan/50 px-4 py-2 rounded-lg text-cyber-cyan">
          {`${account.substring(0, 6)}...${account.substring(
            account.length - 4
          )}`}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-cyber-surface hover:bg-cyber-cyan/20 border border-cyber-cyan/50 px-4 py-2 rounded-lg font-bold transition-all duration-300"
        >
          Connect Wallet
        </button>
      )}
      {error && <p className="text-cyber-red text-xs mt-2">{error}</p>}
    </div>
  );
}

export default WalletConnector;
