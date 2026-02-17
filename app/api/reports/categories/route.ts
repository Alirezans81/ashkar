import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import here to avoid circular dependencies
    const { getCategoryDistribution } = await import('@/lib/transaction-service');

    const categoryData = await getCategoryDistribution();

    return NextResponse.json({
      status: 'success',
      data: categoryData
    });
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch category data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}