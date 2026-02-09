# Implementation Plan: RainbowKit Wallet Integration

## Overview

This implementation plan breaks down the RainbowKit integration into discrete, sequential tasks. Each task builds on the previous ones, ensuring incremental progress and early validation. The plan follows a phased approach: setup → component migration → theme customization → cleanup → testing.

## Tasks

- [ ] 1. Setup wagmi configuration and providers
  - [x] 1.1 Create wagmi configuration file
    - Create `lib/wagmi.ts` with wagmi config using `getDefaultConfig`
    - Configure Sepolia testnet as the primary chain
    - Set up WalletConnect with project ID from environment variable
    - Enable SSR mode for Next.js compatibility
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [x] 1.2 Create providers component
    - Create `app/providers.tsx` with client-side providers
    - Set up QueryClientProvider with new QueryClient instance
    - Wrap with WagmiProvider using the wagmi config
    - Wrap with RainbowKitProvider
    - Ensure correct provider hierarchy (QueryClient → Wagmi → RainbowKit)
    - _Requirements: 1.3, 1.5_
  
  - [x] 1.3 Integrate providers into app layout
    - Update `app/layout.tsx` to import and use Providers component
    - Wrap children with Providers component
    - Add RainbowKit CSS import
    - Verify app runs without errors
    - _Requirements: 1.3_
  
  - [-] 1.4 Write unit tests for configuration
    - Test wagmi config includes Sepolia chain
    - Test WalletConnect project ID is configured
    - Test provider hierarchy is correct
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Update Wallet component with RainbowKit ConnectButton
  - [x] 2.1 Replace custom wallet UI with ConnectButton
    - Update `components/business/Header/components/Wallet.tsx`
    - Import ConnectButton from RainbowKit
    - Replace custom button with ConnectButton component
    - Configure ConnectButton props (chainStatus, showBalance, accountStatus)
    - Keep AuthDialog integration logic
    - _Requirements: 2.1, 2.2, 2.3, 9.1, 9.2_
  
  - [x] 2.2 Update wallet state management
    - Replace useWallet hook call with useAccount from wagmi
    - Update isConnected and address references
    - Maintain AuthDialog trigger logic (show when connected but not authenticated)
    - _Requirements: 2.1, 3.1, 9.3_
  
  - [ ] 2.3 Write unit tests for Wallet component
    - Test ConnectButton renders when disconnected
    - Test AuthDialog opens when connected but not authenticated
    - Test component integrates with Header layout
    - _Requirements: 2.1, 3.1, 9.2, 9.5_
  
  - [ ] 2.4 Write property test for connected address display
    - **Property 4: Connected Address Display**
    - Test that any connected address displays in truncated format
    - Generate random Ethereum addresses and verify truncation
    - **Validates: Requirements 2.2**

- [ ] 3. Update AuthDialog to use wagmi hooks
  - [x] 3.1 Migrate to wagmi hooks
    - Update `components/business/AuthDialog.tsx`
    - Replace useWallet with useAccount and useSignMessage from wagmi
    - Update address reference to use useAccount
    - Replace signer.signMessage with signMessageAsync from useSignMessage
    - Maintain existing authentication flow logic
    - _Requirements: 3.3, 3.4_
  
  - [x] 3.2 Update disconnect handling
    - Ensure clearAuth is called on wallet disconnect
    - Update Wallet component disconnect handler
    - _Requirements: 3.2_
  
  - [ ] 3.3 Write unit tests for AuthDialog
    - Test dialog opens with correct props
    - Test authentication flow calls backend endpoints
    - Test signature is requested from wallet
    - Test token is stored on successful auth
    - _Requirements: 3.3, 3.4, 3.5_
  
  - [ ] 3.4 Write property test for authentication flow
    - **Property 3: Authentication Flow Sequence**
    - Test that any authentication attempt follows correct sequence
    - Mock backend and wallet, verify order: challenge → sign → login → store
    - **Validates: Requirements 3.4**
  
  - [ ] 3.5 Write property test for auth dialog trigger
    - **Property 1: Authentication Dialog Triggers on Connection**
    - Test that any state where wallet is connected but not authenticated triggers dialog
    - Generate random connection states and verify dialog behavior
    - **Validates: Requirements 3.1**
  
  - [ ] 3.6 Write property test for disconnect clearing auth
    - **Property 2: Disconnect Clears Authentication**
    - Test that any authenticated state clears token on disconnect
    - Generate random auth states and verify token clearing
    - **Validates: Requirements 3.2**

