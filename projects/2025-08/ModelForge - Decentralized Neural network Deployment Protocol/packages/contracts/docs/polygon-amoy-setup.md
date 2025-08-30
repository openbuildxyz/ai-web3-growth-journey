# Polygon Amoy Testnet Setup Guide

This guide helps you deploy and test ModelForge contracts on Polygon Amoy testnet.

## Prerequisites

1. **MetaMask or compatible wallet**
2. **Test MATIC tokens** (free from faucet)
3. **API keys** (optional, for contract verification)

## Step 1: Network Setup

### Add Polygon Amoy to MetaMask

- **Network Name**: Polygon Amoy
- **RPC URL**: `https://rpc-amoy.polygon.technology/`
- **Chain ID**: `80002`
- **Currency Symbol**: `MATIC`
- **Block Explorer**: `https://amoy.polygonscan.com/`

## Step 2: Get Test MATIC

1. Visit the [Polygon Faucet](https://faucet.polygon.technology/)
2. Connect your wallet
3. Select "Polygon Amoy" network
4. Request test MATIC (you'll need this for gas fees)

## Step 3: Environment Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your configuration:

   ```bash
   # Required
   PRIVATE_KEY=your_wallet_private_key_here
   
   # Optional (uses default RPC if not provided)
   POLYGON_AMOY_URL=https://rpc-amoy.polygon.technology/
   
   # Optional (for contract verification)
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   ```

## Step 4: Deploy Contracts

Deploy the ForgeToken and ForgeFaucet contracts:

```bash
# Deploy to Polygon Amoy
pnpm deploy:polygon-amoy

# Or run directly with Hardhat
npx hardhat run scripts/deploy-polygon-amoy.ts --network polygonAmoy
```

## Step 5: Verify Contracts (Optional)

After deployment, verify your contracts on PolygonScan:

```bash
# Verify ForgeToken
npx hardhat verify --network polygonAmoy <TOKEN_ADDRESS>

# Verify ForgeFaucet
npx hardhat verify --network polygonAmoy <FAUCET_ADDRESS> <TOKEN_ADDRESS>
```

## Step 6: Add Tokens to Wallet

1. Copy the ForgeToken contract address from deployment output
2. In MetaMask, go to "Assets" → "Import tokens"
3. Paste the contract address
4. Token symbol should auto-populate as "FORGE"
5. Decimals should be 18

## Testing Your Deployment

Test the faucet functionality:

```bash
# Run faucet test script
npx hardhat run scripts/test-faucet.ts --network polygonAmoy
```

## Useful Resources

- **Polygon Amoy Faucet**: <https://faucet.polygon.technology/>
- **PolygonScan Amoy**: <https://amoy.polygonscan.com/>
- **Polygon Bridge**: <https://portal.polygon.technology/bridge>
- **Polygon Documentation**: <https://docs.polygon.technology/>

## Troubleshooting

### Common Issues

1. **"Insufficient funds" error**: Get more test MATIC from the faucet
2. **Network not found**: Double-check your RPC URL in .env
3. **Private key issues**: Ensure your PRIVATE_KEY is correctly formatted (without 0x prefix in .env)

### Gas Price Issues

If transactions are failing due to gas price, you can adjust the `gasPrice` in `hardhat.config.ts`:

```typescript
polygonAmoy: {
  // ... other config
  gasPrice: 50000000000, // 50 Gwei (adjust as needed)
}
```

## Next Steps

After successful deployment:

1. **Frontend Integration**: Use the contract addresses in your dApp
2. **Token Distribution**: Use the faucet to distribute tokens to users
3. **Mainnet Preparation**: Test thoroughly before mainnet deployment

---

> **Note**: Polygon Amoy is a testnet. Tokens have no real value and are for testing purposes only.
