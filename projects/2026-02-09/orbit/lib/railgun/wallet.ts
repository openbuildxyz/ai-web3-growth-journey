/**
 * Server-side RAILGUN Wallet Service
 * Create wallet from mnemonic and cache for transfer (encryption key).
 */

import { NetworkName, NETWORK_CONFIG as RAILGUN_NETWORK_CONFIG } from '@railgun-community/shared-models';
import { createRailgunWallet, loadWalletByID, getRailgunAddress, pbkdf2 } from '@railgun-community/wallet';
import { railgunEngine } from './engine';

export interface RailgunWalletCredentials {
  walletID: string;
  railgunAddress: string;
  encryptionKey: string;
}

class RailgunWalletService {
  private static instance: RailgunWalletService | null = null;
  private walletCache = new Map<string, RailgunWalletCredentials>();

  private constructor() {}

  static getInstance(): RailgunWalletService {
    if (!RailgunWalletService.instance) {
      RailgunWalletService.instance = new RailgunWalletService();
    }
    return RailgunWalletService.instance;
  }

  async createWalletFromMnemonic(mnemonic: string, password: string): Promise<RailgunWalletCredentials> {
    if (!railgunEngine.isReady()) {
      throw new Error('RAILGUN engine not initialized');
    }

    const cacheKey = this.getCacheKey(mnemonic, password);
    const cached = this.walletCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const wordCount = mnemonic.trim().split(/\s+/).length;
    if (wordCount !== 12 && wordCount !== 24) {
      throw new Error(`Invalid mnemonic: expected 12 or 24 words, got ${wordCount}`);
    }

    const encryptionKey = await this.deriveEncryptionKey(password);
    const networkName = railgunEngine.getNetwork();
    const networkConfig = RAILGUN_NETWORK_CONFIG[networkName];
    const deploymentBlock = networkConfig?.deploymentBlock ?? 0;
    const creationBlockNumbers = { [networkName]: deploymentBlock } as Record<NetworkName, number>;

    const walletInfo = await createRailgunWallet(
      encryptionKey,
      mnemonic.trim(),
      creationBlockNumbers
    );

    if (!walletInfo?.id) {
      throw new Error('Failed to create wallet: ID missing');
    }

    const railgunAddress = getRailgunAddress(walletInfo.id) ?? '';
    const result: RailgunWalletCredentials = {
      walletID: walletInfo.id,
      railgunAddress,
      encryptionKey,
    };

    this.walletCache.set(cacheKey, result);
    return result;
  }

  getCachedWalletByID(walletID: string): RailgunWalletCredentials | null {
    for (const w of this.walletCache.values()) {
      if (w.walletID === walletID) return w;
    }
    return null;
  }

  async deriveEncryptionKey(password: string): Promise<string> {
    const passwordBytes = new TextEncoder().encode(password);
    const padLen = Math.max(0, 16 - passwordBytes.length);
    const paddedArray = Array.from(passwordBytes.slice(0, 16));
    for (let i = 0; i < padLen; i++) paddedArray.push(0);
    const saltHex = paddedArray.map((b: number) => b.toString(16).padStart(2, '0')).join('');
    return pbkdf2(password, saltHex, 100000);
  }

  private getCacheKey(mnemonic: string, password: string): string {
    const combined = mnemonic.trim() + '|' + password;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

export const railgunWallet = RailgunWalletService.getInstance();
