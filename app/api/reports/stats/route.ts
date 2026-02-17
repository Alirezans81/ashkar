import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import here to avoid circular dependencies
    const { getTransactionStats } = await import('@/lib/transaction-service');
    
    const stats = await getTransactionStats();
    
    return NextResponse.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}