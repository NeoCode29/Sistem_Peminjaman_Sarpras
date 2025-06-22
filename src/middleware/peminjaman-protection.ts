import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function protectPeminjamanDetail(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Extract peminjaman ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const peminjamanIndex = pathSegments.indexOf('peminjaman');
    
    if (peminjamanIndex === -1 || !pathSegments[peminjamanIndex + 1]) {
      return NextResponse.next();
    }

    const peminjamanId = pathSegments[peminjamanIndex + 1];

    // Check if peminjaman exists and belongs to user (for PEMINJAM role)
    if (session.user.role === 'PEMINJAM') {
      try {
        // Use API route instead of direct Prisma call to avoid Edge Runtime issues
        const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
        const response = await fetch(`${baseUrl}/api/peminjaman/check-ownership`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({
            peminjamanId,
            userId: session.user.id,
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            return NextResponse.redirect(new URL('/peminjam/404', request.url));
          }
          if (response.status === 403) {
            return NextResponse.redirect(new URL('/peminjam/unauthorized', request.url));
          }
          // For other errors, continue to next middleware
          return NextResponse.next();
        }
      } catch (error) {
        console.error('Error checking peminjaman ownership:', error);
        // Continue to next middleware instead of failing
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Peminjaman protection middleware error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
} 