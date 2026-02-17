import "dotenv/config";
import { hash } from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "../lib/generated/prisma/client";

type Args = {
  username?: string;
  email?: string;
  password?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    const next = argv[i + 1];

    if (part === "--username" && next) {
      args.username = next;
      i += 1;
    } else if (part === "--email" && next) {
      args.email = next;
      i += 1;
    } else if (part === "--password" && next) {
      args.password = next;
      i += 1;
    }
  }

  return args;
}

function printUsageAndExit(): never {
  console.log(
    "Usage: pnpm run admin:create -- --username <username> --email <email> --password <password>",
  );
  process.exit(1);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables.");
  }

  const { username, email, password } = parseArgs(process.argv.slice(2));
  if (!username || !email || !password) {
    printUsageAndExit();
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const hashedPassword = await hash(password, 10);

    const existingByUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (
      existingByUsername &&
      existingByEmail &&
      existingByUsername.id !== existingByEmail.id
    ) {
      throw new Error(
        "Conflict: this username and email belong to two different users.",
      );
    }

    const existingId = existingByUsername?.id ?? existingByEmail?.id;

    if (existingId) {
      const user = await prisma.user.update({
        where: { id: existingId },
        data: {
          username,
          email,
          password: hashedPassword,
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      console.log("Admin user updated successfully.");
      console.log(`id=${user.id} username=${user.username} email=${user.email}`);
      return;
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    console.log("Admin user created successfully.");
    console.log(`id=${user.id} username=${user.username} email=${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to create/update admin user.");
  console.error(error);
  process.exit(1);
});
