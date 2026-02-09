/**
 * GET /api/railgun/relayer-address
 * Returns the relayer public address (user must approve this address for tokens for gas abstraction).
 */

import { NextResponse } from 'next/server';
import { relayerService } from '@/lib/railgun/relayer';

export async function GET() {
  if (!relayerService.isConfigured()) {
    return NextResponse.json({ address: null, error: 'Relayer not configured' }, { status: 503 });
  }
  try {
    await relayerService.ensureInitialized();
    const address = relayerService.getAddress();
    return NextResponse.json({ address });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ address: null, error: msg }, { status: 500 });
  }
}
