import { NextRequest, NextResponse } from 'next/server';
import { getTwitterSentiment } from '@/lib/twitter';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'BTCUSDT';
  
  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json(
      { error: 'RapidAPI key not configured' },
      { status: 500 }
    );
  }

  const result = await getTwitterSentiment(symbol);
  
  if (!result) {
    return NextResponse.json(
      { error: 'Failed to fetch Twitter data' },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
