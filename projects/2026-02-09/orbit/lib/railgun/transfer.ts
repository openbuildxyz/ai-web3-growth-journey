/**
 * Private transfer: shield → POI → unshield using official proxy and relayer.
 */

import { Contract } from 'ethers';
import {
  EVMGasType,
  calculateGasPrice,
  NETWORK_CONFIG as RAILGUN_NETWORK_CONFIG,
  type TransactionGasDetails,
  type RailgunERC20AmountRecipient,
} from '@railgun-community/shared-models';
import {
  refreshBalances,
  balanceForERC20Token,
  walletForID,
  loadWalletByID,
  getShieldPrivateKeySignatureMessage,
  gasEstimateForShield,
  populateShield,
  gasEstimateForUnprovenUnshield,
  generateUnshieldProof,
  populateProvedUnshield,
} from '@railgun-community/wallet';
import { keccak256, toUtf8Bytes } from 'ethers';
import { railgunEngine } from './engine';
import { relayerService } from './relayer';
import { railgunWallet } from './wallet';
import { RAILGUN_PROXY_ADDRESS } from './constants';
import type {
  PrivateTransferParams,
  PrivateTransferProgress,
  PrivateTransferResult,
  PermitData,
} from './types';

const ERC20_WITH_PERMIT_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
  'function nonces(address owner) view returns (uint256)',
];

async function withRetry<T>(
  fn: () => Promise<T>,
  name: string,
  maxRetries = 3,
  delayMs = 2000,
  onRetry?: (attempt: number, max: number, err: string) => void
): Promise<T> {
  let lastError: Error | null = null;
  let d = delayMs;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt === maxRetries) throw lastError;
      onRetry?.(attempt, maxRetries, lastError.message);
      await new Promise((r) => setTimeout(r, d));
      d *= 2;
    }
  }
  throw lastError;
}

class RailgunTransferService {
  private static instance: RailgunTransferService | null = null;

  private constructor() {}

  static getInstance(): RailgunTransferService {
    if (!RailgunTransferService.instance) {
      RailgunTransferService.instance = new RailgunTransferService();
    }
    return RailgunTransferService.instance;
  }

  private async executePermit(
    tokenContract: Contract,
    permitData: PermitData
  ): Promise<string> {
    const tx = await tokenContract.permit(
      permitData.owner,
      permitData.spender,
      BigInt(permitData.value),
      BigInt(permitData.deadline),
      permitData.v,
      permitData.r,
      permitData.s,
      { gasLimit: 100000 }
    );
    await tx.wait();
    return tx.hash;
  }

