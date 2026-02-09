## 1. Implementation
- [x] 1.1 Update Header component to import and use `useWallet` hook
- [x] 1.2 Replace mock `isConnected` state with `isConnected` from `useWallet` hook
- [x] 1.3 Replace mock wallet address display (`0x1234...5678`) with real `account` from hook, properly truncated
- [x] 1.4 Connect wallet button `onClick` handler to `connect()` function from hook
- [x] 1.5 Add disconnect functionality when wallet is connected (either via button click or separate disconnect action)
- [x] 1.6 Handle loading states during wallet connection
- [x] 1.7 Ensure wallet connection state persists across page refreshes (already handled by `checkIsWalletConnected` in hook)
- [x] 1.8 Update both desktop and mobile wallet button implementations

## 2. Testing
- [x] 2.1 Test wallet connection flow with MetaMask
- [x] 2.2 Test wallet disconnection flow
- [x] 2.3 Test wallet address display and truncation
- [x] 2.4 Test account switching (if multiple accounts available)
- [x] 2.5 Test network switching
- [x] 2.6 Test error handling when wallet extension is not installed
- [x] 2.7 Test error handling when user rejects connection request

## 3. Validation
- [x] 3.1 Verify wallet connection persists after page refresh
- [x] 3.2 Verify wallet state updates correctly when account changes externally
- [x] 3.3 Verify wallet state updates correctly when network changes externally
- [x] 3.4 Verify UI states match wallet connection status accurately
