# Design Document: RainbowKit Wallet Integration

## Overview

This design document outlines the technical approach for integrating RainbowKit v2.2.10 with wagmi v3.3.4 into the agent-market-fe Next.js application. The integration will replace the custom wallet connection implementation with RainbowKit's professional UI components while maintaining the existing authentication flow.

The current implementation uses a custom Zustand store (`useWalletStore`) with direct `window.ethereum` access. This will be replaced with wagmi hooks and RainbowKit components, providing better wallet support, improved UX, and reduced maintenance burden.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Root                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              QueryClientProvider                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │           WagmiProvider                          │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │      RainbowKitProvider                   │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐  │  │  │  │
│  │  │  │  │         App Components              │  │  │  │  │
│  │  │  │  │  - Header (ConnectButton)           │  │  │  │  │
│  │  │  │  │  - AuthDialog (wagmi hooks)         │  │  │  │  │
│  │  │  │  │  - Other components                 │  │  │  │  │
│  │  │  │  └─────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action → ConnectButton → RainbowKit Modal → Wallet Selection
                                                         ↓
                                                   wagmi hooks
                                                         ↓
                                              Update connection state
                                                         ↓
                                              Trigger AuthDialog
                                                         ↓
                                              Sign message (wagmi)
                                                         ↓
                                              Backend auth → Token
                                                         ↓
                                              Store in Auth_Store
```

## Components and Interfaces

### 1. Wagmi Configuration (`lib/wagmi.ts`)

**Purpose**: Configure wagmi with chains, transports, and connectors.

**Configuration**:
```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Agent Market',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia],
  ssr: true, // Enable for Next.js SSR
})
```

**Key Decisions**:
- Use `getDefaultConfig` for automatic connector setup (MetaMask, WalletConnect, Coinbase, Rainbow)
- Configure Sepolia as the only chain (testnet requirement)
- Enable SSR mode for Next.js compatibility
- WalletConnect Project ID required for mobile wallet support

### 2. Provider Setup (`app/providers.tsx`)

**Purpose**: Wrap the application with necessary providers in the correct order.

**Structure**:
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/wagmi'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
```

**Key Decisions**:
- Create providers component for client-side rendering
- Order matters: QueryClient → Wagmi → RainbowKit
- Single QueryClient instance for the entire app

### 3. Updated Wallet Component (`components/business/Header/components/Wallet.tsx`)

**Purpose**: Replace custom wallet UI with RainbowKit's ConnectButton.

**Implementation**:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import AuthDialog from '../../AuthDialog'
import { useAuthStore } from '@/stores/auth'

export default function Wallet() {
  const { isAuthenticated } = useAuthStore()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { isConnected, address } = useAccount()

  // Show auth dialog when connected but not authenticated
  useEffect(() => {
    if (isConnected && !isAuthenticated()) {
      setShowAuthDialog(true)
    }
  }, [isConnected, isAuthenticated])

  return (
    <>
      <ConnectButton 
        chainStatus="icon"
        showBalance={false}
        accountStatus="address"
      />
      
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </>
  )
}
```

**Key Decisions**:
- Use `useAccount` hook instead of custom wallet store
- Keep AuthDialog integration logic
- Configure ConnectButton to show network icon and address
- Hide balance for cleaner UI

### 4. Updated AuthDialog (`components/business/AuthDialog.tsx`)

**Purpose**: Update to use wagmi hooks instead of custom wallet store.

**Changes**:
```typescript
import { useAccount, useSignMessage } from 'wagmi'

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleLogin = async () => {
    if (!address) {
      toast.error('请先连接钱包')
      return
    }

    setIsAuthenticating(true)
    try {
      const BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN

      // 1. Get challenge
      const challengeRes = await fetch(`${BACKEND_DOMAIN}/auth/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const { message, nonce } = await challengeRes.json()

      // 2. Sign message using wagmi
      const signature = await signMessageAsync({ message })

      // 3. Login
      const loginRes = await fetch(`${BACKEND_DOMAIN}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, nonce }),
      })

      const loginData = await loginRes.json()
      const token = loginData.access_token || loginData.token || loginData.jwt

      if (!token) {
        throw new Error('登录失败：未获取到 Token')
      }

      setAuth(token, address)
      toast.success('登录成功')
      onClose()
    } catch (error: any) {
      console.error('Authentication failed:', error)
      toast.error(error.message || '身份认证失败')
    } finally {
      setIsAuthenticating(false)
    }
  }

  // ... rest of component
}
```

**Key Decisions**:
- Replace `useWallet` with `useAccount` and `useSignMessage`
- Use `signMessageAsync` for message signing
- Maintain existing authentication flow logic
- Keep error handling and loading states

### 5. Updated useWallet Hook (`lib/hooks/useWallet.ts`)

**Purpose**: Provide backward compatibility wrapper around wagmi hooks.

**Implementation**:
```typescript
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { useWalletClient } from 'wagmi'
import { useAuthStore } from '@/stores/auth'

