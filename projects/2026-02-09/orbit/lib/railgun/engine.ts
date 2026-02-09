/**
 * RAILGUN Engine Service
 * Singleton service managing RAILGUN engine lifecycle.
 * No @railgun-community imports here so /api/railgun/init runs in Node without fetch/SDK issues.
 */

import { EngineState, POIConfig } from './types';

// Sepolia network name; must match NetworkName.EthereumSepolia from shared-models
const SEPOLIA_NETWORK_NAME = 'Ethereum_Sepolia';

// Default POI nodes for Sepolia testnet
const DEFAULT_POI_NODES = [
  'https://ppoi-agg.horsewithsixlegs.xyz',
];

export class RailgunEngine {
  private static instance: RailgunEngine;
  private status: EngineState = {
    status: 'uninitialized',
  };
  private isLoaded = false;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): RailgunEngine {
    if (!RailgunEngine.instance) {
      RailgunEngine.instance = new RailgunEngine();
    }
    return RailgunEngine.instance;
  }

  async initialize(poiConfig?: POIConfig): Promise<void> {
    if (this.status.status === 'ready' || this.isLoaded) {
      console.log('[RAILGUN] Engine already initialized');
      return;
    }

    try {
      console.log('[RAILGUN] Initializing engine...');
      this.status = { status: 'initializing' };

      // Load provider with fallback RPCs
      const rpcUrl = process.env.RAILGUN_RPC_URL || 'https://sepolia.infura.io/v3/';
      const fallbackRpcUrl = process.env.RAILGUN_FALLBACK_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

      // In production, this would call:
      // await loadProvider(SEPOLIA_NETWORK_NAME, rpcUrl, false);

      // For POC, just mark as ready
      this.isLoaded = true;
      this.status = {
        status: 'ready',
        version: '10.8.3',
      };

      console.log('[RAILGUN] Engine initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.status = {
        status: 'error',
        error: errorMessage,
      };
      console.error('[RAILGUN] Initialization failed:', error);
      throw error;
    }
  }

  getStatus(): EngineState {
    return this.status;
  }

  isReady(): boolean {
    return this.status.status === 'ready' && this.isLoaded;
  }

  // Helper methods for compatibility
  getNetwork() {
    return SEPOLIA_NETWORK_NAME;
  }

  getTxidVersion() {
    return 2; // Latest txid version
  }
}

// Export singleton instance
export const railgunEngine = RailgunEngine.getInstance();
