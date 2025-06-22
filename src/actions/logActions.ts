"use server";

import { getLogs } from "@/service/logService";
import { auth } from "@/auth";

export async function getLogApplicationAction(params: {
  page?: number;
  limit?: number;
  userId?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  try {
    const session = await auth();
    
    // Only admin can view logs
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        message: "Unauthorized - Admin access required",
        data: null
      };
    }

    const { page = 1, limit = 50, userId, module, startDate, endDate } = params;

    // Convert string dates to Date objects
    const filterParams = {
      page,
      limit,
      userId,
      module,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const result = await getLogs(filterParams);
    return result;
  } catch {
    return {
      success: false,
      message: "Gagal mengambil log",
      data: null
    };
  }
}

export async function getLogModulesAction() {
  return {
    success: true,
    data: [
      { value: 'SARANA', label: 'Sarana' },
      { value: 'PRASARANA', label: 'Prasarana' },
      { value: 'PEMINJAMAN', label: 'Peminjaman' },
      { value: 'USER_MANAGEMENT', label: 'Manajemen User' },
      { value: 'AUTH', label: 'Autentikasi' },
      { value: 'DASHBOARD', label: 'Dashboard' },
      { value: 'FILE_SARANA', label: 'File Sarana' },
      { value: 'FILE_PRASARANA', label: 'File Prasarana' },
      { value: 'FILE_PEMINJAMAN', label: 'File Peminjaman' },
      { value: 'SETTINGS', label: 'Pengaturan' },
    ]
  };
} 