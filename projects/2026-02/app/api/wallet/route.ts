// app/api/wallet/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || 'demo-user';
  
  const mockWallet = {
    success: true,
    wallet: {
      id: 'wallet_123',
      userId,
      balances: {
        USD: 5420.75,
        BTC: 0.0245,
        ETH: 1.245,
        SOL: 42.5,
        NOFA: 125.0,
        DAI: 500.0,
        OG: 1000.0
      },
      cards: [
        {
          id: 'card_1',
          type: 'visa',
          last4: '4242',
          name: 'John Doe',
          expiry: '12/25',
          isDefault: true
        },
        {
          id: 'card_2',
          type: 'mastercard',
          last4: '8888',
          name: 'John Doe',
          expiry: '08/26',
          isDefault: false
        }
      ],
      cryptoWallets: [
        {
          id: 'crypto_1',
          type: 'metamask',
          address: '0x742d35Cc6634C0532925a3b844Bc9e',
          name: 'MetaMask Main',
          balance: 2.45,
          currency: 'ETH',
          isConnected: true,
          network: 'Ethereum Mainnet'
        },
        {
          id: 'crypto_2',
          type: 'phantom',
          address: 'PhantomWallet1234567890',
          name: 'Phantom Wallet',
          balance: 1250,
          currency: 'SOL',
          isConnected: false,
          network: 'Solana'
        }
      ],
      totalValueUSD: 12542.50,
      monthlyGrowth: '+12.5%',
      securityScore: 98,
      lastUpdated: new Date().toISOString()
    }
  };

  return NextResponse.json(mockWallet);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'deposit';
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    switch (action) {
      case 'deposit':
        return NextResponse.json({
          success: true,
          transactionId: `DEP_${Date.now()}`,
          action: 'deposit',
          amount: body.amount,
          currency: body.currency || 'USD',
          status: 'completed',
          method: body.cardId ? `Card ****${body.cardId.slice(-4)}` : 'Bank Transfer',
          fee: 0,
          timestamp: new Date().toISOString(),
          newBalance: 5420.75 + (body.amount || 0)
        });
        
      case 'withdraw':
        return NextResponse.json({
          success: true,
          transactionId: `WTH_${Date.now()}`,
          action: 'withdrawal',
          amount: body.amount,
          currency: body.currency || 'USD',
          status: 'pending',
          method: body.cardId ? `Card ****${body.cardId.slice(-4)}` : 'Bank Transfer',
          fee: 1.50,
          timestamp: new Date().toISOString(),
          estimatedCompletion: new Date(Date.now() + 86400000).toISOString(),
          newBalance: 5420.75 - (body.amount || 0)
        });
        
      case 'send':
        return NextResponse.json({
          success: true,
          transactionId: `SND_${Date.now()}`,
          action: 'send',
          amount: body.amount,
          currency: body.currency || 'USD',
          to: body.recipient,
          status: 'completed',
          fee: 0.30,
          timestamp: new Date().toISOString(),
          newBalance: 5420.75 - (body.amount || 0),
          message: `Money sent to ${body.recipient}`
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          supportedActions: ['deposit', 'withdraw', 'send', 'addCard', 'removeCard']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Wallet API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Wallet operation failed',
        fallback: true
      },
      { status: 500 }
    );
  }
}