export default function useWallet() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { data: walletClient } = useWalletClient()
  const { clearAuth } = useAuthStore()

  const disconnect = () => {
    wagmiDisconnect()
    clearAuth()
  }

  const switchNetwork = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId })
      return true
    } catch (error) {
      console.error('Failed to switch network:', error)
      return false
    }
  }

  return {
    account: address,
    chainId: chain?.id ?? null,
    isConnected,
    disconnect,
    switchNetwork,
    signer: walletClient, // For backward compatibility
    provider: walletClient, // For backward compatibility
  }
}
```

**Key Decisions**:
- Maintain same interface as old useWallet hook
- Map wagmi hooks to expected return values
- Clear auth on disconnect
- Provide walletClient as both signer and provider for compatibility

### 6. RainbowKit Theme Configuration

**Purpose**: Customize RainbowKit appearance to match application design.

**Implementation** (in `lib/wagmi.ts` or separate theme file):
```typescript
import { darkTheme, lightTheme } from '@rainbow-me/rainbowkit'

export const rainbowKitTheme = {
  lightMode: lightTheme({
    accentColor: '#your-brand-color',
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
  }),
  darkMode: darkTheme({
    accentColor: '#your-brand-color',
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
  }),
}
```

**Usage in Provider**:
```typescript
<RainbowKitProvider theme={rainbowKitTheme}>
  {children}
</RainbowKitProvider>
```

**Key Decisions**:
- Support both light and dark modes
- Use medium border radius for modern look
- System font stack for native feel
- Match accent color to brand

## Data Models

### Wagmi Config Type

```typescript
import { Config } from 'wagmi'

