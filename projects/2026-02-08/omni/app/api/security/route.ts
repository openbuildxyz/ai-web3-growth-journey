// app/api/security/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface SecurityData {
  status: string;
  securityScore: number;
  threatsBlocked: number;
  lastScan: string;
  mivScore: string;
  riskLevel: string;
  protection: {
    trading: {
      marginProtection: boolean;
      liquidationGuard: boolean;
      riskAssessment: string;
      score: number;
    };
    wallet: {
      transactionMonitoring: boolean;
      fraudDetection: boolean;
      score: number;
    };
    chat: {
      encryption: boolean;
      privacyProtection: boolean;
      score: number;
    };
    overall: number;
  };
  connectedApps: Array<{
    name: string;
    status: string;
    mivScore: string;
    lastCheck: string;
  }>;
  sponsor: string;
  description: string;
  scanResults?: {
    threatsFound: number;
    threatsBlocked: number;
    scanTime: string;
    vulnerabilitiesPatched: number;
    status: string;
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const scan = searchParams.get('scan');
  
  const securityData: SecurityData = {
    status: 'active',
    securityScore: 98,
    threatsBlocked: 1247,
    lastScan: new Date(Date.now() - 1800000).toISOString(),
    mivScore: 'A+',
    riskLevel: 'low',
    protection: {
      trading: {
        marginProtection: true,
        liquidationGuard: true,
        riskAssessment: 'A+',
        score: 95
      },
      wallet: {
        transactionMonitoring: true,
        fraudDetection: true,
        score: 97
      },
      chat: {
        encryption: true,
        privacyProtection: true,
        score: 96
      },
      overall: 98
    },
    connectedApps: [
      {
        name: 'Omni Trading',
        status: 'protected',
        mivScore: 'A+',
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Omni Wallet',
        status: 'protected',
        mivScore: 'A',
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Omni Chat',
        status: 'protected',
        mivScore: 'A',
        lastCheck: new Date().toISOString()
      }
    ],
    sponsor: 'Shadow Guard',
    description: 'MIV Protection System for Omni Platform'
  };

  const responseData = {
    success: true,
    security: securityData
  };

  if (scan === 'true') {
    // Simulate scanning
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    securityData.lastScan = new Date().toISOString();
    securityData.threatsBlocked += 3;
    securityData.securityScore = Math.min(100, securityData.securityScore + 1);
    
    // Add scanResults property
    securityData.scanResults = {
      threatsFound: 0,
      threatsBlocked: 3,
      scanTime: '2.8s',
      vulnerabilitiesPatched: 2,
      status: 'secure'
    };
  }

  return NextResponse.json(responseData);
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    
    if (action === 'connect') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return NextResponse.json({
        success: true,
        action: 'connect',
        status: 'connected',
        extensionId: `SG_${Date.now()}`,
        connection: {
          omniTrading: true,
          omniWallet: true,
          omniChat: true,
          mivProtection: true
        },
        timestamp: new Date().toISOString(),
        message: 'Shadow Guard extension connected successfully'
      });
    }
    
    if (action === 'protect') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return NextResponse.json({
        success: true,
        action: 'protect',
        protected: true,
        transactionId: data.transactionId,
        riskScore: 'low',
        protectionApplied: ['MIV Guard', 'Fraud Detection', 'Real-time Monitoring'],
        timestamp: new Date().toISOString(),
        message: 'Transaction protected by Shadow Guard'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Security operation failed',
        fallback: true
      },
      { status: 500 }
    );
  }
}