- [x] 4. Checkpoint - Verify core functionality
  - Ensure all tests pass
  - Manually test wallet connection flow
  - Verify AuthDialog appears and authentication works
  - Ask the user if questions arise

- [ ] 5. Create backward-compatible useWallet hook
  - [x] 5.1 Implement wagmi-based useWallet hook
    - Update `lib/hooks/useWallet.ts`
    - Import useAccount, useDisconnect, useSwitchChain, useWalletClient from wagmi
    - Map wagmi hooks to old interface (account, chainId, isConnected, disconnect, switchNetwork)
    - Integrate clearAuth on disconnect
    - Provide walletClient as signer and provider for compatibility
    - _Requirements: 6.1, 6.2_
  
  - [ ] 5.2 Write unit tests for useWallet hook
    - Test hook returns expected interface
    - Test disconnect clears auth
    - Test switchNetwork calls wagmi switchChain
    - _Requirements: 6.2_
  
  - [ ] 5.3 Write property test for backward compatibility
    - **Property 11: Backward Compatibility Interface**
    - Test that any component using old interface works with new implementation
    - Generate random wallet states and verify interface compatibility
    - **Validates: Requirements 6.2**

- [ ] 6. Implement network management features
  - [x] 6.1 Add unsupported network detection
    - Use useAccount hook to get current chain
    - Compare chain ID against configured chains
    - Display warning when on unsupported network
    - _Requirements: 4.2_
  
  - [x] 6.2 Implement network switching
    - Use useSwitchChain hook from wagmi
    - Handle switch requests in useWallet hook
    - Add error handling for switch failures
    - _Requirements: 4.4, 4.5_
  
  - [ ] 6.3 Write property test for unsupported network warning
    - **Property 7: Unsupported Network Warning**
    - Test that any unsupported chainId triggers warning
    - Generate random chainIds and verify warning behavior
    - **Validates: Requirements 4.2**
  
  - [ ] 6.4 Write property test for network switch requests
    - **Property 8: Network Switch Request**
    - Test that any network switch action calls wallet method
    - Generate random target chainIds and verify switch calls
    - **Validates: Requirements 4.4**

- [ ] 7. Customize RainbowKit theme
  - [x] 7.1 Create theme configuration
    - Create theme configuration in `lib/wagmi.ts` or separate theme file
    - Configure lightTheme and darkTheme from RainbowKit
    - Set accent colors to match brand
    - Configure border radius to medium
    - Set font stack to system
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [x] 7.2 Integrate theme with next-themes
    - Update RainbowKitProvider to use theme configuration
    - Ensure theme switches with next-themes provider
    - Test light and dark mode switching
    - _Requirements: 5.2, 5.3_
  
  - [x] 7.3 Verify responsive design
    - Test wallet modal on desktop, tablet, and mobile viewports
    - Ensure ConnectButton is responsive
    - Verify modal is usable on small screens
    - _Requirements: 5.5_
  
  - [ ] 7.4 Write property test for responsive rendering
    - **Property 14: Responsive Modal Rendering**
    - Test that any viewport size renders modal appropriately
    - Generate random viewport dimensions and verify usability
    - **Validates: Requirements 5.5, 8.5**

- [ ] 8. Implement comprehensive error handling
  - [x] 8.1 Add connection error handling
    - Handle no wallet installed scenario
    - Handle user rejection gracefully
    - Handle connection timeout
    - Display appropriate error messages
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [x] 8.2 Add network error handling
    - Handle unsupported chain errors
    - Handle switch rejection
    - Handle switch failures with specific messages
    - _Requirements: 7.3, 4.5_
  
  - [x] 8.3 Add authentication error handling
    - Handle challenge fetch failures
    - Handle signature rejection
    - Handle login failures
    - Provide retry options
    - _Requirements: 7.1, 7.2_
  
  - [x] 8.4 Add disconnection event handling
    - Listen for wallet disconnection events
    - Update UI state on disconnection
    - Clear authentication on disconnection
    - _Requirements: 7.5_
  
  - [ ] 8.5 Write property test for error message display
    - **Property 9: Error Message Display**
    - Test that any wallet operation error displays user-friendly message
    - Generate random error types and verify message display
    - **Validates: Requirements 7.1, 7.2, 7.3**
  
  - [ ] 8.6 Write property test for disconnection event handling
    - **Property 10: Disconnection Event Handling**
    - Test that any disconnection event updates UI state
    - Generate random disconnection scenarios and verify state updates
    - **Validates: Requirements 7.5**

