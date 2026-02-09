# Change: Implement Wallet Capability

## Why
The Header component currently uses a mock wallet implementation with local state that only toggles a boolean. However, a full wallet integration already exists in `stores/wallet.ts` using ethers.js with support for MetaMask and other Ethereum wallets. The Header component needs to be updated to use the real wallet implementation to enable actual wallet connection, account management, and network switching functionality.

## What Changes
- Replace mock wallet state in Header component with real `useWallet` hook integration
- Connect wallet button to actual wallet connection flow
- Display real wallet address when connected (with proper truncation)
- Handle wallet connection/disconnection states
- Support account switching and network changes
- Show appropriate UI states for connected/disconnected/connecting states

## Impact
- Affected specs: New `wallet` capability specification
- Affected code:
  - `apps/agent-market-fe/components/business/Header.tsx` - Replace mock implementation
  - `apps/agent-market-fe/lib/hooks/useWallet.ts` - Already exists, will be used
  - `apps/agent-market-fe/stores/wallet.ts` - Already exists, will be used
