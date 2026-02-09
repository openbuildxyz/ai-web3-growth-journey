/**
 * RAILGUN Integration Types
 * Complete type definitions for privacy swap operations
 */

// ============================================================================
// Engine & POI Types
// ============================================================================

export type EngineStatus = 'uninitialized' | 'initializing' | 'ready' | 'error';

export interface EngineState {
  status: EngineStatus;
  error?: string;
  version?: string;
}

export interface POIStatus {
  isVerified: boolean;
  txid?: string;
  timestamp?: number;
  error?: string;
}

export interface POIConfig {
  poiNodes: string[];
  timeout: number;
}

// ============================================================================
// ZK Proof Types
// ============================================================================

export type ZKProofPhase =
  | 'generating_witness'
  | 'generating_proof'
  | 'verifying_proof'
  | 'complete';

export interface ZKProofProgress {
  phase: ZKProofPhase;
  progress: number; // 0-100
  message: string;
  startTime: number;
}

// ============================================================================
// Proxy & Relayer Types
// ============================================================================

export interface RelayerConfig {
  privateKey: string;
  rpcUrls: string[];
  fallbackRpcUrls: string[];
}

export interface RelayerState {
  address: string;
  balance: string;
  isReady: boolean;
}

// ============================================================================
// Swap Types
// ============================================================================

export type SwapPhase =
  | 'initializing'
  | 'shielding'
  | 'poi_verification'
  | 'swapping'
  | 'unshielding'
  | 'complete'
  | 'failed';

export interface SwapProgress {
  phase: SwapPhase;
  progress: number; // 0-100
  message: string;
  zkProofProgress?: ZKProofProgress;
  transactionHash?: string;
  details?: string;
}

export interface SwapResult {
  success: boolean;
  transactionHash?: string;
  amountOut?: string;
  error?: string;
  progress: SwapProgress[];
  // Additional fields for detailed transaction tracking
  shieldTxHash?: string;
  swapTxHash?: string;
  unshieldTxHash?: string;
}

export interface SwapQuote {
  amountIn: string;
  amountOut: string;
  minimumAmountOut: string;
  priceImpact: number;
  fee: string;
  route: string[];
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageBasisPoints: number;
  recipient?: string;
}

// ============================================================================
// Wallet Types
// ============================================================================

export interface RailgunWalletBalance {
  tokenAddress: string;
  balance: string;
  tokenSymbol?: string;
}

export interface RailgunWalletInfo {
  railgunAddress: string;
  balances: RailgunWalletBalance[];
  isInitialized: boolean;
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface ShieldParams {
  tokenAddress: string;
  amount: string;
  mnemonic: string;
  password: string;
}

export interface UnshieldParams {
  tokenAddress: string;
  amount: string;
  recipient: string;
  mnemonic: string;
  password: string;
}

export interface PrivateSwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageBasisPoints?: number;
  mnemonic: string;
  password: string;
  recipient?: string;
  // Additional properties for API compatibility
  railgunWalletID?: string;
  railgunAddress?: string;
  minAmountOut?: string;
  recipientAddress?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface SwapRequest {
  senderWalletID: string;
  senderEncryptionKey: string;
  senderRailgunAddress: string;
  userAddress: string;
  mnemonic: string;
  password: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  slippage: number;
  gasAbstraction: boolean;
  permitData?: string;
}

export interface SwapResponse {
  success: boolean;
  error?: string;
  shieldTxHash?: string;
  swapTxHash?: string;
  unshieldTxHash?: string;
  amountOut?: string;
}

export type SwapStep = SwapPhase;

export interface WalletCreateResponse {
  success: boolean;
  walletID?: string;
  railgunAddress?: string;
  encryptionKey?: string;
  error?: string;
}

// ============================================================================
// Private Transfer (shield → POI → unshield) - gas abstraction
// ============================================================================

export type GasAbstractionMethod = 'eip7702' | 'permit' | 'approved';

export interface PermitData {
  owner: string;
  spender: string;
  value: string;
  deadline: string;
  v: number;
  r: string;
  s: string;
}

export interface EIP7702Authorization {
  chainId: number;
  address: string;
  nonce: number;
  yParity: number;
  r: string;
  s: string;
}

export interface PrivateTransferParams {
  senderWalletID: string;
  senderEncryptionKey: string;
  senderRailgunAddress: string;
  recipientPublicAddress: string;
  tokenAddress: string;
  amount: bigint;
  userAddress: string;
  gasAbstraction: GasAbstractionMethod;
  permitData?: PermitData;
  eip7702Auth?: EIP7702Authorization;
}

export type PrivateTransferStep =
  | 'approving'
  | 'shielding'
  | 'waiting_poi'
  | 'generating_proof'
  | 'unshielding'
  | 'complete'
  | 'error';

export interface PrivateTransferProgress {
  step: PrivateTransferStep;
  progress: number;
  message: string;
  txHash?: string;
}

export interface PrivateTransferResult {
  success: boolean;
  shieldTxHash?: string;
  unshieldTxHash?: string;
  senderRailgunAddress?: string;
  error?: string;
}


