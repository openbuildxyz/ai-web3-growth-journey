import { NextRequest, NextResponse } from 'next/server';

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}`, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Binance API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ticker Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
