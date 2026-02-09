/**
 * Shared utility functions
 */

/**
 * Format an ENS name to ensure it has the correct suffix
 */
export function formatEnsName(name: string, parentDomain = 'uniforum.eth'): string {
  const cleanName = name.toLowerCase().replace(/\.uniforum\.eth$/, '');
  return `${cleanName}.${parentDomain}`;
}

/**
 * Extract the subdomain from a full ENS name
 */
export function extractSubdomain(fullEnsName: string): string {
  return fullEnsName.replace(/\.uniforum\.eth$/, '');
}

/**
 * Validate ENS subdomain format
 */
export function isValidSubdomain(name: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) && name.length >= 3 && name.length <= 32;
}

/**
 * Truncate an Ethereum address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a BigInt wei value to ETH with specified decimals
 */
export function formatEth(wei: bigint | string, decimals = 4): string {
  const weiBigInt = typeof wei === 'string' ? BigInt(wei) : wei;
  const eth = Number(weiBigInt) / 1e18;
  return eth.toFixed(decimals);
}

/**
 * Parse ETH string to wei BigInt
 */
export function parseEth(eth: string): bigint {
  const [whole, fraction = ''] = eth.split('.');
  const paddedFraction = fraction.padEnd(18, '0').slice(0, 18);
  return BigInt(whole + paddedFraction);
}

/**
 * Calculate consensus percentage
 */
export function calculateConsensusPercentage(agreeCount: number, totalVotes: number): number {
  if (totalVotes === 0) return 0;
  return agreeCount / totalVotes;
}

/**
 * Check if consensus is reached
 */
export function isConsensusReached(
  agreeCount: number,
  totalVotes: number,
  threshold: number
): boolean {
  return calculateConsensusPercentage(agreeCount, totalVotes) >= threshold;
}

/**
 * Format a timestamp to relative time
 */
export function formatRelativeTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString();
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(baseDelayMs * Math.pow(2, i));
    }
  }
  throw new Error('Max retries exceeded');
}
