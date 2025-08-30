import React, { useState } from "react";
import Header from "./components/Header";
import TransactionExplainer from "./components/TransactionExplainer";
import SmartContractExplainer from "./components/SmartContractExplainer";

function App() {
  const [account, setAccount] = useState(null);

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-blue font-mono antialiased overflow-hidden">
      <div className="relative min-h-screen">
        {/* Background Grid */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(100, 255, 218, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 255, 218, 0.05) 1px, transparent 1px)",
            backgroundSize: "2rem 2rem",
          }}
        ></div>

        {/* Scan Line Effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-cyber-cyan/10 animate-scan-line z-0"></div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header account={account} setAccount={setAccount} />
          <main className="container mx-auto px-6 py-12 flex-grow">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-cyber-cyan animate-flicker">
                ClaritySign AI
              </h1>
              <p className="mt-4 text-lg text-cyber-blue">
                Demystify blockchain interactions with AI-powered insights.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <TransactionExplainer connectedAccount={account} />
              <SmartContractExplainer />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;