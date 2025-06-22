import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PEMINJAM') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Check if marking exists and belongs to the user
    const marking = await prisma.marking.findUnique({
      where: { id },
      select: {
        userId: true,
        nama_acara: true
      }
    });

    if (!marking) {
      return NextResponse.json(
        { message: 'Marking tidak ditemukan' },
        { status: 404 }
      );
    }

    if (marking.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Anda tidak memiliki akses untuk menghapus marking ini' },
        { status: 403 }
      );
    }

    // Delete the marking
    await prisma.marking.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: 'Marking berhasil dihapus',
      markingName: marking.nama_acara 
    });
  } catch (error) {
    console.error('Error deleting marking:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 