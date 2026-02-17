import { createHash } from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '@prisma/client';

// Define the transaction interface for hash calculation
interface TransactionData {
  amount: Decimal;
  currency: string;
  type: TransactionType;
  category: string;
  description?: string | null;
  source: string;
  destination: string;
  createdById?: string | null;
  createdAt: Date;
  previousHash?: string | null;
}

/**
 * Generates a SHA256 hash for a transaction based on its data
 */
export function generateTransactionHash(transactionData: TransactionData): string {
  const dataString = [
    transactionData.amount.toString(),
    transactionData.currency,
    transactionData.type,
    transactionData.category,
    transactionData.description || '',
    transactionData.source,
    transactionData.destination,
    transactionData.createdById || '',
    transactionData.createdAt.toISOString(),
    transactionData.previousHash || ''
  ].join('|');
  
  return createHash('sha256').update(dataString).digest('hex');
}

/**
 * Legacy hash calculation kept for backward compatibility with old records.
 */
function generateTransactionHashLegacy(transactionData: {
  amount: Decimal;
  type: TransactionType;
  category: string;
  source: string;
  destination: string;
  createdAt: Date;
  previousHash?: string | null;
}): string {
  const dataString = [
    transactionData.amount.toString(),
    transactionData.type,
    transactionData.category,
    transactionData.source,
    transactionData.destination,
    transactionData.createdAt.toISOString(),
    transactionData.previousHash || ''
  ].join('|');

  return createHash('sha256').update(dataString).digest('hex');
}

/**
 * Validates the integrity of a single transaction by comparing its stored hash
 * with the recalculated hash
 */
export function validateTransactionIntegrity(
  transaction: {
    amount: Decimal;
    currency: string;
    type: TransactionType;
    category: string;
    description?: string | null;
    source: string;
    destination: string;
    createdById?: string | null;
    createdAt: Date;
    previousHash?: string | null;
    hash: string;
  }
): boolean {
  const calculatedHash = generateTransactionHash({
    amount: transaction.amount,
    currency: transaction.currency,
    type: transaction.type,
    category: transaction.category,
    description: transaction.description,
    source: transaction.source,
    destination: transaction.destination,
    createdById: transaction.createdById,
    createdAt: transaction.createdAt,
    previousHash: transaction.previousHash
  });

  if (calculatedHash === transaction.hash) {
    return true;
  }

  const legacyHash = generateTransactionHashLegacy({
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    source: transaction.source,
    destination: transaction.destination,
    createdAt: transaction.createdAt,
    previousHash: transaction.previousHash,
  });

  return legacyHash === transaction.hash;
}

/**
 * Verifies the entire chain of transactions by checking each link
 */
export async function verifyChainIntegrity(
  getAllTransactions: () => Promise<Array<{
    id: string;
    amount: Decimal;
    currency: string;
    type: TransactionType;
    category: string;
    description?: string | null;
    source: string;
    destination: string;
    createdById?: string | null;
    createdAt: Date;
    previousHash?: string | null;
    hash: string;
  }>>
): Promise<{ isValid: boolean; invalidTransactions: string[] }> {
  const transactions = await getAllTransactions();
  const sortedTransactions = transactions.sort((a, b) => 
    a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id)
  );
  
  const invalidTransactions: string[] = [];
  
  for (let i = 0; i < sortedTransactions.length; i++) {
    const transaction = sortedTransactions[i];
    
    // Validate the transaction's own integrity
    if (!validateTransactionIntegrity(transaction)) {
      invalidTransactions.push(transaction.id);
      continue;
    }
    
    // Check that the previousHash matches the hash of the previous transaction
    if (i > 0) {
      const previousTransaction = sortedTransactions[i - 1];
      if (transaction.previousHash !== previousTransaction.hash) {
        invalidTransactions.push(transaction.id);
      }
    } else {
      // First transaction should have no previousHash
      if (transaction.previousHash) {
        invalidTransactions.push(transaction.id);
      }
    }
  }
  
  return {
    isValid: invalidTransactions.length === 0,
    invalidTransactions
  };
}
