import { NextRequest, NextResponse } from 'next/server';
import { unshieldTokens } from '@/lib/railgun/shield';

/**
 * POST /api/railgun/unshield - Unshield tokens from RAILGUN private pool
 * Flow: ZK proof generation → Submit via Relayer → Tokens sent to recipient
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mnemonic, password, tokenAddress, amount, recipient } = body;

    if (!mnemonic || !password || !tokenAddress || !amount || !recipient) {
      return NextResponse.json(
        { success: false, error: 'Missing: mnemonic, password, tokenAddress, amount, recipient' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          const { transactionHash, txid } = await unshieldTokens(
            { tokenAddress, amount, recipient, mnemonic, password },
            (progress) => {
              if (progress.zkProofProgress) {
                send('progress', {
                  phase: progress.status,
                  zkProofProgress: progress.zkProofProgress,
                  message: progress.zkProofProgress.message,
                });
              } else if (progress.status === 'broadcasting') {
                send('progress', { phase: 'broadcasting', message: 'Submitting via Relayer...' });
              } else if (progress.status === 'complete') {
                send('progress', { phase: 'complete', transactionHash: progress.transactionHash });
              } else if (progress.status === 'failed') {
                send('error', { error: progress.error });
              }
            }
          );

          send('complete', {
            success: true,
            transactionHash,
            txid,
            message: 'Unshield submitted. Tokens will be sent to recipient.',
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unshield failed';
          send('error', { success: false, error: msg });
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unshield failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
