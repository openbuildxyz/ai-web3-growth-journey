"use client";

import React from "react";
import Link from "next/link"; // Import Link

const AgentsPage = () => {
  // Mock data for agents - replace with actual data fetching later
  // Mock data reflecting README examples - Added lastModified
  const agents = [
    {
      id: "1",
      name: "跟王小二赚钱",
      status: "Running",
      description: "跟单王小二Kol钱包自动交易Meme",
      lastModified: Date.now() - 86400000,
    },
    {
      id: "2",
      name: "KOL Tweet Trader (DegenMode)",
      status: "Running",
      description: "Monitors @CryptoKOL tweets...",
      lastModified: Date.now() - 172800000,
    },
    {
      id: "3",
      name: "BTC Price Dip Buyer",
      status: "Stopped",
      description: "Triggers when BTC price drops 5%...",
      lastModified: Date.now(),
    },
    {
      id: "4",
      name: "New CA Sniper (BNB Chain)",
      status: "Running",
      description: "Monitors new contract deployments...",
      lastModified: Date.now() - 3600000,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Agents</h1>
        <button className="btn btn-primary">Create New Agent</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(
          (
            agent // Ensure this opening parenthesis is here
          ) => (
            // Card is now a div, not a Link
            <div key={agent.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {/* Tooltip for name */}
                <div className="tooltip w-full" data-tip={agent.name}>
                  <h2 className="card-title flex items-start gap-2 min-h-12">
                    <span className="line-clamp-2 flex-grow">{agent.name}</span>
                    {/* Status badge */}
                    <span
                      className={`badge badge-sm ${
                        agent.status === "Running"
                          ? "badge-success"
                          : agent.status === "Stopped"
                          ? "badge-ghost"
                          : agent.status === "Error"
                          ? "badge-error"
                          : "badge-neutral"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </h2>
                </div>
                {/* Description */}
                <p className="text-sm text-base-content/70 mb-2 line-clamp-2">
                  {agent.description}
                </p>
                {/* Last Modified */}
                <div className="text-xs text-base-content/50 mt-2 pt-2 border-t border-base-300/50">
                  Last Modified: {new Date(agent.lastModified).toLocaleString()}
                </div>
                {/* Card Actions */}
                <div className="card-actions justify-end mt-4">
                  {/* Details Button (now wrapped in Link) */}
                  <Link href={`/agents/${agent.id}`} passHref>
                    <button className="btn btn-sm btn-outline">Details</button>
                  </Link>
                  {/* Edit Button (Mock Action) */}
                  <button
                    className="btn btn-sm btn-outline btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click if it were ever made clickable
                      alert(
                        `Mock Edit action for Agent: ${agent.name} (ID: ${agent.id})`
                      );
                      console.log(
                        `Mock Edit action for Agent: ${agent.name} (ID: ${agent.id})`
                      );
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )
        )}{" "}
        {/* Ensure this closing parenthesis is here */}
      </div>
    </div>
  );
};

export default AgentsPage;
