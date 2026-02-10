/**
 * Setup Script — Configures the Solana Demo Agent
 *
 * Supports two modes:
 *   A. Use your own wallet: set AGENT_PUBLIC_KEY env var (read-only, no secret key needed)
 *   B. Generate a new keypair: leave AGENT_PUBLIC_KEY empty
 *
 * This script:
 *   1. Resolves the agent wallet (your address or a new keypair)
 *   2. Derives the USDC Associated Token Account address
 *   3. Computes the CCTP mintRecipient (bytes32) for Sepolia
 *   4. Optionally airdrops SOL and creates the ATA on-chain
 *
 * Run: npm run setup
 */

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load .env.local first (user overrides), then .env as fallback
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

/** Solana Devnet USDC mint (Circle official) */
const USDC_MINT = new PublicKey(
  process.env.USDC_MINT || "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

/** Solana Devnet RPC */
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

/**
 * Convert a Solana PublicKey to a 32-byte hex string for CCTP mintRecipient
 */
function toBytes32Hex(pubkey: PublicKey): string {
  return "0x" + Buffer.from(pubkey.toBytes()).toString("hex");
}

async function main() {
  const connection = new Connection(RPC_URL, "confirmed");

  // ── Step 1: Resolve agent wallet ───────────────────────
  // Priority: AGENT_PUBLIC_KEY env > AGENT_SECRET_KEY env > generate new
  let agentPublicKey: PublicKey;
  let agentKeypair: Keypair | null = null;

  if (process.env.AGENT_PUBLIC_KEY) {
    // Use an existing wallet (read-only mode, no secret key required)
    agentPublicKey = new PublicKey(process.env.AGENT_PUBLIC_KEY);
    console.log("Using provided wallet address (read-only mode)");
  } else if (process.env.AGENT_SECRET_KEY) {
    // Load full keypair from secret key
    const secretKey = Uint8Array.from(
      JSON.parse(process.env.AGENT_SECRET_KEY)
    );
    agentKeypair = Keypair.fromSecretKey(secretKey);
    agentPublicKey = agentKeypair.publicKey;
    console.log("Loaded existing agent keypair");
  } else {
    // Generate a brand-new keypair
    agentKeypair = Keypair.generate();
    agentPublicKey = agentKeypair.publicKey;
    console.log("Generated new agent keypair");
  }

  console.log(`\nAgent Public Key: ${agentPublicKey.toBase58()}`);

  // ── Step 2: Check SOL balance ──────────────────────────
  const solBalance = await connection.getBalance(agentPublicKey);
  console.log(`SOL Balance: ${solBalance / LAMPORTS_PER_SOL} SOL`);

  // Only attempt airdrop if we have a keypair (not read-only mode)
  // and balance is low
  if (agentKeypair && solBalance < 0.01 * LAMPORTS_PER_SOL) {
    console.log("\nRequesting SOL airdrop for transaction fees...");
    const MAX_AIRDROP_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_AIRDROP_RETRIES; attempt++) {
      try {
        const airdropSig = await connection.requestAirdrop(
          agentPublicKey,
          1 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(airdropSig, "confirmed");
        console.log("Airdrop successful: 1 SOL");
        break;
      } catch {
        console.warn(`Airdrop attempt ${attempt}/${MAX_AIRDROP_RETRIES} failed.`);
        if (attempt < MAX_AIRDROP_RETRIES) {
          const delay = attempt * 3000;
          console.log(`Retrying in ${delay / 1000}s...`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
  }

  // ── Step 3: Derive USDC ATA address ────────────────────
  const ataAddress = await getAssociatedTokenAddress(USDC_MINT, agentPublicKey);
  let isAtaCreated = false;

  // Try to create ATA on-chain only if we have a signing keypair
  const updatedBalance = await connection.getBalance(agentPublicKey);
  if (agentKeypair && updatedBalance > 0) {
    console.log("\nCreating USDC Associated Token Account on-chain...");
    try {
      await getOrCreateAssociatedTokenAccount(
        connection,
        agentKeypair,
        USDC_MINT,
        agentPublicKey
      );
      isAtaCreated = true;
      console.log("ATA created on-chain successfully.");
    } catch (err) {
      console.warn("Failed to create ATA on-chain:", (err as Error).message);
    }
  } else {
    console.log("\nATA address derived (deterministic). Create on-chain when ready.");
  }

  // ── Step 4: Compute CCTP mintRecipient (bytes32) ───────
  const mintRecipientBytes32 = toBytes32Hex(ataAddress);

  console.log("\n════════════════════════════════════════════");
  console.log("  SOLANA DEMO AGENT — SETUP COMPLETE");
  console.log("════════════════════════════════════════════");
  console.log(`  Agent Wallet:        ${agentPublicKey.toBase58()}`);
  console.log(`  USDC Token Account:  ${ataAddress.toBase58()}`);
  console.log(`  ATA on-chain:        ${isAtaCreated ? "YES" : "NO (create later)"}`);
  console.log(`  CCTP mintRecipient:  ${mintRecipientBytes32}`);
  console.log("════════════════════════════════════════════\n");

  // ── Step 5: Save config to .env ────────────────────────
  const secretKeyLine = agentKeypair
    ? `AGENT_SECRET_KEY=${JSON.stringify(Array.from(agentKeypair.secretKey))}`
    : "# No secret key (using external wallet)";

  const envContent = `# Generated by setup-agent.ts
SOLANA_RPC_URL=${RPC_URL}
AGENT_PUBLIC_KEY=${agentPublicKey.toBase58()}
${secretKeyLine}
USDC_MINT=${USDC_MINT.toBase58()}
USDC_TOKEN_ACCOUNT=${ataAddress.toBase58()}
CCTP_MINT_RECIPIENT=${mintRecipientBytes32}
`;

  fs.writeFileSync(".env", envContent);
  console.log("Saved agent config to .env");

  console.log("\n── NEXT STEPS ──────────────────────────────");
  console.log("1. Copy the CCTP mintRecipient above");
  console.log("2. On Sepolia, call DemoAgentSepolia.setSolanaRecipient(mintRecipient)");
  console.log("3. Fund DemoAgentSepolia with USDC");
  console.log("4. Call DemoAgentSepolia.sendToSolanaAgent(amount, 5, maxFee)");
  console.log("5. Run: npm run receive   (to poll attestation & claim USDC)");
}

main().catch(console.error);
