import { NextRequest, NextResponse } from 'next/server';
import { railgunEngine } from '@/lib/railgun/engine';
import type { EngineState } from '@/lib/railgun/types';

/**
 * GET /api/railgun/init - Check engine status
 * POST /api/railgun/init - Initialize the RAILGUN engine
 *
 * The RAILGUN engine must be initialized before any wallet or transaction operations.
 * This is a singleton service that persists across API route invocations.
 */

export async function GET() {
  try {
    const status = railgunEngine.getStatus();
    return NextResponse.json<EngineState>(status);
  } catch (error) {
    console.error('[API /railgun/init] Error:', error);
    return NextResponse.json(
      { status: 'error', error: 'Failed to get engine status' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log('[API /railgun/init] Initializing RAILGUN engine...');

    // Initialize the engine
    await railgunEngine.initialize();

    const status = railgunEngine.getStatus();

    console.log('[API /railgun/init] ✓ Engine initialized:', status);

    return NextResponse.json<EngineState>(status);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const errorMessage = err.message;
    const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    const cause = err.cause != null ? String(err.cause) : undefined;
    console.error('[API /railgun/init] ✗ Error:', err);

    return NextResponse.json(
      {
        status: 'error',
        error: errorMessage,
        ...(stack && { stack }),
        ...(cause && { cause }),
      },
      { status: 500 }
    );
  }
}
