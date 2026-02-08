// app/api/trading/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  
  const tradingPairs = [
    {
      symbol: 'BTC/USD',
      name: 'Bitcoin',
      currentPrice: 45128.50,
      change24h: 1245.30,
      change24hPercent: 2.84,
      volume24h: 2845000000,
      marketCap: 885000000000,
      category: 'crypto',
      color: '#F7931A',
      tags: ['OG Sponsor'],
      sponsor: '0G Labs',
      description: 'Powered by 0G decentralized infrastructure'
    },
    {
      symbol: 'NOFA/USD',
      name: 'NOFA NFT',
      currentPrice: 25.45,
      change24h: 5.25,
      change24hPercent: 26.01,
      volume24h: 12500000,
      marketCap: 85000000,
      category: 'nft',
      color: '#FF6B8B',
      tags: ['NFT', 'Visual Agent Studio'],
      sponsor: 'Visual Agent Studio',
      description: 'AI-powered NFT creation platform'
    },
    {
      symbol: 'DAI/USD',
      name: 'DAI Stablecoin',
      currentPrice: 1.00,
      change24h: 0.001,
      change24hPercent: 0.10,
      volume24h: 85000000,
      marketCap: 5400000000,
      category: 'defi',
      color: '#F4B731',
      tags: ['Stablecoin', 'MakerDAO'],
      sponsor: 'MakerDAO',
      description: 'Decentralized stablecoin by MakerDAO'
    },
    {
      symbol: 'OG/USD',
      name: 'OG Token',
      currentPrice: 0.85,
      change24h: 0.15,
      change24hPercent: 21.43,
      volume24h: 12500000,
      marketCap: 85000000,
      category: 'crypto',
      color: '#8B5CF6',
      tags: ['Infrastructure', '0G Sponsor'],
      sponsor: '0G Labs',
      description: '0G Labs infrastructure token'
    },
    {
      symbol: 'ETH/USD',
      name: 'Ethereum',
      currentPrice: 2415.75,
      change24h: 45.25,
      change24hPercent: 1.91,
      volume24h: 1548000000,
      marketCap: 290000000000,
      category: 'crypto',
      color: '#627EEA',
      tags: ['Smart Contracts'],
      description: 'Ethereum blockchain native token'
    }
  ];

  if (symbol) {
    const pair = tradingPairs.find(p => p.symbol === symbol);
    if (!pair) {
      return NextResponse.json(
        { success: false, error: 'Trading pair not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: pair,
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    success: true,
    data: tradingPairs,
    count: tradingPairs.length,
    timestamp: new Date().toISOString(),
    note: 'Market data powered by sponsor integrations'
  });
}

export async function POST(request: NextRequest) {
  try {
    const order = await request.json();
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate P&L (simulated)
    const entryPrice = order.price;
    const currentPrice = order.symbol === 'NOFA/USD' ? 25.45 : 
                        order.symbol === 'BTC/USD' ? 45128.50 : 
                        order.symbol === 'DAI/USD' ? 1.00 : 0.85;
    
    const pnl = order.type === 'buy' 
      ? (currentPrice - entryPrice) * order.amount * (order.leverage || 1)
      : (entryPrice - currentPrice) * order.amount * (order.leverage || 1);
    
    const sponsorBonus = order.symbol.includes('NOFA') || order.symbol.includes('OG') 
      ? { sponsorBonus: true, bonusAmount: pnl * 0.1, sponsor: order.symbol.includes('NOFA') ? 'Visual Agent Studio' : '0G Labs' }
      : {};
    
    return NextResponse.json({
      success: true,
      orderId,
      status: 'filled',
      symbol: order.symbol,
      type: order.type,
      amount: order.amount,
      price: order.price,
      leverage: order.leverage || 1,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercent: parseFloat(((pnl / (order.amount * order.price)) * 100).toFixed(2)),
      fee: 0.001 * order.amount * order.price,
      timestamp: new Date().toISOString(),
      ...sponsorBonus,
      message: 'Order executed successfully' + (sponsorBonus.sponsorBonus ? ` with ${sponsorBonus.sponsor} bonus` : '')
    });
  } catch (error) {
    console.error('Trading API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Order placement failed',
        fallback: true
      },
      { status: 500 }
    );
  }
}