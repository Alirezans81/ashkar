import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    const result = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
    const usersCount = await prisma.user.count();

    console.log("Database connection: OK");
    console.log("Query test (SELECT 1):", result[0]?.ok === 1 ? "OK" : "Unexpected");
    console.log("Users table access: OK");
    console.log("Current users count:", usersCount);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Database connection test failed.");
  console.error(error);
  process.exit(1);
});
