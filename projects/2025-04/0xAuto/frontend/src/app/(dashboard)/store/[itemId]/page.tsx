'use client'; // Needed for params

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Mock function to get store item data by ID - replace with actual data fetching
const getMockStoreItemData = (itemId: string | string[] | undefined) => {
  if (!itemId || Array.isArray(itemId)) return null;

  const mockPublicAgents = [
    { id: 'pa1', type: 'Agent Template', name: 'Simple ETH/USDC Arbitrage (Uniswap/Sushiswap)', description: 'Basic hourly arbitrage agent template using Price Feed & DEX Swap MCPs.', details: 'Checks prices every hour. Executes swap if profit > 0.01 ETH (configurable). Requires Price Feed MCP and DEX Swap MCP configured.', author: 'Community', tags: ['Arbitrage', 'DeFi', 'Hourly'] },
    { id: 'pa2', type: 'Agent Template', name: 'Top 10 KOL Follower Template', description: 'Follows a curated list of KOLs via Social Feed MCP and executes trades via DEX Swap MCP.', details: 'Monitors tweets from predefined KOL list. Buys tokens mentioned with positive sentiment (configurable). Requires Social Feed MCP and DEX Swap MCP.', author: '0xAuto Team', tags: ['Trading', 'Social', 'KOL'] },
    { id: 'pa3', type: 'Agent Template', name: 'NFT Floor Price Sweeper', description: 'Monitors floor price of a specified NFT collection via NFT Market MCP and buys listings below threshold.', details: 'Checks floor price every 5 minutes. Buys listed NFTs below the set threshold. Requires NFT Market MCP.', author: 'Community', tags: ['NFT', 'Utility'] },
  ];

  const mockMcpServices = [
    { id: 'mcp-dex', type: 'MCP Service', name: 'DEX Swap MCP', description: 'Executes token swaps on decentralized exchanges (e.g., Uniswap, Sushiswap).', details: 'Supports multiple DEXs. Requires wallet connection with sufficient funds and approvals.', author: '0xAuto Core', tags: ['DeFi', 'Trading', 'Core'] },
    { id: 'mcp-price', type: 'MCP Service', name: 'Price Feed MCP', description: 'Provides real-time or historical price data for various assets.', details: 'Supports various price oracles and APIs. Free tier available with rate limits.', author: '0xAuto Core', tags: ['Data', 'Core'] },
    { id: 'mcp-social', type: 'MCP Service', name: 'Social Feed MCP', description: 'Monitors social media platforms (Twitter, Telegram) for keywords or specific users.', details: 'Requires API keys for some platforms. Supports sentiment analysis (optional).', author: '0xAuto Core', tags: ['Data', 'Social'] },
    { id: 'mcp-chain', type: 'MCP Service', name: 'Chain Event MCP', description: 'Listens for specific on-chain events like contract deployments or wallet transactions.', details: 'Supports multiple EVM chains. Configurable event filters.', author: '0xAuto Core', tags: ['On-Chain', 'Core'] },
    { id: 'mcp-cex', type: 'MCP Service', name: 'CEX Trade MCP', description: 'Executes trades on centralized exchanges (requires API keys).', details: 'Supports Binance, KuCoin, etc. Requires user-provided API keys stored securely.', author: '0xAuto Core', tags: ['Trading', 'CEX'] },
    { id: 'mcp-nft', type: 'MCP Service', name: 'NFT Market MCP', description: 'Interacts with NFT marketplaces for listings, bids, and purchases.', details: 'Supports OpenSea, Blur. Requires wallet connection.', author: '0xAuto Core', tags: ['NFT', 'Trading'] },
    { id: 'mcp-playwright', type: 'MCP Service', name: 'Playwright MCP', description: 'Enables browser automation tasks (useful for web interactions).', details: 'Runs Playwright scripts in a sandboxed environment. Useful for interacting with sites lacking APIs.', author: 'Community', tags: ['Utility', 'Web'] },
  ];

  const allItems = [...mockPublicAgents, ...mockMcpServices];
  return allItems.find(item => item.id === itemId);
};


const StoreItemDetailPage = () => {
  const params = useParams();
  const itemId = params?.itemId;
  const item = getMockStoreItemData(itemId);

  if (!item) {
    return <div className="text-center text-error font-pixel p-10">Item not found!</div>;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
            <div>
                <div className="badge badge-accent badge-outline mb-2">{item.type}</div>
                <h1 className="text-3xl mb-1">{item.name}</h1>
                <p className="text-sm text-base-content/70">by {item.author}</p>
            </div>
            {item.type === 'Agent Template' && (
                 <button className="btn btn-primary">Add to My Agents</button>
            )}
             {item.type === 'MCP Service' && (
                 <button className="btn btn-secondary">Configure Service</button> // Or just view details
            )}
        </div>
         <div className="mt-3 flex gap-2 flex-wrap">
            {item.tags?.map(tag => (
                <div key={tag} className="badge badge-neutral">{tag}</div>
            ))}
        </div>
      </div>

      {/* Details Section */}
      <div className="card bg-base-100 shadow-xl">
         <div className="card-body">
            <h2 className="card-title font-pixel mb-2">Description</h2>
            <p className="mb-4">{item.description}</p>
            <h2 className="card-title font-pixel mb-2">Details</h2>
            <p className="whitespace-pre-wrap font-mono text-sm">{item.details}</p>
            {/* Add more sections like Usage Examples, Reviews etc. later */}
         </div>
      </div>

       <div className="mt-8">
            <Link href="/store" className="btn btn-outline">&lt; Back to Store</Link>
       </div>

    </div>
  );
};

export default StoreItemDetailPage;