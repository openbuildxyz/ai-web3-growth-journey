/**
 * RAILGUN Relayer Service
 * Manages funded server wallet for gas abstraction
 */

import { ethers, Wallet } from 'ethers';
import { RelayerConfig, RelayerState } from './types';

export class RelayerService {
  private static instance: RelayerService;
  private wallet: Wallet | null = null;
  private provider: ethers.JsonRpcProvider | null = null;
  private config: RelayerConfig;

  private constructor() {
    this.config = {
      privateKey: process.env.RELAYER_PRIVATE_KEY || '',
      rpcUrls: process.env.RELAYER_RPC_URL?.split(',') || [],
      fallbackRpcUrls: process.env.RELAYER_FALLBACK_RPC_URLS?.split(',') || [],
    };
  }

  static getInstance(): RelayerService {
    if (!RelayerService.instance) {
      RelayerService.instance = new RelayerService();
    }
    return RelayerService.instance;
  }

  async initialize(): Promise<void> {
    if (!this.config.privateKey) {
      throw new Error('RELAYER_PRIVATE_KEY environment variable is required');
    }

    // Try each RPC URL until one works
    const allUrls = [...this.config.rpcUrls, ...this.config.fallbackRpcUrls];

    for (const rpcUrl of allUrls) {
      try {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new Wallet(this.config.privateKey, this.provider);

        // Verify connection
        await this.provider.getNetwork();
        console.log('[RELAYER] Connected to RPC:', rpcUrl);
        break;
      } catch (error) {
        console.warn('[RELAYER] Failed to connect to RPC:', rpcUrl);
        continue;
      }
    }

    if (!this.wallet || !this.provider) {
      throw new Error('Failed to connect to any RPC URL');
    }
  }

  getAddress(): string {
    if (!this.wallet) {
      throw new Error('Relayer not initialized');
    }
    return this.wallet.address;
  }

  async getState(): Promise<RelayerState> {
    if (!this.wallet || !this.provider) {
      return {
        address: ethers.ZeroAddress,
        balance: '0',
        isReady: false,
      };
    }

    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return {
        address: this.wallet.address,
        balance: balance.toString(),
        isReady: true,
      };
    } catch (error) {
      return {
        address: this.wallet.address,
        balance: '0',
        isReady: false,
      };
    }
  }

  async broadcastTransaction(signedTx: string): Promise<ethers.TransactionResponse> {
    if (!this.provider) {
      throw new Error('Relayer not initialized');
    }

    try {
      const tx = await this.provider.broadcastTransaction(signedTx);
      console.log('[RELAYER] Transaction broadcasted:', tx.hash);
      return tx;
    } catch (error) {
      console.error('[RELAYER] Broadcast failed:', error);
      throw error;
    }
  }

  async estimateGas(tx: { to: string; data: string; value?: bigint }): Promise<bigint> {
    if (!this.provider || !this.wallet) {
      throw new Error('Relayer not initialized');
    }

    try {
      const gasLimit = await this.provider.estimateGas({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: tx.value || 0n,
        from: this.wallet.address as `0x${string}`,
      });
      return gasLimit;
    } catch (error) {
      console.error('[RELAYER] Gas estimation failed:', error);
      throw error;
    }
  }

  async getGasPrice(): Promise<bigint> {
    if (!this.provider) {
      throw new Error('Relayer not initialized');
    }

    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice || 0n;
    } catch (error) {
      console.error('[RELAYER] Failed to get gas price:', error);
      // Fallback to a reasonable default
      return 10000000000n; // 10 gwei
    }
  }
}

// Export singleton instance
export const relayerService = RelayerService.getInstance();
