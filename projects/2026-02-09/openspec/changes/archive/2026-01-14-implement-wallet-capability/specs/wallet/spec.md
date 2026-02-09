## ADDED Requirements

### Requirement: Wallet Connection in Header Component
The Header component SHALL display wallet connection status and provide wallet connection functionality using the real wallet integration.

#### Scenario: Display disconnected wallet state
- **WHEN** the Header component renders and no wallet is connected
- **THEN** the wallet button displays "连接钱包" text
- **AND** the button uses the gradient variant styling
- **AND** clicking the button initiates the wallet connection flow

#### Scenario: Connect wallet from Header
- **WHEN** user clicks the "连接钱包" button in Header
- **THEN** the `connect()` function from `useWallet` hook is called
- **AND** if MetaMask or other Ethereum wallet is available, the connection request is initiated
- **AND** if wallet extension is not installed, an error toast is shown
- **AND** if user approves the connection, the wallet address is displayed in the button
- **AND** if user rejects the connection, an error toast is shown

#### Scenario: Display connected wallet state
- **WHEN** a wallet is successfully connected
- **THEN** the wallet button displays the truncated wallet address (e.g., "0x1234...5678")
- **AND** the button uses the outline variant styling
- **AND** the full address is truncated to show first 6 characters and last 4 characters with ellipsis

#### Scenario: Disconnect wallet from Header
- **WHEN** user clicks the wallet button while connected
- **THEN** the wallet is disconnected via `disconnect()` function
- **AND** the button reverts to "连接钱包" text and gradient variant
- **AND** wallet state is cleared from the store

#### Scenario: Wallet connection persistence
- **WHEN** user refreshes the page with a previously connected wallet
- **THEN** the `checkIsWalletConnected` function automatically checks for existing connection
- **AND** if wallet was previously connected and still authorized, the connection is restored
- **AND** the Header displays the connected wallet address

#### Scenario: Handle account changes
- **WHEN** user switches accounts in MetaMask while the app is open
- **THEN** the `handleAccountsChanged` event handler updates the displayed address
- **AND** the Header button reflects the new account address
- **AND** the signer and provider are reinitialized with the new account

#### Scenario: Handle network changes
- **WHEN** user switches networks in MetaMask while the app is open
- **THEN** the `handleChainChanged` event handler updates the chain ID
- **AND** a success toast is shown indicating the network change
- **AND** the signer and provider are reinitialized with the new network

#### Scenario: Mobile wallet button
- **WHEN** the Header component renders on mobile devices
- **THEN** the mobile menu includes a wallet button with the same functionality
- **AND** the wallet button displays the same connection state (connected/disconnected)
- **AND** clicking the button performs the same connect/disconnect actions as desktop

### Requirement: Wallet Integration Hook Usage
The Header component SHALL use the `useWallet` hook to access wallet functionality and state.

#### Scenario: Hook provides wallet state
- **WHEN** Header component uses `useWallet` hook
- **THEN** it receives `isConnected`, `account`, `connect`, `disconnect`, and other wallet-related functions
- **AND** `isConnected` is `true` when `account`, `provider`, and `signer` are all available
- **AND** `isConnected` is `false` when any of these are missing

#### Scenario: Hook manages event listeners
- **WHEN** Header component mounts
- **THEN** the `useWallet` hook automatically sets up event listeners for `accountsChanged` and `chainChanged`
- **AND** event listeners are cleaned up when component unmounts
- **AND** `checkIsWalletConnected` is called on mount to restore previous connection
