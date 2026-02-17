import { getAllTransactions } from '@/lib/transaction-service';
import { Transaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Exports transactions to CSV format
 */
export async function exportTransactionsToCSV(): Promise<string> {
  const transactions = await getAllTransactions();
  
  // Define headers
  const headers = [
    'id',
    'amount',
    'currency',
    'type',
    'category',
    'description',
    'source',
    'destination',
    'previousHash',
    'hash',
    'createdAt'
  ];
  
  // Convert transactions to CSV rows
  const csvRows = transactions.map((tx: Transaction) => [
    tx.id,
    tx.amount.toString(),
    tx.currency,
    tx.type,
    tx.category,
    tx.description || '',
    tx.source,
    tx.destination,
    tx.previousHash || '',
    tx.hash,
    tx.createdAt.toISOString()
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Exports transactions to JSON format
 */
export async function exportTransactionsToJSON(): Promise<any> {
  const transactions = await getAllTransactions();
  
  // Convert transactions to JSON format
  const jsonData = transactions.map((tx: Transaction) => ({
    id: tx.id,
    amount: tx.amount.toString(),
    currency: tx.currency,
    type: tx.type,
    category: tx.category,
    description: tx.description,
    source: tx.source,
    destination: tx.destination,
    previousHash: tx.previousHash,
    hash: tx.hash,
    createdAt: tx.createdAt.toISOString()
  }));
  
  return {
    exportedAt: new Date().toISOString(),
    totalTransactions: jsonData.length,
    transactions: jsonData
  };
}

/**
 * Exports transaction statistics to JSON format
 */
export async function exportStatsToJSON() {
  const { getTransactionStats } = await import('@/lib/transaction-service');
  const stats = await getTransactionStats();
  
  return {
    exportedAt: new Date().toISOString(),
    stats: {
      totalIncome: stats.totalIncome.toString(),
      totalExpense: stats.totalExpense.toString(),
      balance: stats.balance.toString(),
      totalCount: stats.totalCount
    }
  };
}