"use server";

import { revalidatePath } from "next/cache";
import {
  CreatePeminjamanInput,
  UpdatePeminjamanInput,
  createPeminjaman,
  updatePeminjaman,
  getPeminjamanList,
  getPeminjamanDetail,
  updatePeminjamanItems,
  confirmPickup,
  confirmReturn,
  cancelPeminjaman,
  updatePickupChecklist,
  updateReturnChecklist,
  getAllPeminjaman,
  getAdminPeminjamanDetail,
  adminCancelPeminjaman,
  validatePeminjaman,
  rejectPeminjaman,
  validatePickup,
  rejectPickup,
  validateReturn,
  rejectReturn,
  // checkAndUpdateOverdueReturns,
  // getAvailableSarprasOptions
} from "@/service/peminjamanService";
import { StatusPeminjaman, StatusPengajuan, Prisma } from "@prisma/client";
// import { SarprasPeminjaman } from "@prisma/client";
import { prisma } from "@/lib/prisma";
// import { uploadSuratPeminjaman, deleteSuratPeminjaman } from "@/lib/drive/peminjamanDrive";
// import {
//   Peminjaman,
//   PeminjamanPrasarana,
//   PeminjamanSarana,
//   Prisma,
//   StatusPengambilan,
//   StatusPengembalian,
//   UserRole,
// } from "@prisma/client";
// import {
//   createStatusNotification,
//   createPickupReminder,
//   createReturnReminder,
//   createLateReturnNotification,
//   createAdminMessageNotification,
//   createAdminNotifications,
// } from "@/service/notificationService";
import { logPeminjamanActivity } from "@/service/logService";
// import { auth } from "@/auth";

// Peminjam Actions
export async function createPeminjamanAction(userId: string, data: CreatePeminjamanInput) {
  try {
    const result = await createPeminjaman({ ...data, userId });
    
    if (result.data) {
      // Log activity
      await logPeminjamanActivity(
        userId,
        'CREATE',
        data.nama_acara,
        result.data.id,
        `Jenis: ${data.sarpras_peminjaman}, Peserta: ${data.jumlah_peserta}`
      )
    }
    
    revalidatePath("/peminjam/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to create peminjaman" };
  }
}

export async function updatePeminjamanAction(userId: string, peminjamanId: string, data: UpdatePeminjamanInput) {
  try {
    const result = await updatePeminjaman(userId, peminjamanId, data);
    revalidatePath("/peminjam/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to update peminjaman" };
  }
}

export async function getPeminjamanListAction(
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
) {
  try {
    const result = await getPeminjamanList(userId, params);
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to get peminjaman list" };
  }
}

export async function getPeminjamanDetailAction(userId: string, peminjamanId: string) {
  try {
    const result = await getPeminjamanDetail(userId, peminjamanId);
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to get peminjaman detail" };
  }
}

export async function updatePeminjamanItemsAction(
  userId: string,
  peminjamanId: string,
  items: {
    prasaranaIds?: string[];
    saranaItems?: { saranaId: string; jumlah: number }[];
  }
) {
  try {
    const result = await updatePeminjamanItems(userId, peminjamanId, items);
    revalidatePath("/peminjam/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to update peminjaman items" };
  }
}

export async function confirmPickupAction(userId: string, peminjamanId: string) {
  try {
    const result = await confirmPickup(userId, peminjamanId);
    revalidatePath("/peminjam/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to confirm pickup" };
  }
}

export async function confirmReturnAction(userId: string, peminjamanId: string) {
  try {
    const result = await confirmReturn(userId, peminjamanId);
    revalidatePath("/peminjam/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to confirm return" };
  }
}

export async function cancelPeminjamanAction(userId: string, peminjamanId: string) {
  try {
    const result = await cancelPeminjaman(userId, peminjamanId);
    revalidatePath("/peminjam/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to cancel peminjaman" };
  }
}

export async function updatePickupChecklistAction(
  userId: string,
  peminjamanId: string,
  checklist: {
    prasaranaIds?: string[];
    saranaItems?: { saranaId: string; jumlah: number; detailItems?: string[] }[];
  }
) {
  try {
    const result = await updatePickupChecklist(userId, peminjamanId, checklist);
    revalidatePath("/peminjam/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to update pickup checklist" };
  }
}

export async function updateReturnChecklistAction(
  userId: string,
  peminjamanId: string,
  checklist: {
    prasaranaIds?: string[];
    saranaItems?: { saranaId: string; jumlah?: number; detailItems?: string[] }[];
  }
) {
  try {
    const result = await updateReturnChecklist(userId, peminjamanId, checklist);
    revalidatePath("/peminjam/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to update return checklist" };
  }
}

// Admin Actions
export async function getAllPeminjamanAction(
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
) {
  try {
    const result = await getAllPeminjaman(adminId, params);
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to get all peminjaman" };
  }
}

// Public calendar view - for all users to see scheduled events
export async function getCalendarEventsAction(
  params: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
) {
  try {
    // Use a service function that doesn't require admin verification
    const { startDate, endDate, limit = 1000 } = params;

    const where: Prisma.PeminjamanWhereInput = {
      ...(startDate && endDate && {
        tanggal_acara_dimulai: { gte: startDate, lte: endDate },
      }),
      // Only show accepted events for public calendar
      status_peminjaman: {
        in: ["DITERIMA", "SELESAI"]
      },
      status_pengajuan: "PENGAJUAN_DITERIMA"
    };

    const data = await prisma.peminjaman.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            number_phone: true,
            role: true,
            pegawai: {
              select: {
                unit_pegawai: true,
              },
            },
          },
        },
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
      take: limit,
      orderBy: { tanggal_acara_dimulai: "asc" },
    });

    return { data: { data, total: data.length }, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to get calendar events" };
  }
}

