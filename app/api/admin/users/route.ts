import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  authenticateUser,
  isAdmin as checkIsAdmin,
  getUserByUsername
} from '@/lib/user-service';
import { UserRole } from '@/lib/generated/prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user info to verify admin privileges
    const requestingUser = await authenticateUser(session.username, ''); // We'll get the user by username
    
    // Since we don't have the password, we'll find by username directly
    const requestingUserFromDb = await getUserById(session.userId || '');
    if (!requestingUserFromDb || !checkIsAdmin(requestingUserFromDb)) {
      // If userId isn't in session, find by username
      const user = await getUserByUsername(session.username);
      if (!user || !checkIsAdmin(user)) {
        return NextResponse.json(
          { success: false, message: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const users = await getAllUsers(page, limit);

    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
}

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

    // Verify admin privileges
    const requestingUser = await getUserByUsername(session.username);
    if (!requestingUser || !checkIsAdmin(requestingUser)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.username || !body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Create the user
    const user = await createUser({
      username: body.username,
      email: body.email,
      password: body.password,
      role: body.role || UserRole.USER,
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Admin user creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create user' 
      },
      { status: 500 }
    );
  }
}