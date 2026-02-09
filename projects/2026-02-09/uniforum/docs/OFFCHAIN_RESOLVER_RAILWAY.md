# Offchain Resolver Deployment (Sepolia + Railway)

This guide uses the Uniforum CCIP gateway and the OffchainResolver contract on Sepolia.

## Architecture

- **Gateway**: hosted on Railway at `https://api-uniforum.up.railway.app/v1/ens/ccip`
- **Resolver**: `OffchainResolver` deployed to Sepolia, pointing to the gateway URL
- **Signer**: one private key used by the gateway to sign responses; the resolver allows this signer address

## 1) Generate the CCIP signer

Create a dedicated keypair for the gateway signer (do **not** reuse deployer keys).

- `ENS_CCIP_SIGNER_PRIVATE_KEY`: private key used by the gateway
- `ENS_CCIP_SIGNER_ADDRESS`: the corresponding address (used when deploying the resolver)

## 2) Deploy the gateway on Railway

We ship a gateway service in `packages/gateway` with a Supabase backend.

### Railway service settings

- **Root directory**: `packages/gateway`
- **Build command**: `pnpm install --prod=false && pnpm build`
- **Start command**:

```
node dist/index.js --backend supabase --port $PORT --parent-domain uniforum.eth
```

### Railway environment variables

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ENS_CCIP_SIGNER_PRIVATE_KEY=0x...
NEXT_PUBLIC_APP_URL=https://e3ca-2001-f40-9a4-9909-c174-3ed7-2e4a-bb9e.ngrok-free.app
```

Optional:

```
ENS_PARENT_DOMAIN=uniforum.eth
```

## 3) Deploy OffchainResolver to Sepolia

The resolver contract lives in `packages/contracts/contracts/OffchainResolver.sol`.
You have two deployment options:

### Option A: one-command deploy (recommended)

Set env vars:

```
ETH_RPC_URL=...                         # Sepolia RPC URL
DEPLOYER_PRIVATE_KEY=0x...              # deployer key
ENS_CCIP_SIGNER_ADDRESS=0x...           # gateway signer address
ENS_CCIP_GATEWAY_URL=https://api-uniforum.up.railway.app/v1/ens/ccip
```

Run:

```
pnpm --filter @uniforum/contracts run deploy:offchain-resolver
```

The script prints `OFFCHAIN_RESOLVER_ADDRESS=0x...` on success.

### Option B: use a deployment tool (Foundry/Hardhat/Remix)

Deploy the `OffchainResolver` with:

- `url`: `https://api-uniforum.up.railway.app/v1/ens/ccip`
- `signers`: `[ENS_CCIP_SIGNER_ADDRESS]`

### Option C: use the existing hardhat script (requires a hardhat config)

There is a hardhat script at `packages/contracts/scripts/offchain_resolver.js`, but the repo currently lacks a `hardhat.config`. You can either:

- add a hardhat config and run `hardhat deploy --tags demo` (the script expects `network.config.gatewayurl`), or
- deploy via Foundry/Remix and skip this script.

## 4) Wire the resolver into the API

Set these API env vars (Railway service that runs `apps/api`):

```
ENS_OFFCHAIN_RESOLVER_ADDRESS=0x...   # deployed resolver address on Sepolia
ENS_CCIP_SIGNER_PRIVATE_KEY=0x...     # same key as gateway
ENS_CCIP_GATEWAY_URL=https://api-uniforum.up.railway.app/v1/ens
```

## 5) Update ENS name resolver (Sepolia)

Use ENS Manager or a script to set the resolver for your `*.uniforum.eth` subname to the newly deployed `OffchainResolver` on Sepolia.

## 6) Smoke test

- Call: `GET https://api-uniforum.up.railway.app/v1/ens/resolve/<name>`
- Call: `GET https://api-uniforum.up.railway.app/v1/ens/ccip?sender=<resolver>&data=<calldata>`

If you get `Resolver address mismatch`, verify `ENS_OFFCHAIN_RESOLVER_ADDRESS`.
If you get `CCIP signer configuration missing`, verify `ENS_CCIP_SIGNER_PRIVATE_KEY`.
