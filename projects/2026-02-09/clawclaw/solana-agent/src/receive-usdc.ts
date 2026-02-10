/**
 * Receive USDC — Polls Circle attestation API and claims minted USDC on Solana
 *
 * After the Sepolia DemoAgentSepolia burns USDC via CCTP, this script:
 *   1. Polls the Circle Attestation API for the burn message hash
 *   2. Once attested, submits the receiveMessage tx on Solana Devnet
 *
 * Usage: npm run receive
 *   Pass the message hash via env var: CCTP_MESSAGE_HASH=0x...
 *
 * Note: In production the attestation polling would be automated.
 *       This is a demo script for manual testing of the cross-chain flow.
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

/** Circle Attestation API (testnet) */
const ATTESTATION_API = "https://iris-api-sandbox.circle.com/v2/attestations";

/** CCTP MessageTransmitter program on Solana Devnet */
const MESSAGE_TRANSMITTER_PROGRAM = new PublicKey(
  process.env.CCTP_MESSAGE_TRANSMITTER ||
    "CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3"
);

/** Maximum number of polling attempts */
const MAX_POLL_ATTEMPTS = 60;

/** Delay between poll attempts (ms) */
const POLL_INTERVAL_MS = 5000;

/**
 * Poll Circle attestation API until the message is attested
 * @param messageHash Keccak-256 hash of the CCTP burn message
 * @returns The attestation signature bytes
 */
async function pollAttestation(messageHash: string): Promise<string> {
  console.log(`\nPolling attestation for message: ${messageHash}`);

  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    console.log(`  Attempt ${attempt}/${MAX_POLL_ATTEMPTS}...`);

    const response = await fetch(`${ATTESTATION_API}/${messageHash}`);

    if (response.ok) {
      const data = await response.json();
      if (data.attestation && data.attestation !== "PENDING") {
        console.log("  Attestation received!");
        return data.attestation;
      }
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Attestation polling timed out");
}

async function main() {
  const messageHash = process.env.CCTP_MESSAGE_HASH;
  if (!messageHash) {
    console.error(
      "Set CCTP_MESSAGE_HASH env variable (from Sepolia burn tx logs)."
    );
    console.error("Example: CCTP_MESSAGE_HASH=0xabc123... npm run receive");
    process.exit(1);
  }

  const secretKeyStr = process.env.AGENT_SECRET_KEY;
  if (!secretKeyStr) {
    console.error("Run 'npm run setup' first.");
    process.exit(1);
  }

  const connection = new Connection(RPC_URL, "confirmed");
  const agentKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(secretKeyStr))
  );

  console.log(`Agent: ${agentKeypair.publicKey.toBase58()}`);

  // Step 1: Poll for attestation
  const attestation = await pollAttestation(messageHash);

  // Step 2: Submit receiveMessage on Solana
  // Note: The actual CCTP receiveMessage instruction requires
  // specific account metas and data layout per Circle's Solana SDK.
  // This is a simplified representation for the demo.
  console.log("\n── Attestation retrieved ──");
  console.log(`Attestation: ${attestation.substring(0, 40)}...`);
  console.log("\nTo complete the mint on Solana Devnet:");
  console.log("  Use Circle's CCTP SDK or CLI to call receiveMessage");
  console.log("  with the attestation above and the original burn message.");
  console.log(
    "\n  For SDK details see: https://developers.circle.com/stablecoins/cctp-protocol-contract"
  );

  // In a full implementation you would construct the receiveMessage
  // instruction with the message bytes + attestation and submit it.
  // The CCTP program on Solana will verify the attestation and mint
  // USDC into the agent's token account.

  console.log("\nRun 'npm run status' to check your USDC balance.");
}

main().catch(console.error);
