import { NextRequest, NextResponse } from 'next/server';

// 模拟受保护的资源数据库
const protectedResources = {
  'premium-content': {
    id: 'premium-content',
    name: 'Premium AI Content',
    description: 'Access to premium AI-generated content',
    content: 'This is the premium AI-generated content that requires payment to access.',
    image: 'https://via.placeholder.com/800x600/4338ca/ffffff?text=Premium+AI+Content',
  },
  'netflix-subscription': {
    id: 'netflix-subscription',
    name: 'Netflix Chain Subscription',
    description: 'Monthly subscription to Netflix on blockchain',
    content: 'Your Netflix subscription has been successfully renewed for another month.',
    image: 'https://via.placeholder.com/800x600/dc2626/ffffff?text=Netflix+Subscription',
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const paymentProof = request.headers.get('x-payment-proof');

  // 获取资源
  const resource = protectedResources[id as keyof typeof protectedResources];

  if (!resource) {
    return NextResponse.json(
      { error: 'Resource not found' },
      { status: 404 }
    );
  }

  // 如果没有支付证明，返回402状态码
  if (!paymentProof) {
    return new NextResponse(
      JSON.stringify({
        error: 'Payment Required',
        message: 'This resource requires payment to access',
        resource: {
          id: resource.id,
          name: resource.name,
          description: resource.description,
        },
        payment: {
          amount: 5,
          currency: 'USDC',
          chain: 'Ethereum',
          recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        },
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'Accept-Payment': 'cryptocurrency',
          'Payment-Amount': '5',
          'Payment-Currency': 'USDC',
          'Payment-Chain': 'Ethereum',
          'Payment-Address': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        },
      }
    );
  }

  // 验证支付证明（这里简化处理，实际应该验证区块链交易）
  if (paymentProof.startsWith('0x') && paymentProof.length === 66) {
    // 返回受保护的内容
    return NextResponse.json({
      success: true,
      resource: {
        id: resource.id,
        name: resource.name,
        description: resource.description,
        content: resource.content,
        image: resource.image,
      },
      transaction: {
        hash: paymentProof,
        verified: true,
      },
    });
  }

  // 无效的支付证明
  return NextResponse.json(
    { error: 'Invalid payment proof' },
    { status: 403 }
  );
}
