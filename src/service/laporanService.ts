import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { StatusPeminjaman, StatusPengajuan } from "@prisma/client";

export interface LaporanPeminjaman {
  id: string;
  nama_acara: string;
  tanggal_acara_dimulai: Date | null;
  tanggal_acara_berakhir: Date | null;
  jumlah_peserta: number | null;
  status_peminjaman: StatusPeminjaman;
  status_pengajuan: StatusPengajuan;
  tanggal_pengajuan: Date;
  user: {
    name: string | null;
    email: string | null;
    mahasiswa: {
      nim: string | null;
      jurusanJurusan: {
        nama: string;
      } | null;
      prodiProdi: {
        nama: string;
      } | null;
    } | null;
    pegawai: {
      nomer_induk: string | null;
      unit_pegawai: string | null;
    } | null;
  };
  ormawa: {
    nama: string;
  } | null;
  unit_pegawai: string | null;
  peminjamanSarana: Array<{
    jumlah: number;
    sarana: {
      nama: string;
      satuan: {
        nama: string;
        singkatan: string;
      };
    };
  }>;
  peminjamanPrasarana: Array<{
    prasarana: {
      nama: string;
      lokasi: string | null;
    };
  }>;
}

export const getLaporanPeminjamanBulanan = async (
  currentDate: Date
): Promise<LaporanPeminjaman[]> => {
  try {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);

    const laporan = await prisma.peminjaman.findMany({
      where: {
        tanggal_pengajuan: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            mahasiswa: {
              select: {
                nim: true,
                jurusanJurusan: {
                  select: {
                    nama: true,
                  },
                },
                prodiProdi: {
                  select: {
                    nama: true,
                  },
                },
              },
            },
            pegawai: {
              select: {
                nomer_induk: true,
                unit_pegawai: true,
              },
            },
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
              include: {
                satuanSatuan: {
                  select: {
                    nama: true,
                    singkatan: true,
                  },
                },
              },
            },
          },
        },
        peminjamanPrasarana: {
          include: {
            prasarana: {
              select: {
                nama: true,
                lokasi: true,
              },
            },
          },
        },
      },
      orderBy: {
        tanggal_pengajuan: "desc",
      },
    });

    // Transform data untuk menyesuaikan interface
    return laporan.map((item) => ({
      ...item,
      peminjamanSarana: item.peminjamanSarana.map((ps) => ({
        jumlah: ps.jumlah,
        sarana: {
          nama: ps.sarana.nama,
          satuan: {
            nama: ps.sarana.satuanSatuan.nama,
            singkatan: ps.sarana.satuanSatuan.singkatan,
          },
        },
      })),
    }));
  } catch (error) {
    console.error("Error fetching laporan peminjaman:", error);
    throw new Error("Failed to fetch laporan peminjaman");
  }
}; 