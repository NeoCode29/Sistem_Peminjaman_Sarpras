import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PEMINJAM') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      nama_acara,
      tanggal_acara_dimulai,
      tanggal_acara_berakhir,
      waktu_mulai,
      waktu_berakhir,
      deskripsi,
      lokasi,
      lokasi_manual,
      jumlah_peserta,
      ormawaId,
      unit_pegawai
    } = body;

    if (!nama_acara || !tanggal_acara_dimulai) {
      return NextResponse.json(
        { message: 'Nama acara dan tanggal mulai wajib diisi' },
        { status: 400 }
      );
    }

    // Create marking with related data
    const marking = await prisma.marking.create({
      data: {
        userId: session.user.id,
        nama_acara,
        tanggal_acara_dimulai: new Date(tanggal_acara_dimulai),
        tanggal_acara_berakhir: tanggal_acara_berakhir ? new Date(tanggal_acara_berakhir) : null,
        waktu_mulai,
        waktu_berakhir,
        deskripsi,
        lokasi,
        lokasi_manual,
        jumlah_peserta,
        ormawaId: ormawaId || null,
        unit_pegawai: unit_pegawai || null,
        status: 'AKTIF'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        ormawa: {
          select: {
            id: true,
            nama: true
          }
        }
      }
    });

    return NextResponse.json(marking);
  } catch (error) {
    console.error('Error creating marking:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If user is PEMINJAM, only show their own markings
    const whereClause = session.user.role === 'PEMINJAM' 
      ? { userId: session.user.id }
      : userId 
        ? { userId }
        : {};

    const markings = await prisma.marking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        ormawa: {
          select: {
            id: true,
            nama: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(markings);
  } catch (error) {
    console.error('Error fetching markings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 