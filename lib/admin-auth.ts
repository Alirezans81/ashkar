import { cookies } from "next/headers";
import { authenticateUser } from "./user-service";
import { User, UserRole } from "./generated/prisma/client";

export interface AdminSession {
  id: string;
  userId: string;
  username: string;
  role: UserRole;
  exp: number;
}

/**
 * Authenticate admin user against database
 */
export async function authenticateAdmin(
  username: string,
  password: string,
): Promise<User | null> {
  const user = await authenticateUser(username, password);

  // Check if user exists and has admin role
  if (user && user.role === UserRole.ADMIN) {
    return user;
  }

  return null;
}

/**
 * Create a new admin session token
 * Using a simple approach for Edge Runtime compatibility
 */
export async function createAdminSession(user: User): Promise<string> {
  // Create a simple token with user data
  const payload = {
    id: crypto.randomUUID(), // Use crypto.randomUUID instead of nanoid
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  };

  // Encode the JSON to make it safe for cookies
  return encodeURIComponent(JSON.stringify(payload));
}

/**
 * Verify admin session token
 * Using a simple approach for Edge Runtime compatibility
 */
export async function verifyAdminSession(
  token: string,
): Promise<AdminSession | null> {
  try {
    // Decode and parse the token
    const decodedToken = decodeURIComponent(token);
    const payload: AdminSession = JSON.parse(decodedToken);

    // Check if token is expired
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Admin session verification failed:", error);
    return null;
  }
}

/**
 * Get current admin session from cookies
 */
export async function getCurrentAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    return verifyAdminSession(token);
  } catch (error) {
    console.error("Failed to get current admin session:", error);
    return null;
  }
}

/**
 * Set admin session cookie
 */
export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  // Store the token in a cookie with proper options
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
    sameSite: "strict",
  });
}

/**
 * Clear admin session cookie
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
}
