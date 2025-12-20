import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import UserRebalancer from '@/lib/models/user';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { walletAddress } = await req.json();

    // Validate input
    if (!walletAddress) {
      return NextResponse.json(
        { message: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find user and update wallet address
    const updatedUser = await UserRebalancer.findOneAndUpdate(
      { email: session.user.email },
      { walletAddress },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Wallet connected successfully',
      walletAddress: updatedUser.walletAddress,
    });
  } catch (error) {
    console.error('Connect wallet error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 