import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

export interface SaranaAvailability {
  id: string;
  nama: string;
  totalStock: number;
  baseStock: number;
  bookedStock: number;
  availableStock: number;
  isAvailable: boolean;
}

export interface PrasaranaAvailability {
  id: string;
  nama: string;
  isAvailable: boolean;
  bookedDates: Array<{
    start: string;
    end: string;
  }>;
  nextAvailableDate: string | null;
}

export class AvailabilityService {
  static async checkSaranaAvailability(startDate: Date, endDate: Date): Promise<SaranaAvailability[]> {
    try {
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
                lte: endDate
              }
            },
            {
              tanggal_acara_berakhir: {
                gte: startDate
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

      return availabilityData;
    } catch {
      throw new Error('Gagal memeriksa ketersediaan sarana');
    }
  }

  static async checkPrasaranaAvailability(startDate: Date, endDate: Date): Promise<PrasaranaAvailability[]> {
    try {
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
                lte: endDate
              }
            },
            {
              tanggal_acara_berakhir: {
                gte: startDate
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

      return availabilityData;
    } catch {
      throw new Error('Gagal memeriksa ketersediaan prasarana');
    }
  }

  static async getSaranaWithCategories() {
    try {
      return await prisma.sarana.findMany({
        select: {
          id: true,
          nama: true,
          lokasi: true,
          status: true,
          stok: true,
          sisa: true,
          jenis: true,
          image_url: true,
          kategoriSarana: {
            select: {
              id: true,
              nama: true
            }
          },
          satuanSatuan: {
            select: {
              nama: true,
              singkatan: true
            }
          }
        },
        orderBy: {
          nama: 'asc'
        }
      });
    } catch {
      throw new Error('Gagal memuat data sarana');
    }
  }

  static async getPrasarana() {
    try {
      return await prisma.prasarana.findMany({
        include: {
          image_url: {
            select: {
              id: true,
              image_url: true
            }
          }
        },
        orderBy: {
          nama: 'asc'
        }
      });
    } catch {
      throw new Error('Gagal memuat data prasarana');
    }
  }

  static async getCategories() {
    try {
      return await prisma.kategoriSarana.findMany({
        select: {
          id: true,
          nama: true
        },
        orderBy: {
          nama: 'asc'
        }
      });
    } catch {
      throw new Error('Gagal memuat data kategori');
    }
  }
} 