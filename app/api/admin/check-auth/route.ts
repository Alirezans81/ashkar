import { NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const session = await getCurrentAdminSession();
    
    return NextResponse.json({
      authenticated: !!session,
      user: session ? { 
        id: session.userId,
        username: session.username,
        role: session.role 
      } : null
    });
  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}