- [ ] 9. Add mobile wallet support
  - [x] 9.1 Verify WalletConnect configuration
    - Ensure WalletConnect is included in connectors
    - Verify project ID is set correctly
    - Test QR code display for mobile wallets
    - _Requirements: 8.1, 8.2_
  
  - [x] 9.2 Test mobile wallet connections
    - Test WalletConnect QR code flow
    - Verify mobile wallet state synchronization
    - Test deep linking (if possible)
    - _Requirements: 8.2, 8.4_
  
  - [ ] 9.3 Write property test for WalletConnect QR display
    - **Property 12: WalletConnect QR Code Display**
    - Test that selecting WalletConnect displays QR code
    - Verify QR code is generated for any connection attempt
    - **Validates: Requirements 8.2**
  
  - [ ] 9.4 Write property test for mobile wallet state sync
    - **Property 13: Mobile Wallet State Synchronization**
    - Test that any mobile wallet state change synchronizes with app
    - Generate random state changes and verify synchronization
    - **Validates: Requirements 8.4**

- [x] 10. Checkpoint - Verify all features work
  - Ensure all tests pass
  - Manually test all wallet connection scenarios
  - Test on different browsers and devices
  - Verify error handling works correctly
  - Ask the user if questions arise

- [x] 11. Clean up legacy code
  - [x] 11.1 Remove custom wallet store
    - Delete or deprecate `stores/wallet.ts`
    - Remove all imports of useWalletStore
    - Verify no components use the old store
    - _Requirements: 6.3_
  
  - [x] 11.2 Remove direct window.ethereum access
    - Search codebase for window.ethereum usage
    - Replace with wagmi hooks where found
    - Remove event listeners for accountsChanged and chainChanged
    - _Requirements: 6.4_
  
  - [x] 11.3 Clean up Wallet component
    - Remove unused wallet connection code
    - Remove custom wallet UI elements
    - Simplify component to just ConnectButton and AuthDialog
    - _Requirements: 9.4_
  
  - [x] 11.4 Update TypeScript types
    - Ensure all components have proper types
    - Remove old wallet store types
    - Add JSDoc comments to custom hooks
    - Verify no TypeScript errors
    - _Requirements: 6.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 12. Add environment variable configuration
  - [x] 12.1 Set up WalletConnect project ID
    - Create account on WalletConnect Cloud
    - Generate project ID
    - Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to .env.local
    - Document in README or .env.example
    - _Requirements: 1.4_
  
  - [x] 12.2 Verify environment variables
    - Check NEXT_PUBLIC_BACKEND_DOMAIN is set
    - Verify all required env vars are documented
    - Test app with missing env vars (should show clear error)
    - _Requirements: 1.4_

- [ ] 13. Write additional property tests
  - [ ] 13.1 Write property test for network display
    - **Property 5: Network Display**
    - Test that any connected network displays its name
    - Generate random network configurations and verify display
    - **Validates: Requirements 2.3, 4.1**
  
  - [ ] 13.2 Write property test for ENS name resolution
    - **Property 6: ENS Name Resolution**
    - Test that any address with ENS name displays the name
    - Mock ENS resolution and verify display behavior
    - **Validates: Requirements 2.6**

- [ ] 14. Final testing and validation
  - [ ] 14.1 Run all unit tests
    - Execute test suite
    - Verify all tests pass
    - Check code coverage (aim for >80%)
    - _Requirements: All_
  
  - [ ] 14.2 Run all property tests
    - Execute property test suite with 100+ iterations
    - Verify all properties hold
    - Check for any edge cases found
    - _Requirements: All_
  
  - [x] 14.3 Manual testing checklist
    - Test wallet connection with MetaMask
    - Test wallet connection with WalletConnect
    - Test authentication flow end-to-end
    - Test network switching
    - Test disconnect and reconnect
    - Test on mobile device
    - Test light and dark themes
    - Test error scenarios
    - _Requirements: All_
  
  - [x] 14.4 Browser compatibility testing
    - Test on Chrome/Edge
    - Test on Firefox
    - Test on Safari
    - Test on mobile browsers
    - _Requirements: All_

- [x] 15. Final checkpoint - Ready for deployment
  - Ensure all tests pass
  - Verify no TypeScript errors
  - Verify no console errors or warnings
  - Confirm all requirements are met
  - Ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation with full test coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and integration points
- The implementation follows a phased approach: setup → migration → customization → cleanup → testing
- Backward compatibility is maintained through the useWallet hook wrapper
- The custom wallet store can be kept in git history for easy rollback if needed
