// app/api/sponsors/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const featured = searchParams.get('featured') === 'true';
  
  const sponsors = [
    {
      id: '1',
      name: '0G Labs',
      logo: '⚡',
      description: 'Decentralized AI Infrastructure',
      category: 'infrastructure',
      url: 'https://0g.ai',
      integration: {
        trading: ['OG Token', 'AI Infrastructure'],
        videos: ['AI Generation', 'Processing'],
        wallet: ['Crypto Integration'],
        chat: ['AI Assistant']
      },
      featured: true,
      tier: 'platinum'
    },
    {
      id: '2',
      name: 'Visual Agent Studio',
      logo: '🎨',
      description: 'AI-Powered NFT Creation',
      category: 'nft',
      url: 'https://visualagent.studio',
      integration: {
        trading: ['NOFA Token'],
        videos: ['NFT Creation', 'Content Generation'],
        wallet: ['NFT Storage']
      },
      featured: true,
      tier: 'gold'
    },
    {
      id: '3',
      name: 'MakerDAO',
      logo: '🔄',
      description: 'DAI Stablecoin Protocol',
      category: 'defi',
      url: 'https://makerdao.com',
      integration: {
        trading: ['DAI Stablecoin'],
        wallet: ['Stable Payments']
      },
      featured: true,
      tier: 'gold'
    },
    {
      id: '4',
      name: 'Shadow Guard',
      logo: '🛡️',
      description: 'MIV Protection System',
      category: 'security',
      url: 'https://shadowguard.ai',
      integration: {
        trading: ['MIV Protection', 'Risk Management'],
        wallet: ['Security', 'Fraud Detection'],
        chat: ['Encryption']
      },
      featured: true,
      tier: 'silver'
    },
    {
      id: '5',
      name: 'Delysium',
      logo: '🤖',
      description: 'AI Agent Network',
      category: 'ai',
      url: 'https://delysium.com',
      integration: {
        chat: ['AI Agents'],
        videos: ['Content Moderation']
      },
      featured: false,
      tier: 'silver'
    },
    {
      id: '6',
      name: 'Camp Network',
      logo: '🏕️',
      description: 'IP Ownership Platform',
      category: 'infrastructure',
      url: 'https://camp.network',
      integration: {
        videos: ['Content IP'],
        wallet: ['Asset Ownership']
      },
      featured: false,
      tier: 'silver'
    }
  ];

  const filteredSponsors = featured 
    ? sponsors.filter(s => s.featured)
    : sponsors;

  return NextResponse.json({
    success: true,
    sponsors: filteredSponsors,
    total: filteredSponsors.length,
    timestamp: new Date().toISOString(),
    note: 'Omni Platform is powered by our sponsor ecosystem'
  });
}

export async function POST(request: NextRequest) {
  try {
    const { action, sponsorId, ...data } = await request.json();
    
    if (action === 'integrate') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return NextResponse.json({
        success: true,
        action: 'integrate',
        sponsorId,
        integration: {
          status: 'active',
          features: data.features || ['Basic Integration'],
          apiKey: `SP_${sponsorId}_${Date.now().toString(36)}`,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        timestamp: new Date().toISOString(),
        message: 'Sponsor integration activated successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Sponsors API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sponsor operation failed',
        fallback: true
      },
      { status: 500 }
    );
  }
}