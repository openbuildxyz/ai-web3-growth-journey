# Orbit

> Privacy-preserving token swaps powered by zero-knowledge proofs

## The Problem

When you send someone crypto, you expose your entire financial history on the blockchain. Anyone can look up your transaction on Etherscan and see:

- Your complete wallet balance
- Every token you hold
- Every transaction you've ever made
- Every DeFi protocol you've interacted with
- Your complete on-chain financial history

A simple payment becomes a total privacy breach.

## The Solution

**Orbit** leverages [RAILGUN](https://railgun.org/) to bring true privacy to crypto transactions using zero-knowledge proofs (ZKPs). With Orbit:

- **Shield**: Deposit tokens into a private pool using ZK proofs, breaking the on-chain link
- **Swap**: Execute private swaps with no traceable connection to your identity
- **Unshield**: Withdraw tokens publicly only when you choose to

Your transactions remain completely private—your balance, swaps, and financial activity cannot be traced back to you on-chain.

## Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** with App Router
- **[React 19](https://react.dev/)** with TypeScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** for cyberpunk-styled UI
- **[Framer Motion](https://www.framer.com/motion/)** for animations
- **[RainbowKit](https://www.rainbowkit.com/)** for wallet connection

### Blockchain & Web3
- **[Wagmi 2](https://wagmi.sh/)** — React hooks for Ethereum
- **[Viem 2](https://viem.sh/)** — TypeScript interface for Ethereum
- **[Ethers 6](https://docs.ethers.org/)** — Ethereum utilities
- **[OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)** — Secure smart contract standards

### Privacy Technology
- **[RAILGUN Community SDK](https://github.com/Railgun-Privacy/Safe-Armor)** — Zero-knowledge privacy system
  - `@railgun-community/wallet` v10.8.3
  - `@railgun-community/shared-models` v8.0.1
- **[SNARKJS](https://github.com/iden3/snarkjs)** — ZK proof generation

### Development Tools
- **[Hardhat](https://hardhat.org/)** — Ethereum development environment
- **[Foundry](https://getfoundry.sh/)** — Fast Solidity testing/deployment
- **[TypeChain](https://github.com/dethcrypto/TypeChain)** — Type-safe contract bindings

## Features

- **Private Swaps**: Execute token swaps without revealing your identity or transaction history
- **Shield/Unshield**: Move tokens in and out of privacy mode on-demand
- **Multi-Token Support**: ETH, WETH, USDC, USDT, DAI, and custom OrbUSD
- **AMM Integration**: Built-in liquidity pool for seamless token exchange
- **Real-Time Updates**: Streaming progress tracking via server-sent events
- **Testnet Deployed**: Currently live on Sepolia testnet

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Wallet with Sepolia testnet ETH

### Installation

```bash
# Clone and navigate to project
cd projects/2026-02-09/orbit

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Variables

Edit `.env` with your values:

```env
# Sepolia RPC URL (get from Alchemy/Infura/QuickNode)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Wallet private key (for deployment only, NEVER commit)
PRIVATE_KEY=your_private_key_here

# RAILGUN configuration
NEXT_PUBLIC_RAILGUN_ENGINE=testnet
```

### Development

```bash
# Run Next.js dev server
npm run dev

# Open http://localhost:3000
```

### Smart Contract Deployment

```bash
# Compile contracts (Foundry)
forge build

# Deploy to Sepolia
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast

# Or use Hardhat
npx hardhat run scripts/deploy.js --network sepolia
```

## Architecture

### Frontend Structure

```
app/
├── api/railgun/          # API routes for RAILGUN operations
│   ├── init/            # Initialize privacy engine
│   ├── shield/          # Deposit tokens privately
│   ├── swap/            # Execute private swap
│   └── unshield/        # Withdraw tokens publicly
├── page.tsx             # Main dashboard
components/
├── RailgunPrivacy.tsx   # Shield/Unshield UI
├── PrivateSwap.tsx      # Private swap interface
└── RealSwap.tsx         # Public swap fallback
hooks/
└── usePrivateSwap.ts    # Core swap logic & state
```

### Smart Contracts

Located in `contracts/`:

- **OrbToken.sol**: Custom ERC20 token with minting
- **OrbPool.sol**: AMM pool (constant product formula: x × y = k)
- **OrbSwapRouter.sol**: Swap execution logic
- **LP token management**: Add/remove liquidity with LP tokens

### Privacy Flow

1. **Shield**: User deposits tokens → ZK proof generated → tokens enter private pool
2. **Swap**: Private swap executes → proof of inclusion verified → tokens swapped privately
3. **Unshield**: User withdraws → tokens appear on-chain with no history of private activity

## Troubleshooting

| Issue | Cause | Fix |
|-------|--------|-----|
| **403** from `api.web3modal.org` | App is using placeholder `default-project-id`. | Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env` from [cloud.walletconnect.com](https://cloud.walletconnect.com). |
| **500** on `POST /api/railgun/init` | RAILGUN engine init failed (e.g. RPC, native deps). | Check server logs and the API response body (in dev it includes `stack` / `cause`). Ensure `RAILGUN_RPC_URL` and fallbacks in `.env` are valid Sepolia RPCs. |
| **"Denying load of chrome-extension://...content/inpage.js"** | Orbit Wallet extension: `content/inpage.js` must be loadable by the page. | In the Orbit Wallet extension project, add `content/inpage.js` to the `web_accessible_resources` array in `manifest.json`. |
| **GET chrome-extension://invalid/ net::ERR_FAILED** | Some script is requesting an invalid extension URL. | Usually from a wallet detector; safe to ignore or fix in the extension if it's your code. |

## Project Status

- ✅ Privacy engine integration
- ✅ Shield/Unshield functionality
- ✅ Private swap implementation
- ✅ Sepolia testnet deployment
- ⏳ Mainnet preparation (TBD)

## Resources

- [RAILGUN Documentation](https://docs.railgun.org/)
- [RAILGUN GitHub](https://github.com/Railgun-Privacy)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)

## License

MIT

---

**Built for Hack Money 2026**
