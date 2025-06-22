import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { peminjamanId, userId } = await request.json();

    if (!peminjamanId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the user matches the session user
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if peminjaman exists and belongs to user
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id: peminjamanId },
      select: { userId: true }
    });

    if (!peminjaman) {
      return NextResponse.json({ error: 'Peminjaman not found' }, { status: 404 });
    }

    if (peminjaman.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking peminjaman ownership:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 