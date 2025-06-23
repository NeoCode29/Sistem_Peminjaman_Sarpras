"use server";

import { prisma } from "@/lib/prisma";
import { uploadSuratPeminjaman, deleteSuratPeminjaman } from "@/lib/drive/peminjamanDrive";
import {
  Peminjaman,
  PeminjamanPrasarana,
  PeminjamanSarana,
  Prisma,
  SarprasPeminjaman,
  StatusPeminjaman,
  StatusPengajuan,
  StatusPengambilan,
  StatusPengembalian,
  UserRole,
} from "@prisma/client";
import {
  createStatusNotification,
  // createPickupReminder,
  // createReturnReminder,
  // createLateReturnNotification,
  createAdminMessageNotification,
} from "@/service/notificationService";

// Types
export interface CreatePeminjamanInput {
  userId: string;
  nama_acara: string;
  tanggal_acara_dimulai: Date;
  tanggal_acara_berakhir: Date;
  jumlah_peserta: number;
  deskripsi_acara: string;
  surat_pengajuan: Buffer;
  surat_pengajuan_name: string;
  sarpras_peminjaman: SarprasPeminjaman;
  ormawa?: string;
  unit_pegawai?: string;
  prasaranaIds?: string[];
  saranaItems?: {
    saranaId: string;
    jumlah: number;
  }[];
}

export interface UpdatePeminjamanInput {
  nama_acara?: string;
  tanggal_acara_dimulai?: Date;
  tanggal_acara_berakhir?: Date;
  jumlah_peserta?: number;
  deskripsi_acara?: string;
  url_surat_pengajuan?: string;
  ormawa?: string;
  unit_pegawai?: string;
  prasaranaIds?: string[];
  saranaItems?: {
    saranaId: string;
    jumlah: number;
  }[];
}

export interface PeminjamanWithItems extends Peminjaman {
  ormawa?: {
    id: string;
    nama: string;
  } | null;
  peminjamanPrasarana: (PeminjamanPrasarana & {
    prasarana: {
      nama: string;
      status: string;
    };
  })[];
  peminjamanSarana: (PeminjamanSarana & {
    sarana: {
      nama: string;
      status: string;
      sisa: number;
      jenis: string;
      satuanSatuan: {
        nama: string;
        singkatan: string;
      };
      detailSarana: {
        id: string;
        nomer_seri: string | null;
        status: string;
        lokasi: string | null;
      }[];
    };
    jumlah: number;
    peminjamanSaranaDetail: {
      id: string;
      nama_barang: string;
      satuan: string;
      sudah_ambil: boolean;
      sudah_kembali: boolean;
    }[];
  })[];
}

// Validation functions
const validatePeminjamanDates = async (
  tanggal_acara_dimulai: Date,
  tanggal_acara_berakhir: Date,
  prasaranaIds?: string[],
  saranaItems?: { saranaId: string; jumlah: number }[]
): Promise<string | null> => {
  // const now = new Date();
  const startDate = new Date(tanggal_acara_dimulai);
  const endDate = new Date(tanggal_acara_berakhir);

  // Get minimal_hari_pengajuan from settings
  const minimalHariSetting = await prisma.pengaturan.findUnique({
    where: { nama: 'minimal_hari_pengajuan' },
  });
  const minimalHari = minimalHariSetting ? parseInt(minimalHariSetting.nilai) : 3;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + minimalHari);

  if (startDate < minDate) {
    return `Tanggal acara harus diajukan minimal ${minimalHari} hari sebelumnya`;
  }
  if (endDate < startDate) {
    return "Tanggal acara berakhir tidak boleh kurang dari tanggal dimulai";
  }

  // Check prasarana availability
  if (prasaranaIds?.length) {
    const overlappingPrasarana = await prisma.peminjamanPrasarana.findMany({
      where: {
        prasaranaId: { in: prasaranaIds },
        peminjaman: {
          AND: [
            {
              OR: [
                {
                  AND: [
                    { tanggal_acara_dimulai: { lte: startDate } },
                    { tanggal_acara_berakhir: { gte: startDate } },
                  ],
                },
                {
                  AND: [
                    { tanggal_acara_dimulai: { lte: endDate } },
                    { tanggal_acara_berakhir: { gte: endDate } },
                  ],
                },
              ],
            },
            {
              status_peminjaman: {
                in: [StatusPeminjaman.DALAM_PROSES, StatusPeminjaman.DITERIMA],
              },
            },
          ],
        },
      },
      include: {
        prasarana: {
          select: {
            nama: true,
          },
        },
      },
    });

    if (overlappingPrasarana.length > 0) {
      const unavailablePrasarana = overlappingPrasarana.map(pp => pp.prasarana.nama).join(", ");
      return `Prasarana berikut sudah dipinjam pada tanggal tersebut: ${unavailablePrasarana}`;
    }
  }

  // Check sarana availability
  if (saranaItems?.length) {
    const saranaIds = saranaItems.map(item => item.saranaId);
    const overlappingSarana = await prisma.peminjamanSarana.findMany({
      where: {
        saranaId: { in: saranaIds },
        peminjaman: {
          AND: [
            {
              OR: [
                {
                  AND: [
                    { tanggal_acara_dimulai: { lte: startDate } },
                    { tanggal_acara_berakhir: { gte: startDate } },
                  ],
                },
                {
                  AND: [
                    { tanggal_acara_dimulai: { lte: endDate } },
                    { tanggal_acara_berakhir: { gte: endDate } },
                  ],
                },
              ],
            },
            {
              status_peminjaman: {
                in: [StatusPeminjaman.DALAM_PROSES, StatusPeminjaman.DITERIMA],
              },
            },
          ],
        },
      },
      include: {
        sarana: {
          select: {
            nama: true,
            sisa: true,
          },
        },
      },
    });

    // Group overlapping sarana by ID and sum their quantities
    const saranaUsage = new Map<string, number>();
    for (const ps of overlappingSarana) {
      const currentUsage = saranaUsage.get(ps.saranaId) || 0;
      saranaUsage.set(ps.saranaId, currentUsage + ps.jumlah);
    }

    // Check if requested quantities are available
    for (const item of saranaItems) {
      const currentUsage = saranaUsage.get(item.saranaId) || 0;
      const sarana = overlappingSarana.find(ps => ps.saranaId === item.saranaId)?.sarana;
      
      if (sarana && (sarana.sisa - currentUsage) < item.jumlah) {
        return `Stok ${sarana.nama} tidak mencukupi untuk tanggal tersebut (tersedia: ${sarana.sisa - currentUsage})`;
      }
    }
  }

  return null;
};

