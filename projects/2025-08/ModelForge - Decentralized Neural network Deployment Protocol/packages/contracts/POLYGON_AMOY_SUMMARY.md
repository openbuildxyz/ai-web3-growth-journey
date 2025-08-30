# Polygon Amoy Integration Summary

## What was added

### 1. Hardhat Configuration (`packages/contracts/hardhat.config.ts`)

- Added `polygonAmoy` network configuration
- Chain ID: 80002
- Default RPC: <https://rpc-amoy.polygon.technology/>
- Gas price: 30 Gwei
- Added PolygonScan verification support

### 2. Environment Variables (`.env.example`)

- `POLYGON_AMOY_URL`: RPC endpoint (optional, has default)
- `POLYGONSCAN_API_KEY`: For contract verification (optional)
- Added documentation with faucet and explorer links

### 3. Deployment Script (`packages/contracts/scripts/deploy-polygon-amoy.ts`)

- Dedicated Polygon Amoy deployment script
- Balance checking before deployment
- Automatic faucet funding
- Contract verification instructions

### 4. Package Scripts

- Added `deploy:polygon-amoy` to contracts package.json
- Added root-level `deploy:polygon-amoy` script
- Usage: `pnpm deploy:polygon-amoy`

### 5. Documentation

- Updated README.md with Polygon Amoy section
- Created detailed setup guide (`docs/polygon-amoy-setup.md`)
- Included faucet links, explorer URLs, and troubleshooting

## Key Features

✅ **Optional & Disabled by Default**: No mainnet tokens required
✅ **Free Testnet**: Uses free test MATIC from faucet
✅ **Complete Setup Guide**: Step-by-step instructions
✅ **Contract Verification**: PolygonScan integration
✅ **Resource Links**: Faucet, explorer, bridge documentation

## Usage

```bash
# 1. Get test MATIC from faucet
# Visit: https://faucet.polygon.technology/

# 2. Deploy contracts
pnpm deploy:polygon-amoy

# 3. Verify contracts (optional)
npx hardhat verify --network polygonAmoy <CONTRACT_ADDRESS>
```

The configuration is completely optional and won't affect existing local development workflows.
