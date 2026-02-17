import { generateTransactionHash } from "@/lib/hash-chain";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/index-browser";
import { prisma } from "./prisma";
import { TransactionType } from "./generated/prisma/enums";
import { Transaction } from "./generated/prisma/client";

// Zod schema for validating transaction input
const CreateTransactionSchema = z.object({
  amount: z
    .union([z.number(), z.string()])
    .transform((val) => new Decimal(val.toString())),
  currency: z.string().optional().default("IRR"),
  type: z.nativeEnum(TransactionType),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
});

type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

/**
 * Creates a new transaction with proper hash chaining
 */
export async function createTransaction(
  input: CreateTransactionInput & { createdById?: string },
): Promise<Transaction> {
  // Validate input
  const validatedInput = CreateTransactionSchema.parse(input);

  // Get the last transaction to establish the chain
  const lastTransaction = await prisma.transaction.findFirst({
    orderBy: { createdAt: "desc" },
  });

  // Prepare transaction data
  const transactionData = {
    amount: validatedInput.amount,
    currency: validatedInput.currency,
    type: validatedInput.type,
    category: validatedInput.category,
    description: validatedInput.description || null,
    source: validatedInput.source,
    destination: validatedInput.destination,
    previousHash: lastTransaction?.hash || null,
    createdById: input.createdById || null, // Associate with user if provided
  };

  // Generate hash for the new transaction
  const hash = generateTransactionHash({
    ...transactionData,
    createdAt: new Date(), // Using current time for hash calculation
  });

  // Create the transaction in the database
  const newTransaction = await prisma.transaction.create({
    data: {
      ...transactionData,
      hash,
      // Establish the chain link from the previous transaction
      ...(lastTransaction && {
        prevTransaction: {
          connect: { id: lastTransaction.id },
        },
        nextTransaction: undefined, // Will be connected when the next transaction is created
      }),
    },
  });

  // Update the previous transaction to point to this one
  if (lastTransaction) {
    await prisma.transaction.update({
      where: { id: lastTransaction.id },
      data: {
        nextTransaction: {
          connect: { id: newTransaction.id },
        },
      },
    });
  }

  return newTransaction;
}

/**
 * Gets all transactions ordered by creation time
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  return prisma.transaction.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Gets a specific transaction by ID
 */
export async function getTransactionById(
  id: string,
): Promise<Transaction | null> {
  return prisma.transaction.findUnique({
    where: { id },
  });
}

/**
 * Gets transaction statistics for the dashboard
 */
export async function getTransactionStats() {
  const [totalIncome, totalExpense, totalCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: TransactionType.INCOME },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: TransactionType.EXPENSE },
      _sum: { amount: true },
    }),
    prisma.transaction.count(),
  ]);

  return {
    totalIncome: totalIncome._sum.amount || new Decimal(0),
    totalExpense: totalExpense._sum.amount || new Decimal(0),
    balance: (totalIncome._sum.amount || new Decimal(0)).minus(
      totalExpense._sum.amount || new Decimal(0),
    ),
    totalCount,
  };
}

/**
 * Gets transactions grouped by month
 */
export async function getMonthlyTransactions() {
  // Raw query to group transactions by month
  const monthlyData = await prisma.$queryRaw<
    { month: string; income: string; expense: string }[]
  >(`
    SELECT
      DATE_TRUNC('month', "createdAt")::text AS month,
      COALESCE(SUM(CASE WHEN "type" = 'INCOME' THEN "amount" ELSE 0 END), 0)::text AS income,
      COALESCE(SUM(CASE WHEN "type" = 'EXPENSE' THEN "amount" ELSE 0 END), 0)::text AS expense
    FROM "Transaction"
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY DATE_TRUNC('month', "createdAt")
  `);

  return monthlyData.map((item) => ({
    month: item.month,
    income: new Decimal(item.income),
    expense: new Decimal(item.expense),
  }));
}

/**
 * Gets transactions grouped by category
 */
export async function getCategoryDistribution() {
  // Raw query to group transactions by category
  const categoryData = await prisma.$queryRaw<
    { category: string; totalAmount: string; count: bigint }[]
  >(`
    SELECT
      "category",
      COALESCE(SUM("amount")::text, '0') AS totalAmount,
      COUNT(*) AS count
    FROM "Transaction"
    GROUP BY "category"
    ORDER BY SUM("amount") DESC
  `);

  return categoryData.map((item) => ({
    name: item.category,
    value: new Decimal(item.totalAmount),
    count: Number(item.count),
  }));
}

/**
 * Gets recent transactions
 */
export async function getRecentTransactions(limit: number = 5) {
  return prisma.transaction.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}
