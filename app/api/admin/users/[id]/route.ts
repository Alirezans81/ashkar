import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { 
  getUserById, 
  updateUser, 
  deleteUser,
  authenticateUser,
  isAdmin as checkIsAdmin,
  getUserByUsername
} from '@/lib/user-service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Admin user fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch user' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;
    const body = await request.json();

    // Prevent updating the admin user's own role to non-admin
    if (requestingUser?.id === id && body.role && body.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Cannot change your own admin role' },
        { status: 400 }
      );
    }

    const user = await updateUser(id, body);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update user' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;

    // Prevent deleting the admin user's own account
    if (requestingUser?.id === id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await deleteUser(id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Admin user deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete user' 
      },
      { status: 500 }
    );
  }
}