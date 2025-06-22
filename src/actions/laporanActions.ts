"use server";

import { getLaporanPeminjamanBulanan } from "@/service/laporanService";

export const getLaporanPeminjamanAction = async (currentDate: Date) => {
  try {
    const data = await getLaporanPeminjamanBulanan(currentDate);
    
    return {
      success: true,
      message: "Laporan berhasil diambil",
      data,
    };
  } catch {
    return {
      success: false,
      message: "Gagal mengambil data laporan",
      data: null
    };
  }
}; 