  async executeTransfer(
    params: PrivateTransferParams,
    onProgress?: (p: PrivateTransferProgress) => void
  ): Promise<PrivateTransferResult> {
    const progress = (step: PrivateTransferProgress['step'], pct: number, message: string, txHash?: string) => {
      onProgress?.({ step, progress: pct, message, txHash });
    };

    const {
      senderWalletID,
      senderEncryptionKey: clientEncryptionKey,
      senderRailgunAddress,
      recipientPublicAddress,
      tokenAddress,
      amount,
      userAddress,
      gasAbstraction,
      permitData,
    } = params;

    try {
      if (!railgunEngine.isReady()) {
        throw new Error('RAILGUN engine not initialized');
      }
      if (!relayerService.isConfigured()) {
        throw new Error('Relayer not configured. Add RELAYER_PRIVATE_KEY to .env');
      }

      await relayerService.ensureInitialized();

      const cached = railgunWallet.getCachedWalletByID(senderWalletID);
      const senderEncryptionKey = cached?.encryptionKey ?? clientEncryptionKey;

      let abstractWallet = walletForID(senderWalletID);
      if (!abstractWallet) {
        await loadWalletByID(senderEncryptionKey, senderWalletID, false);
        abstractWallet = walletForID(senderWalletID);
      }
      if (!abstractWallet) {
        throw new Error(`Wallet ${senderWalletID} not found. Please recreate the wallet.`);
      }

      const networkName = railgunEngine.getNetwork();
      const txidVersion = railgunEngine.getTxidVersion();
      const { chain } = RAILGUN_NETWORK_CONFIG[networkName];
      const relayerWallet = relayerService.getWallet();
      const provider = relayerService.getProvider();
      const relayerAddress = relayerWallet.address;

      const tokenContract = new Contract(tokenAddress, ERC20_WITH_PERMIT_ABI, relayerWallet);

      // Step 1: Permit or approved
      if (gasAbstraction === 'permit' && permitData) {
        progress('approving', 5, 'Executing gasless approval...');
        await this.executePermit(tokenContract, permitData);
      } else if (gasAbstraction === 'approved') {
        progress('approving', 5, 'Using existing approval...');
      }

      progress('approving', 8, 'Verifying allowance...');
      const userAllowance = await tokenContract.allowance(userAddress, relayerAddress);
      if (userAllowance < amount) {
        throw new Error(
          `Insufficient allowance. Have: ${userAllowance}, Need: ${amount}. Permit may have failed or expired.`
        );
      }

      progress('approving', 10, 'Pulling tokens from user...');
      const transferFromTx = await tokenContract.transferFrom(userAddress, relayerAddress, amount, {
        gasLimit: 100000,
      });
      await transferFromTx.wait();

      progress('approving', 12, 'Approving RAILGUN proxy...');
      const relayerAllowance = await tokenContract.allowance(relayerAddress, RAILGUN_PROXY_ADDRESS);
      if (relayerAllowance < amount) {
        const approveTx = await tokenContract.approve(RAILGUN_PROXY_ADDRESS, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'));
        await approveTx.wait();
      }

      // Step 2: Shield
      progress('shielding', 15, 'Preparing shield...');
      const shieldRecipients: RailgunERC20AmountRecipient[] = [
        { tokenAddress, amount, recipientAddress: senderRailgunAddress },
      ];
      const shieldSignatureMessage = getShieldPrivateKeySignatureMessage();
      const shieldPrivateKey = keccak256(toUtf8Bytes(shieldSignatureMessage));

      const { gasEstimate: shieldGasEstimate } = await gasEstimateForShield(
        txidVersion,
        networkName,
        shieldPrivateKey,
        shieldRecipients,
        [],
        relayerAddress
      );

      const feeData = await provider.getFeeData();
      const shieldGasDetails: TransactionGasDetails = {
        evmGasType: EVMGasType.Type2,
        gasEstimate: shieldGasEstimate,
        maxFeePerGas: feeData.maxFeePerGas ?? BigInt(50 * 10 ** 9),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? BigInt(2 * 10 ** 9),
      };

      const { transaction: shieldTx } = await populateShield(
        txidVersion,
        networkName,
        shieldPrivateKey,
        shieldRecipients,
        [],
        shieldGasDetails
      );

      progress('shielding', 20, 'Sending shield transaction...');
      const shieldTxResponse = await relayerWallet.sendTransaction(shieldTx);
      progress('shielding', 25, 'Waiting for shield confirmation...', shieldTxResponse.hash);
      await shieldTxResponse.wait();

      // Step 3: Wait POI
      progress('waiting_poi', 30, 'Waiting for Proof of Innocence...');
      const minExpectedBalance = (amount * BigInt(99)) / BigInt(100);
      let spendableBalance = BigInt(0);
      const maxWait = 120000;
      const pollInterval = 5000;
      const startTime = Date.now();

      while (spendableBalance < minExpectedBalance && Date.now() - startTime < maxWait) {
        await new Promise((r) => setTimeout(r, pollInterval));
        await refreshBalances(chain, [senderWalletID]);
        const wallet = walletForID(senderWalletID);
        spendableBalance = await balanceForERC20Token(
          txidVersion,
          wallet,
          networkName,
          tokenAddress,
          true
        );
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        progress('waiting_poi', Math.min(30 + Math.floor(elapsed / 2), 45), `POI verification... ${elapsed}s`);
      }

      if (spendableBalance < minExpectedBalance) {
        throw new Error(
          `POI timeout. Spendable: ${spendableBalance}, Need: ${minExpectedBalance}`
        );
      }

      // Step 4: Unshield proof + send
      const SHIELD_FEE_BP = BigInt(25);
      const shieldFee = (amount * SHIELD_FEE_BP) / BigInt(10000);
      const unshieldAmount = amount - shieldFee;
      if (spendableBalance < unshieldAmount) {
        throw new Error(`Insufficient spendable. Have: ${spendableBalance}, Need: ${unshieldAmount}`);
      }

      const unshieldRecipients: RailgunERC20AmountRecipient[] = [
        { tokenAddress, amount: unshieldAmount, recipientAddress: recipientPublicAddress },
      ];

      const originalGasDetails: TransactionGasDetails = {
        evmGasType: EVMGasType.Type2,
        gasEstimate: BigInt(0),
        maxFeePerGas: feeData.maxFeePerGas ?? BigInt(50 * 10 ** 9),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? BigInt(2 * 10 ** 9),
      };

      progress('generating_proof', 50, 'Estimating gas for unshield...');
      const { gasEstimate: unshieldGasEstimate } = await withRetry(
        () =>
          gasEstimateForUnprovenUnshield(
            txidVersion,
            networkName,
            senderWalletID,
            senderEncryptionKey,
            unshieldRecipients,
            [],
            originalGasDetails,
            undefined,
            true
          ),
        'Gas estimation',
        3,
        3000
      );

      const unshieldGasDetails: TransactionGasDetails = {
        ...originalGasDetails,
        gasEstimate: unshieldGasEstimate,
      };
      const overallBatchMinGasPrice = calculateGasPrice(unshieldGasDetails);

      progress('generating_proof', 52, 'Generating ZK proof (20–40s)...');
      await withRetry(
        () =>
          generateUnshieldProof(
            txidVersion,
            networkName,
            senderWalletID,
            senderEncryptionKey,
            unshieldRecipients,
            [],
            undefined,
            true,
            overallBatchMinGasPrice,
            (proofProgress) => {
              progress('generating_proof', 52 + Math.floor(proofProgress * 0.25), `ZK proof... ${proofProgress}%`);
            }
          ),
        'ZK proof',
        3,
        5000
      );

      progress('unshielding', 85, 'Unshielding to recipient...');
      const { transaction: unshieldTx } = await withRetry(
        () =>
          populateProvedUnshield(
            txidVersion,
            networkName,
            senderWalletID,
            unshieldRecipients,
            [],
            undefined,
            true,
            overallBatchMinGasPrice,
            unshieldGasDetails
          ),
        'Populate unshield',
        3,
        2000
      );

      const unshieldTxResponse = await relayerWallet.sendTransaction(unshieldTx);
      progress('unshielding', 90, 'Waiting for unshield confirmation...', unshieldTxResponse.hash);
      await unshieldTxResponse.wait();

      progress('complete', 100, 'Private transfer complete.', unshieldTxResponse.hash);

      return {
        success: true,
        shieldTxHash: shieldTxResponse.hash,
        unshieldTxHash: unshieldTxResponse.hash,
        senderRailgunAddress,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      progress('error', 0, msg);
      return { success: false, error: msg };
    }
  }
}

export const railgunTransfer = RailgunTransferService.getInstance();
