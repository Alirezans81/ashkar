import { NextRequest, NextResponse } from 'next/server';
import { exportTransactionsToCSV } from '@/lib/export-service';

export async function GET(request: NextRequest) {
  try {
    const csvContent = await exportTransactionsToCSV();
    
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', 'attachment; filename=transactions.csv');
    
    return new NextResponse(csvContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to export CSV',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}