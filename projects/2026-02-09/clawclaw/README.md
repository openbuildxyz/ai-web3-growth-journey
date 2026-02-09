# AgentBridge

Trust and payment bridge for autonomous on-chain AI agents. Agents discover each other, evaluate trustworthiness, and transact across blockchains using a portable on-chain identity.

## Architecture

```
Ethereum Sepolia                    The Graph                 Solana Devnet
+-----------------------+     +-------------------+     +------------------+
| IdentityRegistry      |---->| Agent Indexer     |     | CCTP Mint        |
| (ERC-721 + ERC-8004)  |     | Trust Score Query |     | (USDC Recipient) |
+-----------------------+     +-------------------+     +------------------+
| ReputationRegistry    |---->|                   |
| (Feedback + Scoring)  |     +-------------------+
+-----------------------+
| AgentPayment          |----> CCTP TokenMessengerV2 ----> Solana Devnet
| (x402 USDC + CCTP)   |
+-----------------------+

Frontend (Next.js)
+-------+----------+-----------+------+
| Home  | Register | Agents    | Demo |
+-------+----------+-----------+------+
```

## Tech Stack

| Layer       | Technology                                           |
| ----------- | ---------------------------------------------------- |
| Contracts   | Solidity 0.8.28, Foundry, OpenZeppelin               |
| Identity    | ERC-8004-style ERC-721 with URIStorage               |
| Reputation  | On-chain feedback registry, subgraph trust scoring   |
| Payments    | x402-style USDC, Circle CCTP cross-chain burns       |
| Subgraph    | The Graph (AssemblyScript mappings)                   |
| Frontend    | Next.js 16, React 19, Tailwind CSS 4, TypeScript     |
| Web3        | wagmi v3, viem, Apollo Client v4                     |
| Cross-chain | Circle CCTP V2 (Sepolia to Solana Devnet)            |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (forge, cast)
- A wallet with Sepolia ETH (for deploying contracts)
- [The Graph CLI](https://thegraph.com/docs/en/developing/creating-a-subgraph/) (optional, for subgraph deployment)

## Project Structure

```
clawclaw/
├── contracts/                  # Foundry smart contracts
│   ├── src/
│   │   ├── IdentityRegistry.sol    # ERC-8004 agent identity (ERC-721)
│   │   ├── ReputationRegistry.sol  # On-chain feedback & reputation
│   │   └── AgentPayment.sol        # USDC tips + CCTP cross-chain burns
│   ├── script/
│   │   └── Deploy.s.sol            # Deployment script for Sepolia
│   └── foundry.toml
├── subgraph/                   # The Graph subgraph
│   ├── schema.graphql              # Agent, Feedback, Payment entities
│   ├── subgraph.yaml               # Manifest (update addresses after deploy)
│   └── src/
│       ├── identity-registry.ts    # Identity event handlers
│       ├── reputation-registry.ts  # Feedback handlers + trust scoring
│       └── agent-payment.ts        # Payment event handlers
├── clawclaw-ui/                # Next.js frontend
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── register/page.tsx       # Agent registration (mint NFT)
│   │   ├── agents/page.tsx         # Agent directory + search
│   │   ├── agents/[id]/page.tsx    # Agent detail + feedback form
│   │   └── demo/page.tsx           # Cross-chain CCTP demo
│   ├── components/
│   │   ├── wallet/                 # Providers, ConnectButton
│   │   └── agent/                  # AgentCard, TrustBadge
│   └── lib/
│       ├── chains.ts               # Wagmi config, CCTP domains
│       ├── contracts.ts            # ABIs + deployed addresses
│       └── subgraph.ts             # Apollo Client + GraphQL queries
└── README.md
```

## Setup

### 1. Smart Contracts

```bash
cd contracts

# Install dependencies
forge install

# Build
forge build

# Run tests
forge test
```

### 2. Deploy to Sepolia

Create a `.env` file in `contracts/`:

```env
PRIVATE_KEY=your_deployer_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

Deploy:

```bash
source .env

forge script script/Deploy.s.sol:Deploy \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

After deployment, note the logged contract addresses and update them in:
- `clawclaw-ui/lib/contracts.ts` (the `CONTRACT_ADDRESSES` object)
- `subgraph/subgraph.yaml` (replace `{{...}}` placeholders)

### 3. Subgraph (Optional)

```bash
cd subgraph

# Install dependencies
npm install

# Copy ABIs from compiled contracts
cp ../contracts/out/IdentityRegistry.sol/IdentityRegistry.json abis/
cp ../contracts/out/ReputationRegistry.sol/ReputationRegistry.json abis/
cp ../contracts/out/AgentPayment.sol/AgentPayment.json abis/

# Update subgraph.yaml with deployed addresses and start blocks

# Generate types
npx graph codegen

# Build
npx graph build

# Deploy to Subgraph Studio
npx graph deploy --studio agentbridge-subgraph
```

After deploying the subgraph, update the endpoint in `clawclaw-ui/lib/subgraph.ts` or set the `NEXT_PUBLIC_SUBGRAPH_URL` environment variable.

### 4. Frontend

```bash
cd clawclaw-ui

# Install dependencies
npm install

# Create .env.local (optional)
echo 'NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_ID/agentbridge/version/latest' > .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Addresses (Sepolia Testnet)

| Contract / Service         | Address                                      |
| -------------------------- | -------------------------------------------- |
| CCTP TokenMessengerV2      | `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` |
| CCTP Attestation API       | `https://iris-api-sandbox.circle.com`         |
| USDC (Sepolia)             | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |

## How It Works

1. **Register** -- An agent owner connects their wallet and mints an ERC-721 identity NFT containing an ERC-8004 registration file (name, description, services, Solana address).

2. **Build Trust** -- Other agents and clients call `giveFeedback()` on the ReputationRegistry. Feedback values (0-100) are stored on-chain and indexed by the subgraph into a trust score.

3. **Trust-Gated Access** -- Before interacting, an agent queries the counterparty's trust score via the subgraph. If the score is below the threshold (default 70), the interaction is blocked.

4. **Payment** -- Once trust is verified, the agent sends USDC via the AgentPayment contract:
   - **Direct**: `tipAgent()` transfers USDC on Sepolia to the agent's wallet
   - **Cross-chain (CCTP)**: `tipAgentCrossChain()` burns USDC on Sepolia via Circle's TokenMessengerV2. The frontend polls the Circle attestation API, and the USDC is minted on Solana Devnet.

## CCTP Cross-Chain Flow

```
Sepolia                          Circle API                    Solana Devnet
  |                                  |                              |
  |-- depositForBurn (USDC) -------->|                              |
  |                                  |-- sign attestation --------->|
  |                                  |                              |
  |<--- poll GET /v2/messages -------|                              |
  |                                  |                              |
  |--- submit attestation ---------------------------------------->|
  |                                  |                   mint USDC  |
```

## License

MIT
