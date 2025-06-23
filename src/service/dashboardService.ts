import { prisma } from "@/lib/prisma";
import { StatusPeminjaman, StatusPengajuan } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";

export interface DashboardStats {
  totalPeminjaman: number;
  peminjamanAktif: number;
  peminjamanSelesai: number;
  peminjamanDitolak: number;
  peminjamanPending: number;
  totalSarana: number;
  saranaAktif: number;
  saranaRusak: number;
  saranaDipinjam: number;
  totalStokSarana: number;
  stokTersediaSarana: number;
  totalPrasarana: number;
  prasaranaAktif: number;
  prasaranaRusak: number;
  prasaranaDipinjam: number;
  totalKapasitasPrasarana: number;
}

export interface CalendarEvent {
  id: string;
  nama_acara: string;
  tanggal_acara_dimulai: Date | null;
  tanggal_acara_berakhir: Date | null;
  jumlah_peserta: number | null;
  status_peminjaman: StatusPeminjaman;
  status_pengajuan: StatusPengajuan;
  unit_pegawai: string | null;
  user: {
    name: string | null;
    email: string | null;
  };
  ormawa: {
    nama: string;
  } | null;
  peminjamanSarana: Array<{
    jumlah: number;
    sarana: {
      nama: string;
    };
  }>;
  peminjamanPrasarana: Array<{
    prasarana: {
      nama: string;
    };
  }>;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Peminjaman statistics
    const [
      totalPeminjaman,
      peminjamanAktif,
      peminjamanSelesai,
      peminjamanDitolak,
      peminjamanPending
    ] = await Promise.all([
      // Total peminjaman
      prisma.peminjaman.count(),
      
      // Peminjaman aktif (diterima dan dalam proses)
      prisma.peminjaman.count({
        where: {
          status_peminjaman: {
            in: [StatusPeminjaman.DITERIMA, StatusPeminjaman.DALAM_PROSES]
          },
          status_pengajuan: {
            not: StatusPengajuan.PENGAJUAN_DITOLAK
          }
        }
      }),
      
      // Peminjaman selesai
      prisma.peminjaman.count({
        where: {
          status_peminjaman: StatusPeminjaman.SELESAI
        }
      }),
      
      // Peminjaman ditolak
      prisma.peminjaman.count({
        where: {
          status_pengajuan: StatusPengajuan.PENGAJUAN_DITOLAK
        }
      }),
      
      // Pending approval (dalam proses)
      prisma.peminjaman.count({
        where: {
          status_peminjaman: StatusPeminjaman.DALAM_PROSES,
          status_pengajuan: {
            not: StatusPengajuan.PENGAJUAN_DITOLAK
          }
        }
      })
    ]);

    // Sarana statistics
    const [
      totalSarana,
      saranaAktif,
      saranaRusak,
      saranaDipinjam,
      totalStokSarana,
      stokTersediaSarana
    ] = await Promise.all([
      // Total sarana
      prisma.sarana.count(),
      
      // Sarana tersedia
      prisma.sarana.count({
        where: { status: "TERSEDIA" }
      }),
      
      // Sarana rusak
      prisma.sarana.count({
        where: { status: "RUSAK" }
      }),
      
      // Sarana dipinjam
      prisma.sarana.count({
        where: { status: "DIPINJAM" }
      }),
      
      // Total stok
      prisma.sarana.aggregate({
        _sum: { stok: true }
      }).then(result => result._sum.stok || 0),
      
      // Stok tersedia
      prisma.sarana.aggregate({
        _sum: { sisa: true }
      }).then(result => result._sum.sisa || 0)
    ]);

    // Prasarana statistics
    const [
      totalPrasarana,
      prasaranaAktif,
      prasaranaRusak,
      prasaranaDipinjam,
      totalKapasitasPrasarana
    ] = await Promise.all([
      // Total prasarana
      prisma.prasarana.count(),
      
      // Prasarana tersedia
      prisma.prasarana.count({
        where: { status: "TERSEDIA" }
      }),
      
      // Prasarana rusak
      prisma.prasarana.count({
        where: { status: "RUSAK" }
      }),
      
      // Prasarana dipinjam
      prisma.prasarana.count({
        where: { status: "DIPINJAM" }
      }),
      
      // Total kapasitas
      prisma.prasarana.aggregate({
        _sum: { kapasitas: true }
      }).then(result => result._sum.kapasitas || 0)
    ]);

