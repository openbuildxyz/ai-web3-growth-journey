import { NextRequest, NextResponse } from 'next/server';
import { railgunEngine } from '@/lib/railgun/engine';
import { railgunWallet } from '@/lib/railgun/wallet';
import type { WalletCreateResponse, RailgunWalletInfo } from '@/lib/railgun/types';

/**
 * POST /api/railgun/wallet - Create or load a RAILGUN wallet
 *
 * Uses real @railgun-community/wallet. Returns walletID, railgunAddress, encryptionKey
 * (encryptionKey is needed for private-transfer; client sends it back).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mnemonic, password, tokenAddress } = body;

    if (!railgunEngine.isReady()) {
      await railgunEngine.initialize();
    }

    if (!mnemonic || typeof mnemonic !== 'string') {
      return NextResponse.json<WalletCreateResponse>({
        success: false,
        error: 'Invalid mnemonic',
      }, { status: 400 });
    }

    const wordCount = mnemonic.trim().split(/\s+/).length;
    if (wordCount !== 12 && wordCount !== 24) {
      return NextResponse.json<WalletCreateResponse>({
        success: false,
        error: `Invalid mnemonic: expected 12 or 24 words, got ${wordCount}`,
      }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json<WalletCreateResponse>({
        success: false,
        error: 'Invalid password',
      }, { status: 400 });
    }

    console.log('[API /railgun/wallet] Creating/loading wallet...');

    const walletInfo = await railgunWallet.createWalletFromMnemonic(mnemonic.trim(), password);

    console.log('[API /railgun/wallet] Wallet loaded:', walletInfo.walletID);
    console.log('[API /railgun/wallet] RAILGUN address:', walletInfo.railgunAddress.slice(0, 30) + '...');

    return NextResponse.json<WalletCreateResponse>({
      success: true,
      walletID: walletInfo.walletID,
      railgunAddress: walletInfo.railgunAddress,
      encryptionKey: walletInfo.encryptionKey,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create wallet';
    console.error('[API /railgun/wallet] Error:', error);

    return NextResponse.json<WalletCreateResponse>({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}

/**
 * GET /api/railgun/wallet - Get wallet information and balance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletID = searchParams.get('walletID');
    const mnemonic = searchParams.get('mnemonic');
    const password = searchParams.get('password');
    const tokenAddress = searchParams.get('tokenAddress');

    if (!mnemonic || !password) {
      return NextResponse.json({
        success: false,
        error: 'mnemonic and password are required',
      }, { status: 400 });
    }

    // Ensure engine is initialized
    if (!railgunEngine.isReady()) {
      await railgunEngine.initialize();
    }

    // For POC: Generate deterministic mock data
    const mockRailgunAddress = `0x${Buffer.from(mnemonic.substring(0, 40)).toString('hex')}`;

    // Mock balance - in production would use balanceByTokenAddress
    const balance = '1000000000000000000'; // 1 token

    return NextResponse.json<RailgunWalletInfo>({
      railgunAddress: mockRailgunAddress,
      balances: [
        {
          tokenAddress: tokenAddress || '0x0000000000000000000000000000000000000000',
          balance,
          tokenSymbol: undefined,
        },
      ],
      isInitialized: true,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get wallet info';
    console.error('[API /railgun/wallet] Error:', error);

    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}
