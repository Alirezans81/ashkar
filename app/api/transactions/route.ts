import { NextRequest, NextResponse } from 'next/server';
import { createTransaction } from '@/lib/transaction-service';
import { verifyChainIntegrity } from '@/lib/hash-chain';

// POST route to create a new transaction
export async function POST(request: NextRequest) {
  try {
    // For MVP, we'll allow all requests to create transactions
    // In production, you'd want to add authentication here

    const body = await request.json();

    // Create the transaction (without associating with a specific user for public API)
    const transaction = await createTransaction({
      amount: body.amount,
      currency: body.currency || 'IRR',
      type: body.type,
      category: body.category,
      description: body.description || undefined,
      source: body.source,
      destination: body.destination,
      // Don't include createdById for public API - only admin can associate transactions with users
    });

    return NextResponse.json({
      status: 'success',
      data: transaction,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create transaction',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}

// GET route to retrieve all transactions (public read-only)
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
    console.error('Error fetching transactions:', error);
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