    return {
      totalPeminjaman,
      peminjamanAktif,
      peminjamanSelesai,
      peminjamanDitolak,
      peminjamanPending,
      totalSarana,
      saranaAktif,
      saranaRusak,
      saranaDipinjam,
      totalStokSarana,
      stokTersediaSarana,
      totalPrasarana,
      prasaranaAktif,
      prasaranaRusak,
      prasaranaDipinjam,
      totalKapasitasPrasarana
    };
  } catch (error) {
    throw new Error("Failed to fetch dashboard statistics");
  }
};

export const getCalendarEvents = async (
  startDate: Date,
  endDate: Date,
  limit: number = 100
): Promise<CalendarEvent[]> => {
  try {
    // Fetch peminjaman events
    const peminjamanEvents = await prisma.peminjaman.findMany({
      where: {
        OR: [
          {
            AND: [
              { tanggal_acara_dimulai: { gte: startDate } },
              { tanggal_acara_dimulai: { lte: endDate } }
            ]
          },
          {
            AND: [
              { tanggal_acara_berakhir: { gte: startDate } },
              { tanggal_acara_berakhir: { lte: endDate } }
            ]
          },
          {
            AND: [
              { tanggal_acara_dimulai: { lte: startDate } },
              { tanggal_acara_berakhir: { gte: endDate } }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        ormawa: {
          select: {
            nama: true,
          },
        },
        peminjamanSarana: {
          include: {
            sarana: {
              select: {
                nama: true,
              },
            },
          },
        },
        peminjamanPrasarana: {
          include: {
            prasarana: {
              select: {
                nama: true,
              },
            },
          },
        },
      },
      orderBy: {
        tanggal_acara_dimulai: "asc",
      },
      take: limit,
    });

    // Fetch marking events
    const markingEvents = await prisma.marking.findMany({
      where: {
        OR: [
          {
            AND: [
              { tanggal_acara_dimulai: { gte: startDate } },
              { tanggal_acara_dimulai: { lte: endDate } }
            ]
          },
          {
            AND: [
              { tanggal_acara_berakhir: { gte: startDate } },
              { tanggal_acara_berakhir: { lte: endDate } }
            ]
          },
          {
            AND: [
              { tanggal_acara_dimulai: { lte: startDate } },
              { tanggal_acara_berakhir: { gte: endDate } }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        ormawa: {
          select: {
            nama: true,
          },
        },
      },
      orderBy: {
        tanggal_acara_dimulai: "asc",
      },
      take: limit,
    });

    // Combine and format events
    const allEvents: CalendarEvent[] = [
      ...peminjamanEvents,
      ...markingEvents.map(marking => ({
        id: marking.id,
        nama_acara: marking.nama_acara,
        tanggal_acara_dimulai: marking.tanggal_acara_dimulai,
        tanggal_acara_berakhir: marking.tanggal_acara_berakhir,
        jumlah_peserta: marking.jumlah_peserta,
        status_peminjaman: marking.status as any, // Convert MarkingStatus to StatusPeminjaman
        status_pengajuan: marking.status as any, // Use marking status for both
        unit_pegawai: marking.unit_pegawai,
        user: marking.user,
        ormawa: marking.ormawa,
        peminjamanSarana: [], // Marking doesn't have sarana
        peminjamanPrasarana: [], // Marking doesn't have prasarana
      }))
    ];

    // Sort by date
    allEvents.sort((a, b) => {
      const dateA = a.tanggal_acara_dimulai ? new Date(a.tanggal_acara_dimulai) : new Date(0);
      const dateB = b.tanggal_acara_dimulai ? new Date(b.tanggal_acara_dimulai) : new Date(0);
      return dateA.getTime() - dateB.getTime();
    });

    return allEvents.slice(0, limit);
  } catch (error) {
    throw new Error("Failed to fetch calendar events");
  }
};

export const getMonthlyCalendarEvents = async (
  currentDate: Date,
  limit: number = 1000
): Promise<CalendarEvent[]> => {
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  
  return getCalendarEvents(startDate, endDate, limit);
}; 