export async function getAdminPeminjamanDetailAction(adminId: string, peminjamanId: string) {
  try {
    const result = await getAdminPeminjamanDetail(adminId, peminjamanId);
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to get peminjaman detail" };
  }
}

export async function adminCancelPeminjamanAction(adminId: string, peminjamanId: string, message: string) {
  try {
    const result = await adminCancelPeminjaman(adminId, peminjamanId, message);
    revalidatePath("/admin/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to cancel peminjaman" };
  }
}

export async function validatePeminjamanAction(adminId: string, peminjamanId: string) {
  try {
    // Get peminjaman details for logging
    const peminjamanDetail = await getAdminPeminjamanDetail(adminId, peminjamanId);
    
    const result = await validatePeminjaman(adminId, peminjamanId);
    
    if (result && peminjamanDetail) {
      // Log activity
      await logPeminjamanActivity(
        adminId,
        'APPROVE',
        peminjamanDetail.nama_acara,
        peminjamanId,
        'Pengajuan peminjaman disetujui'
      )
    }
    
    revalidatePath("/admin/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to validate peminjaman" };
  }
}

export async function rejectPeminjamanAction(adminId: string, peminjamanId: string, message: string) {
  try {
    // Get peminjaman details for logging
    const peminjamanDetail = await getAdminPeminjamanDetail(adminId, peminjamanId);
    
    const result = await rejectPeminjaman(adminId, peminjamanId, message);
    
    if (result && peminjamanDetail) {
      // Log activity
      await logPeminjamanActivity(
        adminId,
        'REJECT',
        peminjamanDetail.nama_acara,
        peminjamanId,
        `Pengajuan ditolak: ${message}`
      )
    }
    
    revalidatePath("/admin/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to reject peminjaman" };
  }
}

export async function validatePickupAction(adminId: string, peminjamanId: string) {
  try {
    const result = await validatePickup(adminId, peminjamanId);
    revalidatePath("/admin/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to validate pickup" };
  }
}

export async function rejectPickupAction(adminId: string, peminjamanId: string, message: string) {
  try {
    const result = await rejectPickup(adminId, peminjamanId, message);
    revalidatePath("/admin/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to reject pickup" };
  }
}

export async function validateReturnAction(adminId: string, peminjamanId: string) {
  try {
    const result = await validateReturn(adminId, peminjamanId);
    revalidatePath("/admin/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to validate return" };
  }
}

export async function rejectReturnAction(adminId: string, peminjamanId: string, message: string) {
  try {
    const result = await rejectReturn(adminId, peminjamanId, message);
    revalidatePath("/admin/peminjaman");
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to reject return" };
  }
}

// Tambahkan action baru untuk submit pengajuan dengan notifikasi
export async function submitPengajuanAction(formData: FormData) {
  try {
    const userId = formData.get('userId') as string;
    if (!userId) {
      return { error: 'User ID tidak ditemukan' };
    }

    // Get file data
    const file = formData.get('surat_pengajuan') as File;
    const fileName = formData.get('surat_pengajuan_name') as string;



    if (!file || !fileName) {
      return { error: 'Surat pengajuan harus diunggah' };
    }

    // Validate file type
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return { error: 'Surat pengajuan harus berformat PDF' };
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);


    // Get form data
    const namaAcara = formData.get('nama_acara') as string;
    
    // Create descriptive filename: peminjaman-[nama-acara]-[timestamp].pdf
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const sanitizedNamaAcara = namaAcara
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .slice(0, 50); // Limit length
    
    const descriptiveFileName = `peminjaman-${sanitizedNamaAcara}-${timestamp}.pdf`;
    
    

    // Create peminjaman data
    const peminjamanData = {
      userId,
      nama_acara: namaAcara,
      tanggal_acara_dimulai: new Date(formData.get('tanggal_acara_dimulai') as string),
      tanggal_acara_berakhir: new Date(formData.get('tanggal_acara_berakhir') as string),
      jumlah_peserta: parseInt(formData.get('jumlah_peserta') as string),
      deskripsi_acara: formData.get('deskripsi_acara') as string,
      surat_pengajuan: buffer,
      surat_pengajuan_name: descriptiveFileName,
      ormawa: formData.get('ormawa') as string,
      unit_pegawai: formData.get('unit_pegawai') as string,
      sarpras_peminjaman: formData.get('sarpras_peminjaman') as 'SARANA' | 'PRASARANA' | 'BOTH',
      prasaranaIds: JSON.parse(formData.get('prasaranaIds') as string || '[]'),
      saranaItems: JSON.parse(formData.get('saranaItems') as string || '[]'),
    };



    // Create peminjaman
    const result = await createPeminjaman(peminjamanData);
    
    if (result.error) {
      return { error: result.error };
    }

    return { success: true, data: result.data };
  } catch {
    return { error: 'Terjadi kesalahan saat mengirim pengajuan' };
  }
}


