import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    // Only allow users to access their own profile unless admin
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mahasiswa: {
          include: {
            jurusanJurusan: true,
            prodiProdi: true,
          }
        },
        pegawai: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      number_phone: user.number_phone,
      role: user.role,
      mahasiswa: user.mahasiswa,
      pegawai: user.pegawai,
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, number_phone, mahasiswa, pegawai } = body;

    // Update user basic info (email is excluded from updates)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        number_phone,
      },
      include: {
        mahasiswa: {
          include: {
            jurusanJurusan: true,
            prodiProdi: true,
          }
        },
        pegawai: true,
      },
    });

    // Update mahasiswa data if provided
    if (mahasiswa && updatedUser.mahasiswa) {
      await prisma.mahasiswa.update({
        where: { userId: session.user.id },
        data: {
          nim: mahasiswa.nim,
          jurusanId: mahasiswa.jurusanId || null,
          prodiId: mahasiswa.prodiId || null,
        },
      });
    }

    // Update pegawai data if provided
    if (pegawai && updatedUser.pegawai) {
      await prisma.pegawai.update({
        where: { userId: session.user.id },
        data: {
          nomer_induk: pegawai.nomer_induk,
          unit_pegawai: pegawai.unit_pegawai,
        },
      });
    }

    // Fetch updated data with relations
    const finalUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        mahasiswa: {
          include: {
            jurusanJurusan: true,
            prodiProdi: true,
          }
        },
        pegawai: true,
      },
    });

    return NextResponse.json({
      id: finalUser!.id,
      name: finalUser!.name,
      email: finalUser!.email,
      number_phone: finalUser!.number_phone,
      role: finalUser!.role,
      mahasiswa: finalUser!.mahasiswa,
      pegawai: finalUser!.pegawai,
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 