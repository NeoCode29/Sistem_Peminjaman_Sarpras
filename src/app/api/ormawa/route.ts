import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const ormawa = await prisma.ormawa.findMany({
      select: {
        id: true,
        nama: true,
      },
      orderBy: {
        nama: 'asc'
      }
    });

    return NextResponse.json(ormawa);
  } catch (error) {
    console.error('Error fetching ormawa:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 