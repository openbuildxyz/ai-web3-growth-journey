# Orbit Privacy Swap - Smart Contracts

ERC20 tokens and AMM pool for the Orbit Privacy Swap platform.

Built with **Foundry** - the fastest toolkit for developing Ethereum applications.

## Contracts

### OrbToken
Simple ERC20 token with minting capabilities (owner only).

**File**: [src/OrbToken.sol](src/OrbToken.sol)

### OrbPool
Constant product AMM pool (x * y = k) with:
- LP tokens for liquidity providers
- 0.3% swap fee
- Add/remove liquidity
- Flash loan protection via ReentrancyGuard

**File**: [src/OrbPool.sol](src/OrbPool.sol)

## Token Specifications

| Token | Symbol | Decimals | Initial Supply |
|-------|--------|----------|----------------|
| Orbit USD | ORBUSD | 18 | 1,000,000 |
| Orbit ETH | ORBETH | 18 | 1,000,000 |

## Quick Start

### 1. Install Foundry (if not installed)

```bash
curl -L https://foundry.paradigm.xyz | bash
```

### 2. Build Contracts

```bash
make build
```

### 3. Deploy to Sepolia Testnet

```bash
make deploy
```

This will:
- Deploy OrbUSD token (1M supply)
- Deploy OrbETH token (1M supply)
- Deploy OrbPool (OrbUSD/OrbETH)
- Add initial liquidity (10,000 OrbUSD / 5 OrbETH)
- Verify contracts on Etherscan

### 4. Interact with Deployed Contracts

```bash
make interact
```

## Usage

### Swap Tokens

```bash
# Swap 1 OrbETH → OrbUSD
make swap-eth-to-usd

# Swap 1000 OrbUSD → OrbETH
make swap-usd-to-eth
```

### Build & Test

```bash
# Compile contracts
make build

# Run tests
make test

# Run tests with coverage
make test-coverage

# Fuzz tests
make test-fuzz

# Clean build artifacts
make clean
```

## Deployment Scripts

### DeployScript
[script/Deploy.s.sol](script/Deploy.s.sol)

Deploys all contracts with initial liquidity:
- OrbUSD: 1,000,000 tokens
- OrbETH: 1,000,000 tokens
- Initial liquidity: 10,000 OrbUSD / 5 OrbETH
- Initial price: 2,000 USD per ETH

**Usage:**
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### InteractScript
[script/Interact.s.sol](script/Interact.s.sol)

Check balances and pool state.

**Usage:**
```bash
ORBUSD_ADDRESS=0x... \
ORBETH_ADDRESS=0x... \
POOL_ADDRESS=0x... \
forge script script/Interact.s.sol:InteractScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### SwapScript
[script/Swap.s.sol](script/Swap.s.sol)

Execute token swaps.

**Usage:**
```bash
# Swap 1 OrbETH → OrbUSD
DIRECTION=ETH_TO_USD \
AMOUNT=1000000000000000000 \
forge script script/Swap.s.sol:SwapScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Environment Variables

Required for deployment:

```bash
# Your wallet private key (with Sepolia ETH)
PRIVATE_KEY=0x...

# Infura/Alchemy RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Deployed contract addresses (auto-filled after deployment)
ORBUSD_ADDRESS=
ORBETH_ADDRESS=
POOL_ADDRESS=
```

## Initial Liquidity

The deployment automatically creates a pool with:
- **OrbUSD Reserve**: 10,000 tokens
- **OrbETH Reserve**: 5 tokens
- **Initial Price**: 2,000 USD per ETH
- **LP Tokens**: Minted to deployer

## Pool Math

### Constant Product Formula

The pool uses the formula: `x * y = k`

Where:
- `x` = Reserve of token0 (OrbUSD)
- `y` = Reserve of token1 (OrbETH)
- `k` = Constant product

### Swap Calculation

For swapping `amountIn` of tokenA:

```
amountInWithFee = amountIn * (1 - fee)
amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee)
```

With a 0.3% fee: `fee = 0.003`

### Price Impact

Price impact is calculated as:

```
priceImpact = (currentPrice - executionPrice) / currentPrice
```

Where:
- `currentPrice = reserveOut / reserveIn`
- `executionPrice = amountOut / amountIn`

## Contract Features

### OrbToken
- Standard ERC20 functionality
- Mint (owner only)
- Burn (anyone)
- 18 decimals
- 1,000,000 initial supply

### OrbPool
- **LP Token**: Represents share of pool
- **Swap Fee**: 0.3% (3 basis points)
- **Minimum Liquidity**: 1000 LP tokens locked on first deposit
- **K Validation**: Ensures x * y >= k after every swap
- **Slippage Protection**: Minimum amounts for liquidity operations

### Security

1. **ReentrancyGuard**: Prevents reentrancy attacks
2. **SafeERC20**: Safe token transfers
3. **Ownable**: Owner-only functions (minting)
4. **Input Validation**: All addresses and amounts validated
5. **K Invariant**: Constant product maintained

## Testing

### Test Locally with Anvil

```bash
# Start local fork
make deploy-local
```

This starts a local Anvil node forked from Sepolia with all contracts deployed.

### Example Test Scenarios

1. **Swap 1 OrbETH → OrbUSD**
   - Expected: ~2000 OrbUSD (at initial price)
   - Fee: 6 OrbUSD (0.3%)

2. **Add 1000 OrbUSD + 0.5 OrbETH Liquidity**
   - Expected: ~22 LP tokens
   - Pool reserves: 11,000 OrbUSD / 5.5 OrbETH

3. **Remove 10 LP Tokens**
   - Expected: ~50 OrbUSD + 0.025 OrbETH
   - (assuming 11,000 OrbUSD / 5.5 OrbETH reserves)

## Verification

Contracts are automatically verified on Etherscan during deployment.

Manual verification:
```bash
ORBUSD_ADDRESS=0x... \
ORBETH_ADDRESS=0x... \
POOL_ADDRESS=0x... \
ETHERSCAN_API_KEY=... \
make verify
```

## Gas Optimization

The contracts use:
- Compiler optimization enabled (200 runs)
- Custom LP token (no separate contract deployment)
- Minimal storage operations
- Efficient math operations
- Foundry's optimized compiler

## Foundry Commands Reference

```bash
# Build
forge build

# Test
forge test
forge test -vvv        # verbose
forge test --gas-report # gas report

# Fuzzing
forge test -fuzz-runs 256

# Deploy
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Verify
forge verify-contract <ADDRESS> <CONTRACT> \
  --rpc-url $RPC_URL \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Chain inspection
forge cast <contract_address> "totalSupply()" --rpc-url $RPC_URL
forge inspect <contract_address> --rpc-url $RPC_URL
```

## Integration with Frontend

The deployed contracts integrate with the privacy swap via:

1. **Pricing Oracle**: Pool used for price quotes
2. **Swap Execution**: Can swap via OrbPool or RAILGUN (private)
3. **Token Addresses**: Configured in `lib/railgun/types.ts`
4. **LP Tokens**: Can provide liquidity to earn fees

## License

MIT
