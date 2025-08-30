# ModelForge

A comprehensive AI model registry and deployment platform built on blockchain technology.

## Overview

ModelForge is a decentralized platform for AI model registration, discovery, and deployment. It combines smart contracts for model registry with modern web technologies for seamless user experience.

## Architecture

- **packages/contracts**: Solidity smart contracts with Hardhat for blockchain model registry
- **packages/cli**: Node.js CLI tool for model management and deployment
- **packages/uploader**: JavaScript SDK for IPFS integration and registry interactions
- **apps/web**: Next.js 15 web application with wagmi/viem and RainbowKit
- **apps/demo-streamlit**: Streamlit demo application template
- **apps/demo-gradio**: Gradio demo application template

## 🚀 Quick Start

### Option 1: VS Code Dev Container (Recommended)

1. **Open in VS Code**: Install the "Dev Containers" extension
2. **Reopen in Container**: `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"
3. **Wait for setup**: The container will automatically install Node.js 20, Python 3.11, Foundry, and all dependencies
4. **Start developing**: Use the VS Code tasks or terminal commands below

### Option 2: Docker (Alternative)

```bash
# Clone and start with Docker Compose
git clone <repository-url>
cd ModelForge
docker-compose up

# Or build and run manually
docker build -t modelforge .
docker run -p 3000:3000 -p 8545:8545 -p 7860:7860 -p 8501:8501 modelforge
```

### Option 3: Local Development

#### Prerequisites

- Node.js >= 20.0.0
- Python >= 3.11
- pnpm >= 8.0.0
- Foundry (forge, anvil, cast, chisel)

#### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ModelForge

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## 🔧 Development Tasks

### VS Code Tasks (Ctrl+Shift+P → "Tasks: Run Task")

| Task                        | Description                                 | Command                                    |
| --------------------------- | ------------------------------------------- | ------------------------------------------ |
| **Dev: Start**              | Install dependencies and build all packages | `pnpm install && pnpm -r build`            |
| **Chain: Local**            | Start local Hardhat blockchain node         | `npx hardhat node`                         |
| **Web: Dev**                | Start Next.js development server            | `pnpm --filter web dev`                    |
| **Demo: Streamlit**         | Start Streamlit demo app                    | `pnpm --filter demo-streamlit dev`         |
| **Demo: Gradio**            | Start Gradio demo app                       | `pnpm --filter demo-gradio dev`            |
| **Contracts: Compile**      | Compile smart contracts                     | `pnpm --filter contracts compile`          |
| **Contracts: Test**         | Run smart contract tests                    | `pnpm --filter contracts test`             |
| **Contracts: Deploy Local** | Deploy contracts to local chain             | `pnpm --filter contracts deploy:localhost` |
| **Lint: All**               | Lint all packages                           | `pnpm lint`                                |
| **Test: All**               | Run all tests                               | `pnpm test`                                |
| **TypeCheck: All**          | Type check all TypeScript                   | `pnpm typecheck`                           |

### Terminal Commands

```bash
# Development workflow
pnpm install              # Install all dependencies
pnpm build               # Build all packages
pnpm dev                 # Start all development servers
pnpm test                # Run all tests
pnpm lint                # Lint and fix code
pnpm typecheck           # Type check TypeScript

# Specific package commands
pnpm --filter web dev              # Next.js web app
pnpm --filter contracts test       # Smart contract tests
pnpm --filter cli build           # CLI tool
pnpm --filter demo-streamlit dev   # Streamlit demo
pnpm --filter demo-gradio dev      # Gradio demo

# Blockchain development
cd packages/contracts
npx hardhat node           # Start local blockchain
npx hardhat compile        # Compile contracts
npx hardhat test           # Run contract tests
npx hardhat run scripts/deploy.ts --network localhost  # Deploy locally
```

## 🌐 Development Servers

After starting the development servers, access the applications at:

- **Web App**: <http://localhost:3000>
- **Local Blockchain**: <http://localhost:8545> (JSON-RPC)
- **Streamlit Demo**: <http://localhost:8501>
- **Gradio Demo**: <http://localhost:7860>

## 🔗 Port Forwarding

The dev container automatically forwards these ports:

| Port | Service         | Auto-Forward |
| ---- | --------------- | ------------ |
| 3000 | Next.js Web App | ✅ Notify    |
| 8545 | Hardhat Node    | 🔇 Silent    |
| 7860 | Gradio Demo     | ✅ Notify    |
| 8501 | Streamlit Demo  | ✅ Notify    |

## Scripts

- `pnpm build` - Build all packages and apps
- `pnpm dev` - Start development servers
- `pnpm lint` - Lint and fix code
- `pnpm test` - Run all tests
- `pnpm typecheck` - Type check all TypeScript code

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes (follows conventional commits)
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.
