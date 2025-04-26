import React from 'react';
import Link from 'next/link'; // Import Link

const StorePage = () => {
  // Mock data - replace later
  // Mock data reflecting README examples - Added creator
  const publicAgents = [
    { id: 'pa1', name: 'Simple ETH/USDC Arbitrage (Uniswap/Sushiswap)', description: 'Basic hourly arbitrage agent template using Price Feed & DEX Swap MCPs.', creator: '0xAuto Team' },
    { id: 'pa2', name: 'Top 10 KOL Follower Template', description: 'Follows a curated list of KOLs via Social Feed MCP and executes trades via DEX Swap MCP.', creator: 'CommunityDev' },
    { id: 'pa3', name: 'NFT Floor Price Sweeper', description: 'Monitors floor price of a specified NFT collection via NFT Market MCP and buys listings below threshold.', creator: 'NFTMaster' },
  ];

  const mcpServices = [
    { id: 'mcp-dex', name: 'DEX Swap MCP', description: 'Executes token swaps on decentralized exchanges (e.g., Uniswap, Sushiswap).', creator: '0xAuto Team' },
    { id: 'mcp-price', name: 'Price Feed MCP', description: 'Provides real-time or historical price data for various assets.', creator: '0xAuto Team' },
    { id: 'mcp-social', name: 'Social Feed MCP', description: 'Monitors social media platforms (Twitter, Telegram) for keywords or specific users.', creator: 'CommunityDev' },
    { id: 'mcp-chain', name: 'Chain Event MCP', description: 'Listens for specific on-chain events like contract deployments or wallet transactions.', creator: '0xAuto Team' },
    { id: 'mcp-cex', name: 'CEX Trade MCP', description: 'Executes trades on centralized exchanges (requires API keys).', creator: 'ProUser123' },
    { id: 'mcp-nft', name: 'NFT Market MCP', description: 'Interacts with NFT marketplaces for listings, bids, and purchases.', creator: 'NFTMaster' },
    { id: 'mcp-playwright', name: 'Playwright MCP', description: 'Enables browser automation tasks (useful for web interactions).', creator: '0xAuto Team' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Store</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Public Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicAgents.map((agent) => (
            <Link key={agent.id} href={`/store/${agent.id}`} className="card bg-base-100 shadow-xl hover:bg-base-200 transition-colors duration-200 cursor-pointer block"> {/* Wrap card in Link, add hover effect */}
              <div className="card-body">
                <div className="tooltip w-full" data-tip={agent.name}>
                  {/* Added min-h-12 */}
                  <h3 className="card-title text-lg line-clamp-2 min-h-12">{agent.name}</h3>
                </div>
                <p className="text-sm text-base-content/70 mb-2 flex-grow line-clamp-2">{agent.description}</p> {/* Added line-clamp-2 */}
                <div className="text-xs text-base-content/50 mt-auto pt-2 border-t border-base-300/50"> {/* Added creator */}
                   Creator: {agent.creator}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Available MCP Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mcpServices.map((mcp) => (
            <Link key={mcp.id} href={`/store/${mcp.id}`} className="card bg-base-100 shadow-xl hover:bg-base-200 transition-colors duration-200 cursor-pointer block"> {/* Wrap card in Link, add hover effect */}
              <div className="card-body">
                <div className="tooltip w-full" data-tip={mcp.name}>
                   {/* Added min-h-12 */}
                  <h3 className="card-title text-lg line-clamp-2 min-h-12">{mcp.name}</h3>
                </div>
                <p className="text-sm text-base-content/70 mb-2 flex-grow line-clamp-2">{mcp.description}</p> {/* Added line-clamp-2 */}
                <div className="text-xs text-base-content/50 mt-auto pt-2 border-t border-base-300/50"> {/* Added creator */}
                   Creator: {mcp.creator}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StorePage;