import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate dan endDate harus disediakan' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all sarana with their stock
    const saranaList = await prisma.sarana.findMany({
      select: {
        id: true,
        nama: true,
        stok: true,
        sisa: true,
        status: true,
      },
      where: {
        status: 'TERSEDIA'
      }
    });

    // Get all peminjaman that overlap with the requested date range
    const overlappingPeminjaman = await prisma.peminjaman.findMany({
      where: {
        AND: [
          {
            tanggal_acara_dimulai: {
              lte: end
            }
          },
          {
            tanggal_acara_berakhir: {
              gte: start
            }
          },
          {
            OR: [
              { status_peminjaman: 'DITERIMA' },
              { status_peminjaman: 'DALAM_PROSES' },
              { status_pengajuan: 'MENUNGGU_PENINJAUAN' },
              { status_pengajuan: 'PENGAJUAN_DITERIMA' }
            ]
          }
        ]
      },
      include: {
        peminjamanSarana: {
          include: {
            sarana: true
          }
        }
      }
    });

    // Calculate availability for each sarana
    const availabilityData = saranaList.map(sarana => {
      // Calculate total booked quantity for this sarana in the date range
      let totalBooked = 0;
      
      overlappingPeminjaman.forEach(peminjaman => {
        peminjaman.peminjamanSarana.forEach(peminjamanSarana => {
          if (peminjamanSarana.sarana.id === sarana.id) {
            totalBooked += peminjamanSarana.jumlah;
          }
        });
      });

      const availableStock = Math.max(0, sarana.sisa - totalBooked);

      return {
        id: sarana.id,
        nama: sarana.nama,
        totalStock: sarana.stok,
        baseStock: sarana.sisa,
        bookedStock: totalBooked,
        availableStock: availableStock,
        isAvailable: availableStock > 0
      };
    });

    return NextResponse.json(availabilityData);
  } catch (error) {
    console.error('Error checking sarana availability:', error);
    return NextResponse.json(
      { error: 'Gagal memeriksa ketersediaan sarana' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 