// Generated by getDefaultConfig
type WagmiConfig = Config
```

### Account State (from wagmi)

```typescript
interface AccountState {
  address?: `0x${string}`
  isConnected: boolean
  isConnecting: boolean
  isDisconnected: boolean
  isReconnecting: boolean
  status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting'
  chain?: Chain
}
```

### Chain Type (from wagmi)

```typescript
interface Chain {
  id: number
  name: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: {
    default: { http: string[] }
    public: { http: string[] }
  }
  blockExplorers?: {
    default: { name: string; url: string }
  }
}
```

### Auth Store (unchanged)

```typescript
interface AuthState {
  token: string | null
  address: string | null
  setAuth: (token: string, address: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before writing the correctness properties, let me analyze the acceptance criteria from the requirements document.



### Property 1: Authentication Dialog Triggers on Connection

*For any* wallet connection state where the wallet is connected but the user is not authenticated, the AuthDialog should automatically be displayed.

**Validates: Requirements 3.1**

### Property 2: Disconnect Clears Authentication

*For any* authenticated state, when the user disconnects their wallet, the authentication token should be cleared from storage.

**Validates: Requirements 3.2**

### Property 3: Authentication Flow Sequence

*For any* authentication attempt, the system should follow the correct sequence: fetch challenge from backend → sign message with wallet → submit signature to backend → receive and store token.

**Validates: Requirements 3.4**

### Property 4: Connected Address Display

*For any* connected wallet address, the ConnectButton should display the address in a truncated format (e.g., "0x1234...5678").

**Validates: Requirements 2.2**

### Property 5: Network Display

*For any* connected network, the ConnectButton should display the network name.

**Validates: Requirements 2.3, 4.1**

### Property 6: ENS Name Resolution

*For any* wallet address that has an associated ENS name, the system should display the ENS name instead of the raw address.

**Validates: Requirements 2.6**

### Property 7: Unsupported Network Warning

*For any* network connection where the chainId is not in the configured chains list, the system should display a warning and prompt the user to switch networks.

**Validates: Requirements 4.2**

### Property 8: Network Switch Request

*For any* user-initiated network switch action, the system should call the wallet's chain switching method with the target chainId.

**Validates: Requirements 4.4**

### Property 9: Error Message Display

*For any* wallet operation error (connection failure, rejection, network switch failure), the system should display a user-friendly error message to the user.

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 10: Disconnection Event Handling

*For any* wallet disconnection event (user-initiated or wallet-initiated), the UI state should update to reflect the disconnected status.

**Validates: Requirements 7.5**

### Property 11: Backward Compatibility Interface

*For any* component using the old useWallet hook interface, the new wagmi-based implementation should provide the same return values and methods (account, chainId, isConnected, disconnect, switchNetwork).

**Validates: Requirements 6.2**

### Property 12: WalletConnect QR Code Display

*For any* mobile user selecting WalletConnect as their connection method, the system should display a QR code for wallet scanning.

**Validates: Requirements 8.2**

### Property 13: Mobile Wallet State Synchronization

*For any* mobile wallet connection state change (connecting, connected, disconnected), the application state should synchronize and reflect the current status.

**Validates: Requirements 8.4**

### Property 14: Responsive Modal Rendering

*For any* viewport size (desktop, tablet, mobile), the RainbowKit wallet modal should render appropriately and remain usable.

**Validates: Requirements 5.5, 8.5**

## Error Handling

### Error Categories

1. **Connection Errors**
   - No wallet installed → Display installation prompt with links to popular wallets
   - User rejects connection → Close modal gracefully, no error toast
   - Connection timeout → Display retry option with clear message
   - Network error → Display network connectivity message

2. **Network Errors**
   - Unsupported chain → Display chain switch prompt with supported chains
   - Switch rejected → Keep current chain, display cancellation message
   - Switch failed → Display specific error from wallet

3. **Authentication Errors**
   - Challenge fetch failed → Display backend connectivity error
   - Signature rejected → Close dialog, allow retry
   - Login failed → Display authentication error with retry option
   - Token storage failed → Display critical error, suggest browser check

4. **State Errors**
   - Wallet disconnected during auth → Close dialog, clear state
   - Chain changed during auth → Restart auth flow with new chain
   - Multiple wallets detected → Let RainbowKit handle selection

### Error Handling Strategy

**Graceful Degradation**:
- Never crash the application on wallet errors
- Always provide clear user feedback
- Offer actionable next steps
- Log errors for debugging

**User Experience**:
- Use toast notifications for transient errors
- Use modal dialogs for critical errors requiring action
- Provide "Try Again" buttons for recoverable errors
- Include help links for complex issues

**Implementation Pattern**:
```typescript
try {
  await walletOperation()
} catch (error) {
  if (error.code === 4001) {
    // User rejected - silent handling
    return
  }
  
  if (error.code === -32002) {
    toast.error('请在钱包中确认待处理的请求')
    return
  }
  
  // Generic error
  console.error('Wallet operation failed:', error)
  toast.error(error.message || '操作失败，请重试')
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** - Focus on:
- Configuration validation (wagmi config, RainbowKit setup)
- Component rendering (ConnectButton, AuthDialog)
- Hook behavior (useWallet, useAccount)
- Integration points (provider hierarchy)
- Edge cases (no wallet, unsupported network)
- Error conditions (connection failures, rejections)

**Property Tests** - Focus on:
- Universal properties across all wallet addresses
- State transitions (connected → authenticated → disconnected)
- Error handling across all error types
- UI behavior across all viewport sizes
- Network switching across all supported chains

### Testing Framework

**Unit Testing**:
- Framework: Jest + React Testing Library
- Mocking: Mock wagmi hooks and RainbowKit components
- Coverage: Aim for >80% code coverage

**Property-Based Testing**:
- Framework: fast-check (TypeScript property testing library)
- Configuration: Minimum 100 iterations per property test
- Tagging: Each test references its design property

### Property Test Configuration

Each property test must:
1. Run minimum 100 iterations
2. Include a comment tag: `// Feature: rainbowkit-wallet-integration, Property N: [property text]`
3. Reference the design document property number
4. Test the universal quantification ("for all" statement)

Example property test structure:
```typescript
import fc from 'fast-check'

// Feature: rainbowkit-wallet-integration, Property 4: Connected Address Display
describe('Property 4: Connected Address Display', () => {
  it('should display any connected address in truncated format', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 40, maxLength: 40 }), // Generate random addresses
        (address) => {
          const fullAddress = `0x${address}`
          const displayed = truncateAddress(fullAddress)
          
          // Property: truncated format should be "0x....{last4}"
          expect(displayed).toMatch(/^0x[0-9a-fA-F]{4}\.\.\.\.?[0-9a-fA-F]{4}$/)
          expect(displayed.length).toBeLessThan(fullAddress.length)
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Test Organization

```
tests/
├── unit/
│   ├── components/
│   │   ├── Wallet.test.tsx
│   │   └── AuthDialog.test.tsx
│   ├── hooks/
│   │   └── useWallet.test.ts
│   └── config/
│       └── wagmi.test.ts
└── properties/
    ├── auth-flow.property.test.ts
    ├── wallet-state.property.test.ts
    ├── network-management.property.test.ts
    └── error-handling.property.test.ts
```

### Key Test Scenarios

**Unit Test Examples**:
1. Wagmi config includes Sepolia chain
2. Providers are in correct order (QueryClient → Wagmi → RainbowKit)
3. ConnectButton renders when wallet is disconnected
4. AuthDialog opens when wallet connects but not authenticated
5. Disconnect clears auth token
6. useWallet hook returns expected interface

**Property Test Examples**:
1. Any wallet address displays in truncated format
2. Any authentication flow follows correct sequence
3. Any network switch error displays message
4. Any disconnection event updates UI state
5. Any viewport size renders modal correctly

### Integration Testing

While not part of the core testing strategy, integration tests should verify:
- End-to-end wallet connection flow
- Authentication with backend
- Network switching
- Mobile wallet connection via WalletConnect

These can be implemented using Playwright or Cypress for E2E testing.

## Migration Plan

### Phase 1: Setup and Configuration
1. Create wagmi configuration file
2. Create providers component
3. Add providers to app layout
4. Verify no runtime errors

### Phase 2: Component Migration
1. Update Wallet component to use ConnectButton
2. Update AuthDialog to use wagmi hooks
3. Update useWallet hook to wrap wagmi hooks
4. Test each component individually

### Phase 3: Theme Customization
1. Configure RainbowKit theme
2. Test light and dark modes
3. Verify responsive behavior
4. Adjust styling as needed

### Phase 4: Cleanup
1. Remove custom wallet store
2. Remove direct window.ethereum access
3. Remove unused wallet connection code
4. Update imports throughout codebase

### Phase 5: Testing and Validation
1. Write unit tests
2. Write property tests
3. Perform manual testing
4. Fix any issues found

### Rollback Plan

If critical issues are discovered:
1. Revert provider changes in app layout
2. Restore custom Wallet component
3. Restore custom wallet store
4. Restore direct window.ethereum access

The custom implementation should be kept in git history for easy rollback.

## Dependencies

### Required Packages (Already Installed)
- `@rainbow-me/rainbowkit@^2.2.10`
- `wagmi@^3.3.4`
- `viem@^2.44.4`
- `@tanstack/react-query@^5.90.16`

### Environment Variables Required
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect Cloud project ID (obtain from https://cloud.walletconnect.com)
- `NEXT_PUBLIC_BACKEND_DOMAIN` - Backend API URL (already exists)

### Peer Dependencies
- `react@19.2.3`
- `react-dom@19.2.3`
- `next@16.1.1`

## Security Considerations

### Message Signing
- Never sign arbitrary messages from untrusted sources
- Always display message content to users before signing
- Validate message format matches expected challenge format
- Use nonce to prevent replay attacks

### Token Storage
- Store JWT tokens in memory or secure storage
- Never expose tokens in URLs or logs
- Implement token expiration and refresh
- Clear tokens on logout/disconnect

### Network Security
- Only connect to trusted RPC endpoints
- Validate chain IDs match expected networks
- Warn users about unsupported networks
- Use HTTPS for all backend communication

### Wallet Permissions
- Request minimal permissions needed
- Explain why permissions are needed
- Handle permission rejections gracefully
- Never store private keys or mnemonics

## Performance Considerations

### Bundle Size
- RainbowKit adds ~150KB to bundle (gzipped)
- wagmi adds ~50KB to bundle (gzipped)
- Consider code splitting for wallet components
- Lazy load RainbowKit modal

### RPC Calls
- Use public RPC for development
- Use private RPC (Alchemy/Infura) for production
- Implement request caching where appropriate
- Handle rate limiting gracefully

### State Management
- wagmi handles wallet state efficiently
- React Query caches RPC responses
- Minimize unnecessary re-renders
- Use React.memo for expensive components

## Accessibility

### Keyboard Navigation
- ConnectButton is keyboard accessible
- Modal can be closed with Escape key
- All interactive elements are focusable
- Tab order is logical

### Screen Readers
- Proper ARIA labels on buttons
- Announce connection state changes
- Describe wallet options clearly
- Provide text alternatives for icons

### Visual Accessibility
- Sufficient color contrast
- Clear focus indicators
- Readable font sizes
- Support for reduced motion

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Wallet Compatibility
- MetaMask (browser extension and mobile)
- WalletConnect (all compatible wallets)
- Coinbase Wallet (browser extension and mobile)
- Rainbow Wallet (mobile)
- Trust Wallet (mobile)
- Any wallet supporting WalletConnect v2

## Future Enhancements

### Potential Improvements
1. Add more wallet connectors (Ledger, Trezor)
2. Implement account switching UI
3. Add transaction history display
4. Implement gas price estimation
5. Add multi-chain support (mainnet, other testnets)
6. Implement wallet analytics
7. Add custom wallet branding
8. Implement session persistence across tabs

### Technical Debt
- Consider migrating to SIWE (Sign-In with Ethereum) standard
- Evaluate need for custom RPC provider
- Consider implementing wallet connection analytics
- Evaluate performance optimizations for mobile

## References

- [RainbowKit Documentation](https://rainbowkit.com/docs/introduction)
- [wagmi Documentation](https://wagmi.sh)
- [viem Documentation](https://viem.sh)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [Ethereum Provider API](https://eips.ethereum.org/EIPS/eip-1193)
