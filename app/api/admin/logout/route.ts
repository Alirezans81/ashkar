import { NextResponse } from 'next/server';
import { clearAdminSessionCookie } from '@/lib/admin-auth';

export async function POST() {
  try {
    await clearAdminSessionCookie();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
