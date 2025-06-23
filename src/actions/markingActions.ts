"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logDashboardActivity } from "@/service/logService";

export interface MarkingEvent {
  id: string;
  nama_acara: string;
  deskripsi?: string | null;
  tanggal_acara_dimulai: Date;
  tanggal_acara_berakhir: Date | null;
  jumlah_peserta?: number | null;
  lokasi?: string | null;
  lokasi_manual?: string | null;
  waktu_mulai?: string | null;
  waktu_berakhir?: string | null;
  status: string;
  unit_pegawai?: string | null;
  user: {
    name?: string | null;
    email?: string | null;
  };
  ormawa?: {
    nama: string;
  } | null;
}

export interface ActionResult<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Get marking events for specific date range
 */
export async function getMarkingEventsAction(
  startDate: Date,
  endDate: Date
): Promise<ActionResult<MarkingEvent[]>> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Akses ditolak. Harap login terlebih dahulu.",
        error: "UNAUTHORIZED"
      };
    }

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
    });

    // Log activity for admin users
    if (session.user.role === "ADMIN") {
      await logDashboardActivity(
        session.user.id,
        'VIEW_MARKING',
        `Melihat marking events dari ${startDate.toISOString()} sampai ${endDate.toISOString()}`
      );
    }

    return {
      success: true,
      message: "Berhasil mengambil data marking",
      data: markingEvents
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal mengambil data marking",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
} 