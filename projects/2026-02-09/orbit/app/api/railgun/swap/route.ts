import { NextRequest, NextResponse } from 'next/server';
import { railgunEngine } from '@/lib/railgun/engine';
import { executePrivateSwap, executePublicSwap } from '@/lib/railgun/swap';
import type {
  SwapRequest,
  SwapResponse,
  SwapProgress,
  SwapStep,
} from '@/lib/railgun/types';

/**
 * POST /api/railgun/swap - Execute a private swap via RAILGUN
 *
 * This endpoint orchestrates the complete private swap flow:
 * 1. Shield input tokens to private pool
 * 2. Wait for POI verification
 * 3. Generate ZK proof for swap
 * 4. Execute private swap
 * 5. Unshield output tokens
 *
 * Uses Server-Sent Events (SSE) for real-time progress updates.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      senderWalletID,
      senderEncryptionKey,
      senderRailgunAddress,
      userAddress,
      mnemonic,
      password,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
      slippage,
      gasAbstraction,
      permitData,
      privateMode = true,
    } = body as SwapRequest & { privateMode?: boolean };

    console.log('[API /railgun/swap] Starting swap...');
    console.log('[API /railgun/swap] Token In:', tokenIn);
    console.log('[API /railgun/swap] Token Out:', tokenOut);
    console.log('[API /railgun/swap] Amount:', amountIn);
    console.log('[API /railgun/swap] Private Mode:', privateMode);
    console.log('[API /railgun/swap] User Address:', userAddress);
    console.log('[API /railgun/swap] RAILGUN Wallet ID:', senderWalletID);
    console.log('[API /railgun/swap] RAILGUN Address:', senderRailgunAddress);

    // Validate credentials for private mode
    if (privateMode) {
      if (!mnemonic || typeof mnemonic !== 'string') {
        return NextResponse.json({
          success: false,
          error: 'Mnemonic is required for private swap',
        }, { status: 400 });
      }

      if (!password || typeof password !== 'string') {
        return NextResponse.json({
          success: false,
          error: 'Password is required for private swap',
        }, { status: 400 });
      }

      const wordCount = mnemonic.trim().split(/\s+/).length;
      if (wordCount !== 12 && wordCount !== 24) {
        return NextResponse.json({
          success: false,
          error: `Invalid mnemonic: expected 12 or 24 words, got ${wordCount}`,
        }, { status: 400 });
      }
    }

    // Ensure engine is initialized
    if (!railgunEngine.isReady()) {
      await railgunEngine.initialize();
    }

    // Create SSE stream for progress updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (eventType: string, data: any) => {
          const event = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(event));
        };

        const updateProgress = (progress: SwapProgress) => {
          sendEvent('progress', progress);
        };

        try {
          // Execute swap (private or public based on mode)
          const result = privateMode
            ? await executePrivateSwap({
                railgunWalletID: senderWalletID,
                railgunAddress: senderRailgunAddress,
                mnemonic,
                password,
                tokenIn,
                tokenOut,
                amountIn,
                minAmountOut,
                recipientAddress: userAddress,
              }, updateProgress)
            : await executePublicSwap({
                tokenIn,
                tokenOut,
                amountIn,
                minAmountOut,
                recipientAddress: userAddress,
              }, updateProgress);

          // Send final result
          sendEvent('complete', {
            success: result.success,
            shieldTxHash: result.shieldTxHash,
            swapTxHash: result.swapTxHash,
            unshieldTxHash: result.unshieldTxHash,
            amountOut: result.amountOut,
          });

          controller.close();

        } catch (error) {
          console.error('[API /railgun/swap] Error:', error);

          const errorMessage = error instanceof Error ? error.message : 'Swap failed';

          sendEvent('error', {
            success: false,
            error: errorMessage,
          });

          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid request';
    console.error('[API /railgun/swap] ✗ Error:', error);

    return NextResponse.json<SwapResponse>({
      success: false,
      error: errorMessage,
    }, { status: 400 });
  }
}

/**
 * GET /api/railgun/swap - Get swap quote (without executing)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenIn = searchParams.get('tokenIn');
    const tokenOut = searchParams.get('tokenOut');
    const amountIn = searchParams.get('amountIn');
    const slippage = parseFloat(searchParams.get('slippage') || '0.5');

    if (!tokenIn || !tokenOut || !amountIn) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: tokenIn, tokenOut, amountIn',
      }, { status: 400 });
    }

    // Import swap calculation
    const { getSwapOutput } = await import('@/lib/railgun/swap');

    // Calculate output
    const amountInBigInt = BigInt(amountIn);
    const amountOut = getSwapOutput(tokenIn, tokenOut, amountInBigInt);

    // Apply slippage
    const slippageMultiplier = 1 - (slippage / 100);
    const minAmountOut = amountOut * BigInt(Math.floor(slippageMultiplier * 10000)) / 10000n;

    // Calculate price impact (mock)
    const priceImpact = 0.1; // Mock - would calculate from pool depth

    return NextResponse.json({
      success: true,
      tokenIn,
      tokenOut,
      amountIn: amountInBigInt.toString(),
      amountOut: amountOut.toString(),
      minAmountOut: minAmountOut.toString(),
      priceImpact,
      slippage,
      feeBps: 30, // 0.3% = 30 basis points
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get quote';
    console.error('[API /railgun/swap] ✗ Error:', error);

    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}
