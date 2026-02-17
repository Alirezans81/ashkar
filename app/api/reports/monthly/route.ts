import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import here to avoid circular dependencies
    const { getMonthlyTransactions } = await import('@/lib/transaction-service');
    
    const monthlyData = await getMonthlyTransactions();
    
    return NextResponse.json({
      status: 'success',
      data: monthlyData
    });
  } catch (error) {
    console.error('Error fetching monthly transactions:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch monthly data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}