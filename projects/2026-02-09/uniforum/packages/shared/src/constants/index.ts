/**
 * Shared constants
 */

// Chain IDs
export const CHAIN_IDS = {
  UNICHAIN_MAINNET: 130,
  UNICHAIN_SEPOLIA: 1301,
  ETHEREUM_MAINNET: 1,
  ETHEREUM_SEPOLIA: 11155111,
} as const;

// Contract addresses (Unichain)
export const UNICHAIN_CONTRACTS = {
  // Uniswap v4 contracts on Unichain Sepolia
  POOL_MANAGER: '0x...' as const, // TODO: Add actual address
  UNIVERSAL_ROUTER: '0x...' as const,
  POSITION_MANAGER: '0x...' as const,
} as const;

// Common token addresses (Unichain Sepolia)
export const TOKENS = {
  WETH: '0x...' as const,
  USDC: '0x...' as const,
  USDT: '0x...' as const,
  WBTC: '0x...' as const,
} as const;

const ENV_ENS_GATEWAY_URL =
  (typeof process !== 'undefined' &&
    (process.env.NEXT_PUBLIC_ENS_GATEWAY_URL ||
      process.env.ENS_GATEWAY_URL ||
      process.env.ENS_CCIP_GATEWAY_URL)) ||
  undefined;

// ENS
export const ENS_CONFIG = {
  PARENT_DOMAIN: 'uniforum.eth',
  GATEWAY_URL: ENV_ENS_GATEWAY_URL || 'https://api-uniforum.up.railway.app/v1/ens',
} as const;

// Consensus
export const CONSENSUS_CONFIG = {
  DEFAULT_QUORUM_THRESHOLD: 0.6,
  MIN_PARTICIPANTS: 3,
  DEFAULT_TIMEOUT_MINUTES: 30,
  MAX_TIMEOUT_MINUTES: 1440, // 24 hours
} as const;

const ENV_API_BASE_URL =
  (typeof process !== 'undefined' &&
    (process.env.NEXT_PUBLIC_API_URL || process.env.UNIFORUM_API_URL)) ||
  undefined;

const DEFAULT_API_BASE_URL = 'https://api-uniforum.up.railway.app';
const API_BASE_URL = ENV_API_BASE_URL || DEFAULT_API_BASE_URL;
const WS_BASE_URL = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');

// API
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  WS_URL: `${WS_BASE_URL}/v1/ws`,
} as const;

// Agent
export const AGENT_CONFIG = {
  MIN_ETH_FUNDING: '0.1', // ETH
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 32,
  MAX_EXPERTISE_LENGTH: 2000,
} as const;

// Allowed Eliza plugins for uploaded agents
export const AGENT_PLUGIN_ALLOWLIST = [
  '@elizaos/plugin-node',
  '@elizaos/plugin-openai',
  '@uniforum/plugin-uniswap',
  '@uniforum/plugin-ens',
  '@uniforum/plugin-forum',
] as const;

export type AgentPluginAllowlist = (typeof AGENT_PLUGIN_ALLOWLIST)[number];

// Pool identifiers (human-readable)
export const COMMON_POOLS = [
  'ETH-USDC',
  'ETH-USDT',
  'WBTC-ETH',
  'USDC-USDT',
  'ETH-DAI',
] as const;

export type CommonPool = (typeof COMMON_POOLS)[number];
