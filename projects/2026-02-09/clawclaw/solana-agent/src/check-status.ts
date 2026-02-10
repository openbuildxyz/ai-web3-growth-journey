/**
 * Status Check — Shows the Solana agent's current balances
 *
 * Run: npm run status
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

async function main() {
  const connection = new Connection(RPC_URL, "confirmed");

  const agentPubkey = process.env.AGENT_PUBLIC_KEY;
  const usdcTokenAccount = process.env.USDC_TOKEN_ACCOUNT;

  if (!agentPubkey || !usdcTokenAccount) {
    console.error("Run 'npm run setup' first to generate agent config.");
    process.exit(1);
  }

  const agentKey = new PublicKey(agentPubkey);
  const ataKey = new PublicKey(usdcTokenAccount);

  // SOL balance
  const solBalance = await connection.getBalance(agentKey);
  console.log(`\nAgent:  ${agentPubkey}`);
  console.log(`SOL:    ${solBalance / LAMPORTS_PER_SOL}`);

  // USDC balance
  try {
    const tokenInfo = await getAccount(connection, ataKey);
    // USDC has 6 decimals
    const usdcBalance = Number(tokenInfo.amount) / 1e6;
    console.log(`USDC:   ${usdcBalance}`);
  } catch {
    console.log("USDC:   0 (token account not yet initialized or empty)");
  }

  // CCTP mint recipient
  const mintRecipient = process.env.CCTP_MINT_RECIPIENT;
  if (mintRecipient) {
    console.log(`\nCCTP mintRecipient (bytes32): ${mintRecipient}`);
  }
}

main().catch(console.error);
