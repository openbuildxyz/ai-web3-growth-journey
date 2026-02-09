# AgentBridge Subgraph

The Graph subgraph for indexing AgentBridge contracts on Ethereum Sepolia.

## Setup

1. Install dependencies:
```bash
npm install -g @graphprotocol/graph-cli
npm install
```

2. Generate ABIs from contracts:
```bash
# Copy ABIs from contracts/out/ to subgraph/abis/
cp ../contracts/out/IdentityRegistry.sol/IdentityRegistry.json abis/
cp ../contracts/out/ReputationRegistry.sol/ReputationRegistry.json abis/
cp ../contracts/out/AgentPayment.sol/AgentPayment.json abis/
```

3. Update `subgraph.yaml` with deployed contract addresses and start blocks:
   - Replace `{{IDENTITY_REGISTRY_ADDRESS}}` with deployed IdentityRegistry address
   - Replace `{{REPUTATION_REGISTRY_ADDRESS}}` with deployed ReputationRegistry address
   - Replace `{{AGENT_PAYMENT_ADDRESS}}` with deployed AgentPayment address
   - Replace `{{*_START_BLOCK}}` with deployment block numbers

4. Generate code:
```bash
graph codegen
```

5. Build:
```bash
graph build
```

6. Deploy to The Graph Studio:
```bash
graph deploy --studio agentbridge-subgraph
```

## Schema

The subgraph indexes:
- **Agent** entities: Agent registrations and metadata
- **Feedback** entities: Reputation feedback with trust score calculation
- **Response** entities: Responses to feedback
- **PaymentEvent** entities: Agent payment transactions

## Trust Score

Trust scores are computed as the average of non-revoked feedback values, normalized to a 0-100 scale.
