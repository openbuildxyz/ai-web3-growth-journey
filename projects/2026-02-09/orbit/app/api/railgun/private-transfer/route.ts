/**
 * POST /api/railgun/private-transfer
 *
 * Execute a single-recipient private transfer: shield → POI → unshield.
 * Uses official RAILGUN proxy and relayer. Streams progress via SSE.
 */

import { NextRequest } from 'next/server';
import { railgunEngine } from '@/lib/railgun/engine';
import { railgunTransfer } from '@/lib/railgun/transfer';
import { relayerService } from '@/lib/railgun/relayer';
import type { PrivateTransferProgress, PermitData } from '@/lib/railgun/types';

export const maxDuration = 300;

interface PrivateTransferBody {
  senderWalletID: string;
  senderEncryptionKey: string;
  senderRailgunAddress: string;
  recipientAddress: string;
  tokenAddress: string;
  amount: string;
  userAddress: string;
  gasAbstraction: 'permit' | 'approved';
  permitData?: PermitData;
}

export async function POST(request: NextRequest) {
  let body: PrivateTransferBody;

  try {
    body = (await request.json()) as PrivateTransferBody;
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const required = [
    'senderWalletID',
    'senderEncryptionKey',
    'senderRailgunAddress',
    'recipientAddress',
    'tokenAddress',
    'amount',
    'userAddress',
    'gasAbstraction',
  ] as const;
  const missing = required.filter((k) => !(body as unknown as Record<string, unknown>)[k]);
  if (missing.length > 0) {
    return new Response(
      JSON.stringify({ success: false, error: `Missing: ${missing.join(', ')}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (body.gasAbstraction === 'permit' && !body.permitData) {
    return new Response(
      JSON.stringify({ success: false, error: 'permitData required when gasAbstraction is permit' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!relayerService.isConfigured()) {
    return new Response(
      JSON.stringify({ success: false, error: 'Relayer not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!railgunEngine.isReady()) {
    await railgunEngine.initialize();
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: { type: string; data: unknown }) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        const result = await railgunTransfer.executeTransfer(
          {
            senderWalletID: body.senderWalletID,
            senderEncryptionKey: body.senderEncryptionKey,
            senderRailgunAddress: body.senderRailgunAddress,
            recipientPublicAddress: body.recipientAddress,
            tokenAddress: body.tokenAddress,
            amount: BigInt(body.amount),
            userAddress: body.userAddress,
            gasAbstraction: body.gasAbstraction,
            permitData: body.permitData,
          },
          (p: PrivateTransferProgress) => {
            send({ type: 'progress', data: p });
          }
        );

        if (result.success) {
          send({
            type: 'complete',
            data: {
              success: true,
              shieldTxHash: result.shieldTxHash,
              unshieldTxHash: result.unshieldTxHash,
              senderRailgunAddress: result.senderRailgunAddress,
            },
          });
        } else {
          send({ type: 'error', data: { success: false, error: result.error } });
        }
      } catch (err) {
        send({
          type: 'error',
          data: { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