const validatePeminjamanItems = async (
  prasaranaIds?: string[],
  saranaItems?: { saranaId: string; jumlah: number }[]
): Promise<string | null> => {
  // Validate prasarana
  if (prasaranaIds?.length) {
    const prasaranas = await prisma.prasarana.findMany({
      where: { id: { in: prasaranaIds } },
    });

    const unavailablePrasarana = prasaranas.filter(p => p.status !== "TERSEDIA");
    if (unavailablePrasarana.length > 0) {
      return `Prasarana berikut tidak tersedia: ${unavailablePrasarana.map(p => p.nama).join(", ")}`;
    }
  }

  // Validate sarana
  if (saranaItems?.length) {
    const saranas = await prisma.sarana.findMany({
      where: { id: { in: saranaItems.map(item => item.saranaId) } },
    });

    for (const item of saranaItems) {
      const sarana = saranas.find(s => s.id === item.saranaId);
      if (!sarana) continue;

      if (sarana.status !== "TERSEDIA") {
        return `Sarana ${sarana.nama} tidak tersedia`;
      }
      if (sarana.sisa < item.jumlah) {
        return `Stok ${sarana.nama} tidak mencukupi (tersedia: ${sarana.sisa})`;
      }
    }
  }

  return null;
};

// Peminjam (Borrower) Services
export async function createPeminjaman(data: CreatePeminjamanInput) {
  try {
    // Validate user role
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: {
        mahasiswa: true,
        pegawai: true
      }
    });

    if (!user) {
      return { error: 'User tidak ditemukan' };
    }

    if (user.role !== 'PEMINJAM') {
      return { error: 'User tidak memiliki akses untuk membuat peminjaman' };
  }

  // Validate dates
    const startDate = new Date(data.tanggal_acara_dimulai);
    const endDate = new Date(data.tanggal_acara_berakhir);
    const now = new Date();

    if (startDate < now) {
      return { error: 'Tanggal acara tidak boleh di masa lalu' };
    }

    if (endDate < startDate) {
      return { error: 'Tanggal selesai tidak boleh sebelum tanggal mulai' };
    }

  // Validate items
    if (data.sarpras_peminjaman === 'SARANA' && (!data.saranaItems || data.saranaItems.length === 0)) {
      return { error: 'Pilih minimal satu sarana' };
    }

    if (data.sarpras_peminjaman === 'PRASARANA' && (!data.prasaranaIds || data.prasaranaIds.length === 0)) {
      return { error: 'Pilih minimal satu prasarana' };
    }

    if (data.sarpras_peminjaman === 'BOTH' && 
        ((!data.saranaItems || data.saranaItems.length === 0) && 
         (!data.prasaranaIds || data.prasaranaIds.length === 0))) {
      return { error: 'Pilih minimal satu sarana atau prasarana' };
    }

    // Upload file to Google Drive
    const fileId = await uploadSuratPeminjaman(data.surat_pengajuan, data.surat_pengajuan_name);
    if (!fileId) {
      return { error: 'Gagal mengupload surat pengajuan' };
    }



    // Create peminjaman record
    const peminjaman = await prisma.peminjaman.create({
      data: {
        nama_acara: data.nama_acara,
        tanggal_acara_dimulai: startDate,
        tanggal_acara_berakhir: endDate,
        jumlah_peserta: data.jumlah_peserta,
        deskripsi_acara: data.deskripsi_acara,
        url_surat_pengajuan: fileId.url,
        status_peminjaman: StatusPeminjaman.DALAM_PROSES,
        user: {
          connect: { id: data.userId }
        },
        ormawa: data.ormawa ? {
          connect: { id: data.ormawa }
        } : undefined,
        unit_pegawai: data.unit_pegawai,
        sarpras_peminjaman: data.sarpras_peminjaman,
        peminjamanPrasarana: data.prasaranaIds ? {
          create: data.prasaranaIds.map(id => ({
            prasarana: { connect: { id } }
          }))
        } : undefined,
        peminjamanSarana: data.saranaItems ? {
          create: data.saranaItems.map(item => ({
            sarana: { connect: { id: item.saranaId } },
            jumlah: item.jumlah
          }))
        } : undefined
      },
      include: {
        user: {
      include: {
        mahasiswa: true,
        pegawai: true
          }
        },
        peminjamanPrasarana: {
          include: {
            prasarana: true
          }
        },
        peminjamanSarana: {
          include: {
            sarana: true
          }
        }
      }
    });

    // Create notifications
    const userType = user.mahasiswa ? 'Mahasiswa' : 'Pegawai';
    const userIdentifier = user.mahasiswa?.nim || user.pegawai?.nomer_induk || 'N/A';

    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    });

    if (!admin) {
      return { error: 'Admin tidak ditemukan' };
    }

    await createAdminMessageNotification(
      data.userId,
      admin.id,
      peminjaman.id,
      `Pengajuan peminjaman baru dari ${userType} ${userIdentifier} untuk acara "${peminjaman.nama_acara}" menunggu peninjauan`
    );

    return { data: peminjaman };
  } catch {
    return { error: 'Terjadi kesalahan saat membuat peminjaman' };
  }
}

