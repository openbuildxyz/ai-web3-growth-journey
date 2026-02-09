# Agent-Market-FE

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A WalletConnect Project ID (for wallet integration)

### Environment Setup

1. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

2. **Set up WalletConnect Project ID** (Required for wallet functionality):
   
   Follow the detailed guide in [docs/WALLETCONNECT_SETUP.md](./docs/WALLETCONNECT_SETUP.md) for complete instructions.
   
   **Quick steps:**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Create a new project and copy your Project ID
   - Add it to your `.env` file:
     ```
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
     ```
   
   **Important**: Without a valid WalletConnect Project ID, mobile wallet connections and some wallet features will not work properly.

3. Configure other environment variables as needed:
   ```
   BACKEND_DOMAIN=http://localhost:8000  # Backend API URL
   ```

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Mock Service Worker


## Wallet Integration

This application uses RainbowKit for wallet connection, which provides:
- Support for MetaMask, WalletConnect, Coinbase Wallet, and Rainbow
- Beautiful wallet connection UI
- Network switching
- ENS name resolution
- Mobile wallet support via WalletConnect

For mobile wallet connections to work, you **must** configure a valid WalletConnect Project ID as described in the Environment Setup section above.
