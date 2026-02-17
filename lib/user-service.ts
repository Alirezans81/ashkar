import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcrypt';
import { User, UserRole } from './generated/prisma/client';

// Zod schema for validating user input
const CreateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.USER),
});

const UpdateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;
type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Creates a new user with hashed password
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  // Validate input
  const validatedInput = CreateUserSchema.parse(input);

  // Check if user with username or email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: validatedInput.username },
        { email: validatedInput.email },
      ],
    },
  });

  if (existingUser) {
    throw new Error('User with this username or email already exists');
  }

  // Hash the password
  const hashedPassword = await hash(validatedInput.password, 10);

  // Create the user
  const user = await prisma.user.create({
    data: {
      username: validatedInput.username,
      email: validatedInput.email,
      password: hashedPassword,
      role: validatedInput.role,
    },
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Updates an existing user
 */
export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  // Validate input
  const validatedInput = UpdateUserSchema.parse(input);

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Check if new username or email conflicts with existing users
  if (validatedInput.username || validatedInput.email) {
    const conflictingUser = await prisma.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              ...(validatedInput.username ? [{ username: validatedInput.username }] : []),
              ...(validatedInput.email ? [{ email: validatedInput.email }] : []),
            ],
          },
          {
            id: { not: id }, // Exclude current user
          },
        ],
      },
    });

    if (conflictingUser) {
      throw new Error('Another user with this username or email already exists');
    }
  }

  // Prepare update data
  const updateData: any = { ...validatedInput };
  
  // Hash password if it's being updated
  if (validatedInput.password) {
    updateData.password = await hash(validatedInput.password, 10);
  }

  // Update the user
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Gets a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Gets a user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  return user;
}

/**
 * Gets a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user;
}

/**
 * Authenticates a user by username/email and password
 */
export async function authenticateUser(identifier: string, password: string): Promise<User | null> {
  // Find user by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
      ],
    },
  });

  if (!user) {
    // Still run compare to prevent timing attacks
    await compare(password, '$2b$10$invalidhash');
    return null;
  }

  // Compare password
  const isValid = await compare(password, user.password);
  if (!isValid) {
    return null;
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Gets all users with pagination
 */
export async function getAllUsers(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users: users.map(({ password: _, ...user }) => user), // Remove password from each user
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/**
 * Deletes a user by ID
 */
export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });
}

/**
 * Checks if a user has admin privileges
 */
export function isAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN;
}