/**
 * Server-side RAILGUN Engine Service
 * Real engine using @railgun-community/wallet (artifacts, loadProvider, snarkjs).
 */

import {
  NetworkName,
  TXIDVersion,
  FallbackProviderJsonConfig,
  NETWORK_CONFIG as RAILGUN_NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import {
  startRailgunEngine,
  stopRailgunEngine,
  getProver,
  loadProvider,
  SnarkJSGroth16,
  ArtifactStore,
  type Proof,
} from '@railgun-community/wallet';
import { groth16 } from 'snarkjs';
import fs from 'fs';
import path from 'path';
import type { AbstractLevelDOWN } from 'abstract-leveldown';
import type { EngineState } from './types';

const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

const NETWORK_NAME = NetworkName.EthereumSepolia;
const RPC_URL = process.env.RAILGUN_RPC_URL || 'https://sepolia.infura.io/v3/2ede8e829bdc4f709b22c9dcf1184009';
const FALLBACK_RPC_URL = process.env.RAILGUN_FALLBACK_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const EXTRA_RPC_URLS = process.env.RAILGUN_EXTRA_RPC_URLS
  ? process.env.RAILGUN_EXTRA_RPC_URLS.split(',').map((u) => u.trim()).filter(Boolean)
  : [];
const POI_NODES = ['https://ppoi-agg.horsewithsixlegs.xyz'];

class RailgunEngineService {
  private static instance: RailgunEngineService | null = null;
  private state: EngineState = { status: 'uninitialized' };
  private db: AbstractLevelDOWN | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): RailgunEngineService {
    if (!RailgunEngineService.instance) {
      RailgunEngineService.instance = new RailgunEngineService();
    }
    return RailgunEngineService.instance;
  }

  getStatus(): EngineState {
    return { ...this.state };
  }

  async initialize(): Promise<void> {
    if (this.state.status === 'ready') return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    this.state = { status: 'initializing' };

    try {
      console.log('[RAILGUN Engine] Initializing...');

      const artifactsDir = isServerless ? '/tmp/railgun-artifacts' : path.join(process.cwd(), 'artifacts');
      const inMemoryArtifacts = new Map<string, Buffer | Uint8Array>();

      try {
        if (!fs.existsSync(artifactsDir)) {
          fs.mkdirSync(artifactsDir, { recursive: true });
        }
      } catch {
        console.log('[RAILGUN Engine] Could not create artifacts directory, using in-memory only');
      }

      const artifactStore = new ArtifactStore(
        async (filePath: string) => {
          const cached = inMemoryArtifacts.get(filePath);
          if (cached) return cached instanceof Buffer ? cached : Buffer.from(cached);
          const fullPath = path.join(artifactsDir, filePath);
          const data = await fs.promises.readFile(fullPath);
          inMemoryArtifacts.set(filePath, data);
          return data;
        },
        async (dir: string, filePath: string, item: string | Uint8Array) => {
          const buf = typeof item === 'string' ? Buffer.from(item) : item;
          inMemoryArtifacts.set(filePath, buf);
          try {
            const fullPath = path.join(artifactsDir, filePath);
            await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.promises.writeFile(fullPath, buf);
          } catch {
            console.log('[RAILGUN Engine] Could not persist artifact to filesystem');
          }
        },
        async (filePath: string) => {
          if (inMemoryArtifacts.has(filePath)) return true;
          try {
            return fs.existsSync(path.join(artifactsDir, filePath));
          } catch {
            return false;
          }
        }
      );

      // Use memdown only (leveldown has no native build for darwin/arm64 Node 22 in many envs)
      const useMemdown = async (): Promise<AbstractLevelDOWN> => {
        const memdown = (await import('memdown')).default as () => AbstractLevelDOWN;
        return memdown();
      };
      const db = await useMemdown();
      this.db = db;

      await startRailgunEngine(
        'Orbit',
        this.db,
        false,
        artifactStore,
        false,
        false,
        POI_NODES
      );

      const snarkjsAdapter: SnarkJSGroth16 = {
        fullProve: async (formattedInputs, wasm, zkey, logger) =>
          groth16.fullProve(formattedInputs, wasm, zkey, logger) as Promise<{ proof: Proof; publicSignals: string[] }>,
        verify: (vkey: unknown, publicSignals: string[], proof: Proof) =>
          groth16.verify(vkey, publicSignals, proof),
      };
      getProver().setSnarkJSGroth16(snarkjsAdapter);

      const networkConfig = RAILGUN_NETWORK_CONFIG[NETWORK_NAME];
      const providers: FallbackProviderJsonConfig['providers'] = [
        { provider: RPC_URL, priority: 3, weight: 2, maxLogsPerBatch: 1 },
        { provider: FALLBACK_RPC_URL, priority: 2, weight: 1, maxLogsPerBatch: 1 },
        ...EXTRA_RPC_URLS.map((url) => ({ provider: url, priority: 2, weight: 1, maxLogsPerBatch: 1 })),
      ];
      const providerConfig: FallbackProviderJsonConfig = {
        chainId: networkConfig.chain.id,
        providers,
      };

      await loadProvider(providerConfig, NETWORK_NAME, 1000 * 60 * 5);

      this.state = { status: 'ready', version: '10.8.3' };
      console.log('[RAILGUN Engine] Initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state = { status: 'error', error: errorMessage };
      console.error('[RAILGUN Engine] Initialization failed:', error);
      throw error;
    } finally {
      this.initPromise = null;
    }
  }

  isReady(): boolean {
    return this.state.status === 'ready';
  }

  getNetwork(): NetworkName {
    return NETWORK_NAME;
  }

  getTxidVersion(): TXIDVersion {
    return TXIDVersion.V2_PoseidonMerkle;
  }
}

export const railgunEngine = RailgunEngineService.getInstance();
