import { NextRequest, NextResponse } from 'next/server';
import { createTransaction, getTransactionStats } from '@/lib/transaction-service';
import { verifyChainIntegrity } from '@/lib/hash-chain';

export async function GET(request: NextRequest) {
  try {
    // Get the verification status
    const verificationResult = await verifyChainIntegrity(async () => {
      // Import here to avoid circular dependencies
      const { getAllTransactions } = await import('@/lib/transaction-service');
      return getAllTransactions();
    });

    const stats = await getTransactionStats();

    return NextResponse.json({
      status: 'success',
      data: {
        integrity: {
          isValid: verificationResult.isValid,
          invalidTransactions: verificationResult.invalidTransactions,
        },
        stats
      }
    });
  } catch (error) {
    console.error('Error in health check:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}