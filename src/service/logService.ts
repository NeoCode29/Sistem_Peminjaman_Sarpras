"use server";

import { prisma } from "@/lib/prisma";

export interface LogActivity {
  userId: string;
  action: string;
  module: string;
  details?: string;
  targetId?: string;
  targetName?: string;
}

/**
 * Log aktivitas user ke database
 */
export async function logActivity({
  userId,
  action,
  module,
  details,
  targetId,
  targetName
}: LogActivity): Promise<void> {
  try {
    // Format log message
    let logMessage = `[${module.toUpperCase()}] ${action}`;
    
    if (targetName) {
      logMessage += ` - ${targetName}`;
    }
    
    if (targetId) {
      logMessage += ` (ID: ${targetId})`;
    }
    
    if (details) {
      logMessage += ` | ${details}`;
    }

    // Save to database
    await prisma.logAplikasi.create({
      data: {
        userId,
        log: logMessage,
      },
    });
  } catch {
    console.error("Error creating log entry");
  }
}

/**
 * Log untuk operasi CRUD Sarana
 */
export async function logSaranaActivity(
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
  saranaName: string,
  saranaId?: string,
  details?: string
): Promise<void> {
  await logActivity({
    userId,
    action: getActionDescription(action),
    module: 'SARANA',
    targetId: saranaId,
    targetName: saranaName,
    details
  });
}

/**
 * Log untuk operasi CRUD Prasarana
 */
export async function logPrasaranaActivity(
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
  prasaranaName: string,
  prasaranaId?: string,
  details?: string
): Promise<void> {
  await logActivity({
    userId,
    action: getActionDescription(action),
    module: 'PRASARANA',
    targetId: prasaranaId,
    targetName: prasaranaName,
    details
  });
}

/**
 * Log untuk operasi Peminjaman
 */
export async function logPeminjamanActivity(
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'PICKUP' | 'RETURN' | 'CANCEL',
  eventName: string,
  peminjamanId?: string,
  details?: string
): Promise<void> {
  await logActivity({
    userId,
    action: getActionDescription(action),
    module: 'PEMINJAMAN',
    targetId: peminjamanId,
    targetName: eventName,
    details
  });
}

/**
 * Log untuk operasi User Management
 */
export async function logUserManagementActivity(
  adminId: string,
  action: 'UPDATE_ROLE' | 'APPLY_PUNISHMENT' | 'CANCEL_PUNISHMENT' | 'VIEW_USER',
  targetUserName: string,
  targetUserId?: string,
  details?: string
): Promise<void> {
  await logActivity({
    userId: adminId,
    action: getActionDescription(action),
    module: 'USER_MANAGEMENT',
    targetId: targetUserId,
    targetName: targetUserName,
    details
  });
}

/**
 * Log untuk operasi Authentication
 */
export async function logAuthActivity(
  userId: string,
  action: 'LOGIN' | 'LOGOUT' | 'CREATE_PROFILE',
  details?: string
): Promise<void> {
  await logActivity({
    userId,
    action: getActionDescription(action),
    module: 'AUTH',
    details
  });
}

/**
 * Log untuk operasi Dashboard
 */
export async function logDashboardActivity(
  userId: string,
  action: 'VIEW_STATS' | 'VIEW_CALENDAR' | 'EXPORT_REPORT',
  details?: string
): Promise<void> {
  await logActivity({
    userId,
    action: getActionDescription(action),
    module: 'DASHBOARD',
    details
  });
}

/**
 * Log untuk operasi File/Image
 */
export async function logFileActivity(
  userId: string,
  action: 'UPLOAD' | 'DELETE',
  fileName: string,
  module: 'SARANA' | 'PRASARANA' | 'PEMINJAMAN',
  details?: string
): Promise<void> {
  await logActivity({
    userId,
    action: getActionDescription(action),
    module: `FILE_${module}`,
    targetName: fileName,
    details
  });
}

/**
 * Log untuk operasi Settings
 */
export async function logSettingsActivity(
  userId: string,
  action: 'UPDATE' | 'VIEW',
  settingName: string,
  details?: string
): Promise<void> {
  await logActivity({
    userId,
    action: getActionDescription(action),
    module: 'SETTINGS',
    targetName: settingName,
    details
  });
}

/**
 * Helper function untuk mendapatkan deskripsi action dalam bahasa Indonesia
 */
function getActionDescription(action: string): string {
  const actionMap: Record<string, string> = {
    'CREATE': 'Membuat',
    'UPDATE': 'Memperbarui',
    'DELETE': 'Menghapus',
    'VIEW': 'Melihat',
    'APPROVE': 'Menyetujui',
    'REJECT': 'Menolak',
    'PICKUP': 'Konfirmasi Pengambilan',
    'RETURN': 'Konfirmasi Pengembalian',
    'CANCEL': 'Membatalkan',
    'LOGIN': 'Login',
    'LOGOUT': 'Logout',
    'CREATE_PROFILE': 'Membuat Profil',
    'UPDATE_ROLE': 'Mengubah Role',
    'APPLY_PUNISHMENT': 'Memberikan Hukuman',
    'CANCEL_PUNISHMENT': 'Membatalkan Hukuman',
    'VIEW_USER': 'Melihat Data User',
    'VIEW_STATS': 'Melihat Statistik',
    'VIEW_CALENDAR': 'Melihat Kalender',
    'EXPORT_REPORT': 'Export Laporan',
    'UPLOAD': 'Upload File',
  };

  return actionMap[action] || action;
}

/**
 * Get logs with pagination and filtering
 */
export async function getLogs(params: {
  page?: number;
  limit?: number;
  userId?: string;
  module?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const { page = 1, limit = 50, userId, module, startDate, endDate } = params;

    const where: Record<string, unknown> = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (module) {
      where.log = {
        contains: `[${module.toUpperCase()}]`
      };
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    const [logs, total] = await Promise.all([
      prisma.logAplikasi.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.logAplikasi.count({ where })
    ]);

    return {
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  } catch {
    console.error("Error getting logs");
    return { success: false, message: "Gagal mengambil log" };
  }
}
