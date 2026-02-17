import { NextResponse } from 'next/server';
import { verifyChainIntegrity } from '@/lib/hash-chain';

// Public read-only API for transactions
export async function GET() {
  try {
    // Import here to avoid circular dependencies
    const { getAllTransactions } = await import('@/lib/transaction-service');
    
    const transactions = await getAllTransactions();
    
    // Verify the chain integrity
    const verificationResult = await verifyChainIntegrity(async () => transactions);
    
    return NextResponse.json({
      status: 'success',
      data: {
        transactions,
        integrity: {
          isValid: verificationResult.isValid,
          invalidTransactions: verificationResult.invalidTransactions,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching public transactions:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch transactions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}