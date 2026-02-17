import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, createAdminSession, setAdminSessionCookie } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateAdmin(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or insufficient privileges' },
        { status: 401 }
      );
    }

    const token = await createAdminSession(user);
    await setAdminSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
