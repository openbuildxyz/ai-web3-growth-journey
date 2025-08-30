// File: /app/api/portfolio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { JsonRpcProvider, Contract, formatUnits } from "ethers";

// Define ERC-20 token addresses on BNB Testnet
const TOKENS = [
  {
    symbol: "TWT",
    address: "0x4B0F1812e5Df2A09796481Ff14017e6005508003", // TWT (mainnet)
    decimals: 18
  },
  {
    symbol: "XVS",
    address: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63", // XVS (mainnet)
    decimals: 18
  },
  {
    symbol: "CAKE",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", // CAKE (mainnet address)
    decimals: 18
  },
];

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Price service base URL (Flask). Configure via env var AI_MODEL_URL, defaults to local.
const PRICE_API_BASE = "https://lstm-backend-production-d690.up.railway.app";

async function fetchPrice(symbol: string): Promise<number | null> {
  try {
    const requestBody = { symbol };
    console.log(`Sending to Flask /price:`, JSON.stringify(requestBody, null, 2));
    
    const res = await fetch(`${PRICE_API_BASE}/price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      // In prod behind HTTPS/self-signed, you may need to proxy instead
    });
    if (!res.ok) {
      console.error(`Price API returned ${res.status} for ${symbol}`);
      return null;
    }
    const data = await res.json();
    const price = typeof data.price === "string" ? parseFloat(data.price) : data.price;
    if (Number.isFinite(price)) return price as number;
    return null;
  } catch (err) {
    console.error(`Failed to fetch price for ${symbol}:`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
    }

    const provider = new JsonRpcProvider("https://bsc-dataseed.binance.org/");

    const tokenBalances: Record<string, string> = {};

    for (const token of TOKENS) {
      try {
        const contract = new Contract(token.address, erc20Abi, provider);
        const balance = await contract.balanceOf(walletAddress);
        tokenBalances[token.symbol] = formatUnits(balance, token.decimals);
      } catch (error) {
        console.error(`Error fetching ${token.symbol} balance:`, error);
        tokenBalances[token.symbol] = "0";
      }
    }

    // Fetch live prices for TWT, XVS, CAKE from Flask service
    const symbolsToFetch = TOKENS.map(t => t.symbol); // ["TWT", "XVS", "CAKE"]
    const priceEntries = await Promise.all(
      symbolsToFetch.map(async (sym) => {
        const p = await fetchPrice(sym);
        console.log(sym,p);
        return [sym, p] as const;
      })
    );
    const tokenPrices: Record<string, number> = {};
    for (const [sym, p] of priceEntries) {
      if (p !== null) tokenPrices[sym] = p;
    }

    const tokenValues: Record<string, number> = {};
    let totalValue = 0;

    for (const [symbol, balance] of Object.entries(tokenBalances)) {
      if (symbol in tokenPrices) {
        const value = parseFloat(balance) * tokenPrices[symbol];
        tokenValues[symbol] = value;
        totalValue += value;
        console.log(`${symbol}: ${Number(balance).toFixed(5)} * $${tokenPrices[symbol]} = $${value.toFixed(6)}`);

      }
    }
    

    // Calculate allocation percentages with higher precision
    const allocation = Object.entries(tokenValues).map(([symbol, value]) => {
      const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
      return {
        symbol,
        value: parseFloat(Number(tokenBalances[symbol]).toFixed(5)),  // 🔁 Changed to 5 decimals
        percentage: parseFloat(percentage.toFixed(6)),
        usdValue: parseFloat(value.toFixed(6))
      };
    });
    

    return NextResponse.json({
      address: walletAddress,
      balances: tokenBalances,
      allocation,
      totalValue: parseFloat(totalValue.toFixed(6))
    });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}
