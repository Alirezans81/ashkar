import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { createTransaction } from '@/lib/transaction-service';
import { getUserById } from '@/lib/user-service';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify that the user still exists and has admin privileges
    const user = await getUserById(session.userId);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Insufficient privileges' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.amount || !body.type || !body.category || !body.source || !body.destination) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the transaction with the user who created it
    const transaction = await createTransaction({
      amount: body.amount,
      currency: body.currency || 'IRR',
      type: body.type,
      category: body.category,
      description: body.description || undefined,
      source: body.source,
      destination: body.destination,
      createdById: session.userId, // Associate transaction with the user who created it
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Admin transaction creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create transaction' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if user is authenticated as admin
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify that the user still exists and has admin privileges
    const user = await getUserById(session.userId);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Insufficient privileges' },
        { status: 403 }
      );
    }

    // Import here to avoid circular dependencies
    const { getAllTransactions } = await import('@/lib/transaction-service');

    const transactions = await getAllTransactions();

    return NextResponse.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Admin transactions fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch transactions' 
      },
      { status: 500 }
    );
  }
}