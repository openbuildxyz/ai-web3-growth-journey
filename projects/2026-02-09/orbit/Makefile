# Foundry commands

.PHONY: build test deploy interact swap clean

# Environment variables (override with environment or .env)
PRIVATE_KEY ?= 0x0000000000000000000000000000000000000001
RPC_URL ?= http://localhost:8545
ETHERSCAN_API_KEY ?=

# Sepolia testnet
SEPOLIA_RPC_URL ?= https://sepolia.infura.io/v3/$(INFURA_API_KEY)

# Deployed contracts (set by deploy script)
ORBUSD_ADDRESS ?=
ORBETH_ADDRESS ?=
POOL_ADDRESS ?=

build:
	forge build

test:
	forge test

test-coverage:
	forge coverage

test-fuzz:
	forge test -fuzz-runs 256

# Deploy to local anvil node
deploy-local:
	anvil --fork-url $(SEPOLIA_RPC_URL)
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url http://localhost:8545 \
		--private-key $(PRIVATE_KEY) \
		--broadcast

# Deploy to sepolia testnet
deploy:
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY)

# Interact with deployed contracts
interact:
	forge script script/Interact.s.sol:InteractScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY)

# Swap tokens
swap-eth-to-usd:
	DIRECTION=ETH_TO_USD \
	AMOUNT=$(shell echo "1e18" | bc) \
	forge script script/Swap.s.sol:SwapScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY)

swap-usd-to-eth:
	DIRECTION=USD_TO_ETH \
	AMOUNT=$(shell echo "1000e18" | bc) \
	forge script script/Swap.s.sol:SwapScript \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY)

# Verify contracts on Etherscan
verify:
	forge verify-contract $(ORBUSD_ADDRESS) src/OrbToken.sol:OrbToken \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--etherscan-api-key $(ETHERSCAN_API_KEY)
	forge verify-contract $(ORBETH_ADDRESS) src/OrbToken.sol:OrbToken \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--etherscan-api-key $(ETHERSCAN_API_KEY)
	forge verify-contract $(POOL_ADDRESS) src/OrbPool.sol:OrbPool \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--etherscan-api-key $(ETHERSCAN_API_KEY)

# Clean build artifacts
clean:
	forge clean
	rm -rf broadcast cache out

# Help
help:
	@echo "Available targets:"
	@echo "  build           - Compile contracts"
	@echo "  test            - Run tests"
	@echo "  deploy-local     - Deploy to local anvil node"
	@echo "  deploy          - Deploy to sepolia testnet"
	@echo "  interact        - Interact with deployed contracts"
	@echo "  swap-eth-to-usd - Swap OrbETH to OrbUSD (1 ETH)"
	@echo "  swap-usd-to-eth - Swap OrbUSD to OrbETH (1000 OrbUSD)"
	@echo "  verify          - Verify contracts on Etherscan"
	@echo "  clean           - Clean build artifacts"
	@echo ""
	@echo "Environment variables:"
	@echo "  PRIVATE_KEY     - Your wallet private key"
	@echo "  RPC_URL         - RPC endpoint"
	@echo "  ETHERSCAN_API_KEY - Etherscan API key"
