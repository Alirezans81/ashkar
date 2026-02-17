import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Import here to avoid circular dependencies
    const { getRecentTransactions } = await import('@/lib/transaction-service');

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);

    const recentTransactions = await getRecentTransactions(limit);

    return NextResponse.json({
      status: 'success',
      data: recentTransactions
    });
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch recent transactions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}