export const updatePeminjaman = async (
  userId: string,
  peminjamanId: string,
  data: UpdatePeminjamanInput
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      userId,
      status_pengajuan: StatusPengajuan.MENUNGGU_PENINJAUAN,
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau tidak dapat diubah");
  }

  if (data.tanggal_acara_dimulai && data.tanggal_acara_berakhir) {
    const dateError = await validatePeminjamanDates(
      data.tanggal_acara_dimulai,
      data.tanggal_acara_berakhir,
      data.prasaranaIds,
      data.saranaItems
    );
    if (dateError) throw new Error(dateError);
  }

  return await prisma.peminjaman.update({
    where: { id: peminjamanId },
    data: {
      ...data,
      ormawa: data.ormawa ? {
        connect: { id: data.ormawa }
      } : undefined
    },
  });
};

export const getPeminjamanList = async (
  userId: string,
  params: {
    search?: string;
    status?: StatusPeminjaman;
    statusPengajuan?: StatusPengajuan;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
): Promise<{ data: PeminjamanWithItems[]; total: number }> => {
  const { search, status, statusPengajuan, startDate, endDate, page = 1, limit = 10 } = params;

  const where: Prisma.PeminjamanWhereInput = {
    userId,
    ...(search && {
      OR: [
        { nama_acara: { contains: search } },
        { deskripsi_acara: { contains: search } },
      ],
    }),
    ...(status && { status_peminjaman: status }),
    ...(statusPengajuan && { status_pengajuan: statusPengajuan }),
    ...(startDate && endDate && {
      tanggal_acara_dimulai: { gte: startDate, lte: endDate },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.peminjaman.findMany({
      where,
      include: {
        ormawa: {
          select: {
            id: true,
            nama: true,
          },
        },
        peminjamanPrasarana: {
          include: {
            prasarana: {
              select: {
                nama: true,
                status: true,
              },
            },
          },
        },
        peminjamanSarana: {
          include: {
            sarana: {
              select: {
                nama: true,
                status: true,
                sisa: true,
                jenis: true,
                satuanSatuan: {
                  select: {
                    nama: true,
                    singkatan: true,
                  },
                },
                detailSarana: {
                  where: {
                    status: {
                      in: ["TERSEDIA", "DIPINJAM"]
                    }
                  },
                  select: {
                    id: true,
                    nomer_seri: true,
                    status: true,
                    lokasi: true,
                  },
                },
              },
            },
            peminjamanSaranaDetail: {
              select: {
                id: true,
                nama_barang: true,
                satuan: true,
                sudah_ambil: true,
                sudah_kembali: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { tanggal_pengajuan: "desc" },
    }),
    prisma.peminjaman.count({ where }),
  ]);

  return { data, total };
};

export const getPeminjamanDetail = async (
  userId: string,
  peminjamanId: string
): Promise<PeminjamanWithItems | null> => {
  return await prisma.peminjaman.findFirst({
    where: { id: peminjamanId, userId },
    include: {
      ormawa: {
        select: {
          id: true,
          nama: true,
        },
      },
      peminjamanPrasarana: {
        include: {
          prasarana: {
            select: {
              nama: true,
              status: true,
            },
          },
        },
      },
      peminjamanSarana: {
        include: {
          sarana: {
            select: {
              nama: true,
              status: true,
              sisa: true,
              jenis: true,
              satuanSatuan: {
                select: {
                  nama: true,
                  singkatan: true,
                },
              },
              detailSarana: {
                where: {
                  status: {
                    in: ["TERSEDIA", "DIPINJAM"]
                  }
                },
                select: {
                  id: true,
                  nomer_seri: true,
                  status: true,
                  lokasi: true,
                },
              },
            },
          },
          peminjamanSaranaDetail: {
            select: {
              id: true,
              nama_barang: true,
              satuan: true,
              sudah_ambil: true,
              sudah_kembali: true,
            },
          },
        },
      },
    },
  });
};

export const updatePeminjamanItems = async (
  userId: string,
  peminjamanId: string,
  items: {
    prasaranaIds?: string[];
    saranaItems?: { saranaId: string; jumlah: number }[];
  }
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      userId,
      status_pengajuan: StatusPengajuan.MENUNGGU_PENINJAUAN,
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau tidak dapat diubah");
  }

  const itemError = await validatePeminjamanItems(
    items.prasaranaIds,
    items.saranaItems
  );
  if (itemError) throw new Error(itemError);

  return await prisma.$transaction(async (tx) => {
    // Delete existing items
    await tx.peminjamanPrasarana.deleteMany({
      where: { peminjamanId },
    });
    await tx.peminjamanSarana.deleteMany({
      where: { peminjamanId },
    });

    // Create new items
    if (items.prasaranaIds?.length) {
      await tx.peminjamanPrasarana.createMany({
        data: items.prasaranaIds.map(prasaranaId => ({
          peminjamanId,
          prasaranaId,
        })),
      });
    }

    if (items.saranaItems?.length) {
      await tx.peminjamanSarana.createMany({
        data: items.saranaItems.map(item => ({
          peminjamanId,
          saranaId: item.saranaId,
          jumlah: item.jumlah,
        })),
      });
    }

    const updated = await tx.peminjaman.findUnique({ 
      where: { id: peminjamanId } 
    });
    
    if (!updated) throw new Error("Peminjaman not found after update");
    return updated;
  });
};

export const confirmPickup = async (
  userId: string,
  peminjamanId: string
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      userId,
      status_pengajuan: StatusPengajuan.PENGAJUAN_DITERIMA,
      status_pengambilan: StatusPengambilan.MENUNGGU_PENGAMBILAN,
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau tidak dapat dikonfirmasi pengambilannya");
  }

  return await prisma.peminjaman.update({
    where: { id: peminjamanId },
    data: {
      status_pengambilan: StatusPengambilan.SUDAH_MENGAMBIL,
      tanggal_pengambilan: new Date(),
      status_pengembalian: StatusPengembalian.MENUNGGU_PENGEMBALIAN,
    },
  });
};

export const confirmReturn = async (
  userId: string,
  peminjamanId: string
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      userId,
      status_pengambilan: StatusPengambilan.SUDAH_MENGAMBIL,
      status_pengembalian: StatusPengembalian.MENUNGGU_PENGEMBALIAN,
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau barang belum diambil. Silakan ambil barang terlebih dahulu.");
  }

  // Validasi tanggal pengembalian - hanya memberikan peringatan jika terlalu awal
  // Tapi tetap mengizinkan konfirmasi pengembalian setelah pengambilan
  const today = new Date();
  const scheduledReturnDate = new Date(peminjaman.tanggal_acara_berakhir!);
  
  today.setHours(0, 0, 0, 0);
  scheduledReturnDate.setHours(0, 0, 0, 0);

  // Hanya memberikan peringatan jika konfirmasi pengembalian dilakukan jauh sebelum jadwal
  if (today < scheduledReturnDate) {
    const formatter = new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    // const formattedReturnDate = formatter.format(scheduledReturnDate);
  }

  return await prisma.peminjaman.update({
    where: { id: peminjamanId },
    data: {
      status_peminjaman: StatusPeminjaman.SELESAI,
      status_pengembalian: StatusPengembalian.SUDAH_MENGEMBALIKAN,
      tanggal_pengembalian: new Date(),
    },
  });
};

// New functions for checklist functionality
export const updatePickupChecklist = async (
  userId: string,
  peminjamanId: string,
  checklist: {
    prasaranaIds?: string[];
    saranaItems?: { saranaId: string; jumlah: number; detailItems?: string[]; customSerials?: string[] }[];
  }
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      userId,
      status_pengajuan: StatusPengajuan.PENGAJUAN_DITERIMA,
      // Commented out for testing: status_pengambilan: StatusPengambilan.MENUNGGU_PENGAMBILAN,
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau tidak dapat diupdate checklistnya");
  }

  return await prisma.$transaction(async (tx) => {
    // Update prasarana checklist - use individual updates to handle duplicates better
    if (checklist.prasaranaIds?.length) {
      for (const prasaranaId of checklist.prasaranaIds) {
        await tx.peminjamanPrasarana.updateMany({
          where: {
            peminjamanId,
            prasaranaId,
          },
          data: {
            sudah_ambil: true,
          },
        });
      }
    }

        // Update sarana checklist
    if (checklist.saranaItems?.length) {
      for (const item of checklist.saranaItems) {
        // Check if this is an existing item or a new one
        const existingItem = await tx.peminjamanSarana.findFirst({
          where: {
            peminjamanId,
            saranaId: item.saranaId,
          },
        });

        let peminjamanSaranaId: string;

        if (existingItem) {
          // Update existing sarana item - use upsert pattern to prevent duplicates
          await tx.peminjamanSarana.update({
            where: {
              id: existingItem.id,
            },
            data: {
              sudah_ambil: true,
              jumlah: item.jumlah, // Allow updating quantity during pickup
              sudah_dipinjam: true, // Mark as borrowed
            },
          });
          peminjamanSaranaId = existingItem.id;
        } else {
          // Create new additional sarana item
          const newItem = await tx.peminjamanSarana.create({
            data: {
              peminjamanId,
              saranaId: item.saranaId,
              jumlah: item.jumlah,
              sudah_ambil: true,
              sudah_dipinjam: false,
              sudah_kembali: false,
            },
          });
          peminjamanSaranaId = newItem.id;
        }

        // Handle detail items for BERNOMOR sarana
        if (item.detailItems?.length || item.customSerials?.length) {
          const serialsToProcess = item.customSerials || item.detailItems || [];
          
          // Always clear existing detail records to prevent duplication
          await tx.peminjamanSaranaDetail.deleteMany({
            where: {
              peminjamanSaranaId,
            },
          });

          // Update detail sarana status to DIPINJAM for actual detail IDs
          if (item.detailItems?.length) {
            await tx.detailSarana.updateMany({
              where: {
                id: { in: item.detailItems },
                saranaId: item.saranaId,
                status: "TERSEDIA",
              },
              data: {
                status: "DIPINJAM",
              },
            });
          }

          // Create detail records for tracking
          for (const serial of serialsToProcess) {
            await tx.peminjamanSaranaDetail.create({
              data: {
                peminjamanSaranaId,
                nama_barang: serial || `Item Tanpa Serial`,
                satuan: "unit",
                sudah_ambil: true,
                sudah_kembali: false,
              },
            });
          }
        }

        // Update sarana stock for TIDAK_BERNOMOR items - check if already processed to prevent duplication
        if (existingItem && !existingItem.sudah_dipinjam) {
          const sarana = await tx.sarana.findUnique({
            where: { id: item.saranaId },
            select: { jenis: true, sisa: true }
          });

          if (sarana?.jenis === "TIDAK_BERNOMOR") {
            await tx.sarana.update({
              where: { id: item.saranaId },
              data: {
                sisa: Math.max(0, sarana.sisa - item.jumlah),
              },
            });
          }
        } else if (!existingItem) {
          // For new additional items
          const sarana = await tx.sarana.findUnique({
            where: { id: item.saranaId },
            select: { jenis: true, sisa: true }
          });

          if (sarana?.jenis === "TIDAK_BERNOMOR") {
            await tx.sarana.update({
              where: { id: item.saranaId },
              data: {
                sisa: Math.max(0, sarana.sisa - item.jumlah),
              },
            });
          }
        }
      }
    }

    // Update main peminjaman status to SUDAH_MENGAMBIL
    await tx.peminjaman.update({
      where: { id: peminjamanId },
      data: {
        status_pengambilan: StatusPengambilan.SUDAH_MENGAMBIL,
        tanggal_pengambilan: new Date(),
      },
    });

    const updated = await tx.peminjaman.findUnique({ 
      where: { id: peminjamanId } 
    });
    
    if (!updated) throw new Error("Peminjaman not found after update");
    return updated;
  });
};

export const updateReturnChecklist = async (
  userId: string,
  peminjamanId: string,
  checklist: {
    prasaranaIds?: string[];
    saranaItems?: { saranaId: string; jumlah?: number; detailItems?: string[] }[];
  }
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      userId,
      status_pengambilan: StatusPengambilan.SUDAH_MENGAMBIL,
    },
    include: {
      peminjamanSarana: {
        include: {
          sarana: true,
        },
      },
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau barang belum diambil. Silakan ambil barang terlebih dahulu.");
  }

  // Validasi tanggal pengembalian - hanya memberikan peringatan jika terlalu awal
  // Tapi tetap mengizinkan pengembalian setelah pengambilan
  const today = new Date();
  const scheduledReturnDate = new Date(peminjaman.tanggal_acara_berakhir!);
  
  today.setHours(0, 0, 0, 0);
  scheduledReturnDate.setHours(0, 0, 0, 0);

  // Hanya memberikan peringatan jika pengembalian dilakukan jauh sebelum jadwal
  // tapi tidak menghalangi pengembalian
  if (today < scheduledReturnDate) {
    const formatter = new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    // const formattedReturnDate = formatter.format(scheduledReturnDate);
  }

  return await prisma.$transaction(async (tx) => {
    // Update prasarana return checklist - prevent duplicate updates
    if (checklist.prasaranaIds?.length) {
      for (const prasaranaId of checklist.prasaranaIds) {
        await tx.peminjamanPrasarana.updateMany({
          where: {
            peminjamanId,
            prasaranaId,
          },
          data: {
            sudah_kembali: true,
          },
        });
      }
    }

    // Update sarana return checklist
    if (checklist.saranaItems?.length) {
      for (const item of checklist.saranaItems) {
        // Get sarana info
        const saranaInfo = await tx.sarana.findUnique({
          where: { id: item.saranaId },
        });

        if (!saranaInfo) {
          throw new Error(`Sarana dengan ID ${item.saranaId} tidak ditemukan`);
        }

        // Update PeminjamanSarana - find specific record to prevent duplicates
        const peminjamanSarana = await tx.peminjamanSarana.findFirst({
          where: {
            peminjamanId,
            saranaId: item.saranaId,
          },
        });

        if (!peminjamanSarana) {
          throw new Error(`PeminjamanSarana dengan ID ${item.saranaId} tidak ditemukan`);
        }

        await tx.peminjamanSarana.update({
          where: {
            id: peminjamanSarana.id,
          },
          data: {
            sudah_kembali: true,
          },
        });

        // Get return quantity - if not specified, assume all items are returned
        const returnQuantity = item.jumlah || 0;

        // Handle BERNOMOR items
        if (item.detailItems?.length && saranaInfo.jenis === "BERNOMOR") {
          // Update detail records for tracking by nama_barang (serial numbers)
          await tx.peminjamanSaranaDetail.updateMany({
            where: {
              peminjamanSarana: {
                peminjamanId,
                saranaId: item.saranaId,
              },
              nama_barang: {
                in: item.detailItems,
              },
            },
            data: {
              sudah_kembali: true,
            },
          });

          // For BERNOMOR items, update the actual DetailSarana records status back to TERSEDIA
          const detailSaranaRecords = await tx.detailSarana.findMany({
            where: {
              saranaId: item.saranaId,
              nomer_seri: { in: item.detailItems },
              status: "DIPINJAM",
            },
          });

          if (detailSaranaRecords.length > 0) {
            await tx.detailSarana.updateMany({
              where: {
                id: { in: detailSaranaRecords.map(d => d.id) },
              },
              data: {
                status: "TERSEDIA",
              },
            });
          }
        } else if (saranaInfo.jenis === "TIDAK_BERNOMOR") {
          // For TIDAK_BERNOMOR items, update stock back
          // Add the returned quantity to available stock
          await tx.sarana.update({
            where: { id: item.saranaId },
            data: {
              sisa: saranaInfo.sisa + returnQuantity,
            },
          });
        }
      }
    }

    // Update main peminjaman status to MENUNGGU_VALIDASI
    await tx.peminjaman.update({
      where: { id: peminjamanId },
      data: {
        status_pengembalian: StatusPengembalian.MENUNGGU_VALIDASI,
        tanggal_pengembalian: new Date(),
      },
    });

    const updated = await tx.peminjaman.findUnique({ 
      where: { id: peminjamanId } 
    });

    return updated!;
  });
};

export const cancelPeminjaman = async (
  userId: string,
  peminjamanId: string
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      userId,
      status_peminjaman: {
        not: StatusPeminjaman.SELESAI,
      },
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau tidak dapat dibatalkan");
  }

  // Extract file ID from webViewLink
  const fileId = peminjaman.url_surat_pengajuan ? extractFileIdFromUrl(peminjaman.url_surat_pengajuan) : null;
  
  // Delete the file from Google Drive
  if (fileId) {
    try {
      await deleteSuratPeminjaman(fileId);
    } catch {
      // Continue with cancellation even if file deletion fails
    }
  }

  return await prisma.peminjaman.update({
    where: { id: peminjamanId },
    data: {
      status_peminjaman: StatusPeminjaman.DIBATALKAN,
      status_pengajuan: StatusPengajuan.DIBATALKAN,
    },
  });
};

// Helper function to extract file ID from Google Drive URL
const extractFileIdFromUrl = (url: string): string | null => {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
};

// Admin Services
export const getAllPeminjaman = async (
  adminId: string,
  params: {
    search?: string;
    status?: StatusPeminjaman;
    statusPengajuan?: StatusPengajuan;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
): Promise<{ data: PeminjamanWithItems[]; total: number }> => {
  // Verify admin role
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access only");
  }

  const { search, status, statusPengajuan, startDate, endDate, page = 1, limit = 10 } = params;

  const where: Prisma.PeminjamanWhereInput = {
    ...(search && {
      OR: [
        { nama_acara: { contains: search } },
        { deskripsi_acara: { contains: search } },
      ],
    }),
    ...(status && { status_peminjaman: status }),
    ...(statusPengajuan && { status_pengajuan: statusPengajuan }),
    ...(startDate && endDate && {
      tanggal_acara_dimulai: { gte: startDate, lte: endDate },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.peminjaman.findMany({
      where,
      include: {
        ormawa: {
          select: {
            id: true,
            nama: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            mahasiswa: true,
            pegawai: true,
          },
        },
        peminjamanPrasarana: {
          include: {
            prasarana: {
              select: {
                nama: true,
                status: true,
              },
            },
          },
        },
        peminjamanSarana: {
          include: {
            sarana: {
              select: {
                nama: true,
                status: true,
                sisa: true,
                jenis: true,
                satuanSatuan: {
                  select: {
                    nama: true,
                    singkatan: true,
                  },
                },
                detailSarana: {
                  where: {
                    status: {
                      in: ["TERSEDIA", "DIPINJAM"]
                    }
                  },
                  select: {
                    id: true,
                    nomer_seri: true,
                    status: true,
                    lokasi: true,
                  },
                },
              },
            },
            peminjamanSaranaDetail: {
              select: {
                id: true,
                nama_barang: true,
                satuan: true,
                sudah_ambil: true,
                sudah_kembali: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { tanggal_pengajuan: "desc" },
    }),
    prisma.peminjaman.count({ where }),
  ]);

  return { data, total };
};

export const getAdminPeminjamanDetail = async (
  adminId: string,
  peminjamanId: string
): Promise<PeminjamanWithItems | null> => {
  // Verify admin role
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access only");
  }

  return await prisma.peminjaman.findUnique({
    where: { id: peminjamanId },
    include: {
      ormawa: {
        select: {
          id: true,
          nama: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          mahasiswa: {
            include: {
              jurusanJurusan: true,
              prodiProdi: true
            }
          },
          pegawai: true,
        },
      },
      peminjamanPrasarana: {
        include: {
          prasarana: {
            select: {
              nama: true,
              status: true,
            },
          },
        },
      },
      peminjamanSarana: {
        include: {
          sarana: {
            select: {
              nama: true,
              status: true,
              sisa: true,
              jenis: true,
              satuanSatuan: {
                select: {
                  nama: true,
                  singkatan: true,
                },
              },
              detailSarana: {
                where: {
                  status: {
                    in: ["TERSEDIA", "DIPINJAM"]
                  }
                },
                select: {
                  id: true,
                  nomer_seri: true,
                  status: true,
                  lokasi: true,
                },
              },
            },
          },
          peminjamanSaranaDetail: {
            select: {
              id: true,
              nama_barang: true,
              satuan: true,
              sudah_ambil: true,
              sudah_kembali: true,
            },
          },
        },
      },
    },
  });
};

export const adminCancelPeminjaman = async (
  adminId: string,
  peminjamanId: string,
  message: string
): Promise<Peminjaman> => {
  // Verify admin role
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access only");
  }

  return await prisma.peminjaman.update({
    where: { id: peminjamanId },
    data: {
      status_peminjaman: StatusPeminjaman.DIBATALKAN,
      status_pengajuan: StatusPengajuan.PENGAJUAN_DITOLAK,
      massage_admin: message,
    },
  });
};

// Update the validatePeminjaman function
export const validatePeminjaman = async (
  adminId: string,
  peminjamanId: string
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      status_peminjaman: StatusPeminjaman.DALAM_PROSES,
      status_pengajuan: StatusPengajuan.MENUNGGU_PENINJAUAN,
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau status tidak valid");
  }

  const updatedPeminjaman = await prisma.peminjaman.update({
    where: { id: peminjamanId },
    data: {
      status_peminjaman: StatusPeminjaman.DITERIMA,
      status_pengajuan: StatusPengajuan.PENGAJUAN_DITERIMA,
      status_pengambilan: StatusPengambilan.MENUNGGU_PENGAMBILAN,
    },
  });

  // Send notification
  await createStatusNotification(
    adminId,
    peminjaman.userId,
    peminjamanId,
    "DITERIMA",
    "Pengajuan peminjaman Anda telah diterima"
  );

  return updatedPeminjaman;
};

// Update the rejectPeminjaman function
export const rejectPeminjaman = async (
  adminId: string,
  peminjamanId: string,
  message: string
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      status_peminjaman: StatusPeminjaman.DALAM_PROSES,
      status_pengajuan: StatusPengajuan.MENUNGGU_PENINJAUAN,
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau status tidak valid");
  }

  const updatedPeminjaman = await prisma.peminjaman.update({
    where: { id: peminjamanId },
    data: {
      status_peminjaman: StatusPeminjaman.DITOLAK,
      status_pengajuan: StatusPengajuan.PENGAJUAN_DITOLAK,
    },
  });

  // Send notification
  await createStatusNotification(
    adminId,
    peminjaman.userId,
    peminjamanId,
    "DITOLAK",
    message
  );

  return updatedPeminjaman;
};

// Update the validatePickup function
export const validatePickup = async (
  adminId: string,
  peminjamanId: string
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      status_peminjaman: StatusPeminjaman.DITERIMA,
      status_pengajuan: StatusPengajuan.PENGAJUAN_DITERIMA,
      status_pengambilan: StatusPengambilan.MENUNGGU_PENGAMBILAN,
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau status tidak valid");
  }

  const updatedPeminjaman = await prisma.peminjaman.update({
    where: { id: peminjamanId },
    data: {
      status_pengambilan: StatusPengambilan.SUDAH_MENGAMBIL,
    },
  });

  // Send notification
  await createStatusNotification(
    adminId,
    peminjaman.userId,
    peminjamanId,
    "DIAMBIL",
    "Barang telah diambil"
  );

  return updatedPeminjaman;
};

// Update the rejectPickup function
export const rejectPickup = async (
  adminId: string,
  peminjamanId: string,
  message: string
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      status_peminjaman: StatusPeminjaman.DITERIMA,
      status_pengajuan: StatusPengajuan.PENGAJUAN_DITERIMA,
      status_pengambilan: StatusPengambilan.MENUNGGU_PENGAMBILAN,
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau status tidak valid");
  }

  const updatedPeminjaman = await prisma.peminjaman.update({
    where: { id: peminjamanId },
    data: {
      status_pengambilan: StatusPengambilan.NULL,
    },
  });

  // Send notification
  await createStatusNotification(
    adminId,
    peminjaman.userId,
    peminjamanId,
    "DITOLAK",
    message
  );

  return updatedPeminjaman;
};

// Update the validateReturn function
export const validateReturn = async (
  adminId: string,
  peminjamanId: string
): Promise<Peminjaman> => {
  const peminjaman = await prisma.peminjaman.findFirst({
    where: {
      id: peminjamanId,
      status_peminjaman: StatusPeminjaman.DITERIMA,
      status_pengajuan: StatusPengajuan.PENGAJUAN_DITERIMA,
      status_pengambilan: StatusPengambilan.SUDAH_MENGAMBIL,
      status_pengembalian: StatusPengembalian.MENUNGGU_VALIDASI,
    },
  });

  if (!peminjaman) {
    throw new Error("Peminjaman tidak ditemukan atau status tidak valid untuk validasi pengembalian");
  }

  const updatedPeminjaman = await prisma.peminjaman.update({
    where: { id: peminjamanId },
    data: {
      status_peminjaman: StatusPeminjaman.SELESAI,
      status_pengembalian: StatusPengembalian.SUDAH_MENGEMBALIKAN,
    },
  });

  // Send notification
  await createStatusNotification(
    adminId,
    peminjaman.userId,
    peminjamanId,
    "SELESAI",
    "Pengembalian barang telah divalidasi dan peminjaman selesai"
  );

  return updatedPeminjaman;
};

// Update the rejectReturn function
export const rejectReturn = async (
  adminId: string,
  peminjamanId: string,
  message: string
): Promise<Peminjaman> => {
  return await prisma.$transaction(async (tx) => {
    const peminjaman = await tx.peminjaman.findFirst({
      where: {
        id: peminjamanId,
        status_peminjaman: StatusPeminjaman.DITERIMA,
        status_pengajuan: StatusPengajuan.PENGAJUAN_DITERIMA,
        status_pengambilan: StatusPengambilan.SUDAH_MENGAMBIL,
        status_pengembalian: StatusPengembalian.MENUNGGU_VALIDASI,
      },
      include: {
        peminjamanSarana: {
          include: {
            sarana: {
              include: {
                detailSarana: true,
              },
            },
          },
        },
        peminjamanPrasarana: true,
      },
    });

    if (!peminjaman) {
      throw new Error("Peminjaman tidak ditemukan atau status tidak valid untuk penolakan pengembalian");
    }

    // Revert item statuses back to DIPINJAM since return was rejected
    for (const peminjamanSarana of peminjaman.peminjamanSarana) {
      const sarana = peminjamanSarana.sarana;
      
      if (sarana.jenis === "BERNOMOR") {
        // For BERNOMOR items, set DetailSarana back to DIPINJAM
        await tx.detailSarana.updateMany({
          where: {
            saranaId: sarana.id,
            status: "TERSEDIA", // Items that were marked as returned
          },
          data: {
            status: "DIPINJAM",
          },
        });
      } else {
        // For TIDAK_BERNOMOR items, reduce stock back (items are still borrowed)
        await tx.sarana.update({
          where: { id: sarana.id },
          data: {
            sisa: Math.max(0, sarana.sisa - peminjamanSarana.jumlah),
          },
        });
      }
    }

    // Update peminjaman status back to waiting for return
    const updatedPeminjaman = await tx.peminjaman.update({
      where: { id: peminjamanId },
      data: {
        status_pengembalian: StatusPengembalian.MENUNGGU_PENGEMBALIAN,
        massage_admin: message,
        tanggal_pengembalian: null, // Clear return date since return was rejected
      },
    });

    // Send notification
    await createStatusNotification(
      adminId,
      peminjaman.userId,
      peminjamanId,
      "PENGEMBALIAN_DITOLAK",
      `Pengembalian ditolak: ${message}. Silakan kembalikan barang kembali.`
    );

    return updatedPeminjaman;
  });
};

/**
 * Get available sarpras options for peminjaman
 */
export async function getAvailableSarprasOptions() {
  try {
    // Get available prasarana
    const prasaranaResult = await prisma.prasarana.findMany({
      where: {
        status: "TERSEDIA"
      },
      select: {
        id: true,
        nama: true,
        lokasi: true,
        kapasitas: true,
        status: true,
      },
      orderBy: {
        nama: "asc"
      }
    });

    // Get available sarana
    const saranaResult = await prisma.sarana.findMany({
      where: {
        status: "TERSEDIA",
      },
      select: {
        id: true,
        nama: true,
        jenis: true,
        sisa: true,
        status: true,
        satuanSatuan: {
          select: {
            nama: true,
            singkatan: true
          }
        }
      },
      orderBy: {
        nama: "asc"
      }
    });

    return {
      success: true,
      message: "Berhasil mengambil data sarpras",
      data: {
        prasarana: prasaranaResult,
        sarana: saranaResult
      }
    };
  } catch {
    return {
      success: false,
      message: "Gagal mengambil data sarpras",
      data: null
    };
  }
}

// Function to check and update overdue return status
export const checkAndUpdateOverdueReturns = async (): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all peminjaman that should have been returned but haven't been
  const overduePeminjaman = await prisma.peminjaman.findMany({
    where: {
      status_pengambilan: StatusPengambilan.SUDAH_MENGAMBIL,
      status_pengembalian: StatusPengembalian.MENUNGGU_PENGEMBALIAN,
      tanggal_acara_berakhir: {
        lt: today
      }
    }
  });

  // Update their status to TERLAMBAT_MENGEMBALIKAN
  if (overduePeminjaman.length > 0) {
    await prisma.peminjaman.updateMany({
      where: {
        id: {
          in: overduePeminjaman.map(p => p.id)
        }
      },
      data: {
        status_pengembalian: StatusPengembalian.TERLAMBAT_MENGEMBALIKAN
      }
    });
  }
};

 