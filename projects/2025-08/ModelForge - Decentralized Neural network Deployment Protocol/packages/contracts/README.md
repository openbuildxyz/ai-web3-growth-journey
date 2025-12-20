# @modelforge/contracts

Smart contracts for the ModelForge AI model registry ecosystem, built with Hardhat and OpenZeppelin.

## Overview

This package contains the core smart contracts for ModelForge:

- **ForgeToken (FORGE)**: ERC20 token for the ModelForge ecosystem
- **ForgeFaucet**: Dispenses 100 FORGE tokens per address per hour
- **ModelRegistry**: Registry for AI models with IPFS integration

## Contracts

### ForgeToken

ERC20 token with the following features:

- **Symbol**: FORGE
- **Decimals**: 18
- **Initial Supply**: 1,000,000 FORGE (minted to deployer)
- **Mintable**: Owner can mint additional tokens
- **Batch Minting**: Support for minting to multiple addresses at once

#### Key Functions

```solidity
function mint(address to, uint256 amount) external onlyOwner
function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner
```

### ForgeFaucet

Token faucet for distributing FORGE tokens to users:

- **Rate**: 100 FORGE per claim
- **Cooldown**: 1 hour between claims per address
- **Anti-Contract**: Prevents smart contracts from claiming
- **Pausable**: Owner can pause/unpause the faucet
- **Emergency Withdraw**: Owner can recover tokens

#### Key Functions

```solidity
function claimTokens() external nonReentrant whenNotPaused
function canClaim(address user) public view returns (bool)
function timeUntilNextClaim(address user) external view returns (uint256)
function pause() external onlyOwner
function emergencyWithdraw(address token, uint256 amount) external onlyOwner
```

### ModelRegistry

Registry for AI models with IPFS storage:

- **Model Registration**: Store model metadata on-chain
- **IPFS Integration**: Models stored on IPFS, hashes on-chain
- **Access Control**: Owners can manage their models
- **Event Logging**: Comprehensive event system

## Installation

```bash
pnpm install
```

## Development

### Compile Contracts

```bash
pnpm compile
```

### Run Tests

```bash
pnpm test
```

### Test Coverage

```bash
pnpm coverage
```

### Type Generation

```bash
pnpm typechain
```

## Deployment

### Local Development

1. **Start local Hardhat node:**

   ```bash
   pnpm chain:local
   # or from root: pnpm chain:local
   ```

2. **Deploy contracts to local network:**

   ```bash
   pnpm deploy:local
   # or from root: pnpm deploy:local
   ```

3. **Test the faucet:**

   ```bash
   npx hardhat run scripts/test-faucet.ts --network localhost
   ```

### Production Networks

Deploy to Sepolia testnet:

```bash
pnpm deploy:sepolia
```

### Polygon Amoy Testnet

Deploy to Polygon Amoy (testnet):

```bash
# 1. Get test MATIC from faucet
# Visit: https://faucet.polygon.technology/

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your PRIVATE_KEY and POLYGON_AMOY_URL

# 3. Deploy contracts
npx hardhat run scripts/deploy-polygon-amoy.ts --network polygonAmoy

# 4. Verify contracts (optional)
npx hardhat verify --network polygonAmoy <TOKEN_ADDRESS>
npx hardhat verify --network polygonAmoy <FAUCET_ADDRESS> <TOKEN_ADDRESS>
```

**Polygon Amoy Resources:**

- **Faucet**: <https://faucet.polygon.technology/>
- **Explorer**: <https://amoy.polygonscan.com/>
- **Bridge**: <https://portal.polygon.technology/bridge>
- **RPC**: <https://rpc-amoy.polygon.technology/>
- **Chain ID**: 80002

## Usage in Applications

### Import Contract Artifacts

```typescript
import { getDeployments, getContract, ABIs } from '@modelforge/contracts';

// Get all deployments for localhost
const deployments = getDeployments('localhost');

// Get specific contract
const forgeToken = getContract('forgeToken', 'localhost');

// Use with ethers.js
const tokenContract = new ethers.Contract(
  forgeToken.address,
  forgeToken.abi,
  provider
);

// Or use ABIs directly
import { ABIs } from '@modelforge/contracts';
const tokenContract = new ethers.Contract(address, ABIs.ForgeToken, provider);
```

### Available Networks

Check which networks have deployments:

```typescript
import { getAvailableNetworks, hasDeployments } from '@modelforge/contracts';

const networks = getAvailableNetworks(); // ['localhost', 'sepolia']
const hasLocal = hasDeployments('localhost'); // true
```

## Scripts

- `pnpm build` - Compile contracts and TypeScript
- `pnpm clean` - Clean artifacts and cache
- `pnpm compile` - Compile Solidity contracts
- `pnpm test` - Run test suite
- `pnpm coverage` - Generate coverage report
- `pnpm typecheck` - Type check TypeScript
- `pnpm chain:local` - Start local Hardhat node
- `pnpm deploy:local` - Deploy to local network
- `pnpm deploy:sepolia` - Deploy to Sepolia testnet

## Architecture

### Contract Inheritance

```
ForgeToken
├── ERC20 (OpenZeppelin)
└── Ownable (OpenZeppelin)

ForgeFaucet
├── Ownable (OpenZeppelin)
└── ReentrancyGuard (OpenZeppelin)

ModelRegistry
├── Ownable (OpenZeppelin)
├── Pausable (OpenZeppelin)
└── ReentrancyGuard (OpenZeppelin)
```

### Deployment Artifacts

After deployment, contract addresses and ABIs are saved to:

- `artifacts/deployments/{network}.json` - Deployment addresses
- `artifacts/deployments/{network}-abis.json` - Contract ABIs

## Testing

The test suite covers:

- ✅ Contract deployment
- ✅ Token minting and transfers
- ✅ Faucet claiming and cooldowns
- ✅ Access control mechanisms
- ✅ Edge cases and error conditions
- ✅ Event emissions
- ✅ Integration scenarios

### Test Files

- `test/ForgeToken.test.ts` - ERC20 token functionality
- `test/ForgeFaucet.test.ts` - Faucet mechanics and security

## Security Features

- **Reentrancy Protection**: All state-changing functions protected
- **Access Control**: Owner-only functions for critical operations
- **Input Validation**: Comprehensive parameter checking
- **Pausable Contracts**: Emergency stop functionality
- **Rate Limiting**: Cooldown periods for faucet claims
- **Contract Detection**: Prevents contracts from claiming faucet tokens

## Gas Optimization

- **Compiler Optimization**: Enabled with 200 runs
- **Efficient Storage**: Packed structs for gas savings
- **Batch Operations**: Reduce transaction costs for multiple operations

## Contributing

1. Write comprehensive tests for new features
2. Follow the existing code style and conventions
3. Add proper NatSpec documentation
4. Ensure all tests pass and coverage is maintained

## License

MIT
