import { NextResponse } from 'next/server';
import { verifyChainIntegrity } from '@/lib/hash-chain';

export async function GET() {
  try {
    // Import here to avoid circular dependencies
    const { getAllTransactions } = await import('@/lib/transaction-service');
    
    const transactions = await getAllTransactions();
    const verificationResult = await verifyChainIntegrity(async () => transactions);
    
    return NextResponse.json({
      status: 'success',
      data: {
        ...verificationResult,
        totalTransactions: transactions.length,
        verificationTime: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error verifying chain integrity:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to verify chain integrity',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}