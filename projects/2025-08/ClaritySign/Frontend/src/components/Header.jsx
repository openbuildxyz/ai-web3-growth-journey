import React from "react";
import { Github } from "lucide-react";
import WalletConnector from "./WalletConnector";

function Header({ account, setAccount }) {
  return (
    <header className="bg-cyber-bg/50 backdrop-blur-sm border-b border-cyber-cyan/20 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyber-cyan">ClaritySign AI</h1>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/akshatchauhan7/claritysign"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyber-blue hover:text-cyber-cyan transition-colors"
          >
            <Github size={24} />
          </a>
          <WalletConnector account={account} setAccount={setAccount} />
        </div>
      </div>
    </header>
  );
}

export default Header;
