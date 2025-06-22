import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

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

    // Get all prasarana
    const prasaranaList = await prisma.prasarana.findMany({
      select: {
        id: true,
        nama: true,
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
        peminjamanPrasarana: {
          include: {
            prasarana: true
          }
        }
      }
    });

    // Calculate availability for each prasarana
    const availabilityData = prasaranaList.map(prasarana => {
      // Check if this prasarana is booked in the date range
      const isBooked = overlappingPeminjaman.some(peminjaman => 
        peminjaman.peminjamanPrasarana.some(peminjamanPrasarana => 
          peminjamanPrasarana.prasarana.id === prasarana.id
        )
      );

      // Find next available date if currently booked
      let nextAvailableDate = null;
      if (isBooked) {
        // Find the latest end date of all overlapping bookings for this prasarana
        const bookingEndDates = overlappingPeminjaman
          .filter(peminjaman => 
            peminjaman.peminjamanPrasarana.some(peminjamanPrasarana => 
              peminjamanPrasarana.prasarana.id === prasarana.id
            )
          )
          .map(peminjaman => peminjaman.tanggal_acara_berakhir)
          .filter((date): date is Date => date !== null)
          .sort((a, b) => b.getTime() - a.getTime());

        if (bookingEndDates.length > 0) {
          nextAvailableDate = addDays(bookingEndDates[0], 1).toISOString();
        }
      }

      // Get booked dates for this prasarana
      const bookedDates = overlappingPeminjaman
        .filter(peminjaman => 
          peminjaman.peminjamanPrasarana.some(peminjamanPrasarana => 
            peminjamanPrasarana.prasarana.id === prasarana.id
          ) &&
          peminjaman.tanggal_acara_dimulai !== null &&
          peminjaman.tanggal_acara_berakhir !== null
        )
        .map(peminjaman => ({
          start: peminjaman.tanggal_acara_dimulai!.toISOString(),
          end: peminjaman.tanggal_acara_berakhir!.toISOString()
        }));

      return {
        id: prasarana.id,
        nama: prasarana.nama,
        isAvailable: !isBooked,
        bookedDates: bookedDates,
        nextAvailableDate: nextAvailableDate
      };
    });

    return NextResponse.json(availabilityData);
  } catch (error) {
    console.error('Error checking prasarana availability:', error);
    return NextResponse.json(
      { error: 'Gagal memeriksa ketersediaan prasarana' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 