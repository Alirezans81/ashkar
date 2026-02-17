import { NextRequest, NextResponse } from 'next/server';
import { exportTransactionsToJSON } from '@/lib/export-service';

export async function GET(request: NextRequest) {
  try {
    const jsonData = await exportTransactionsToJSON();
    
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', 'attachment; filename=transactions.json');
    
    return new NextResponse(JSON.stringify(jsonData, null, 2), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to export JSON',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}