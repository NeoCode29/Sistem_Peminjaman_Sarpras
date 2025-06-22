import { Metadata } from "next";
import { getLaporanPeminjamanBulanan } from "@/service/laporanService";
import { LaporanClient } from "@/components/admin/LaporanClient";

export const metadata: Metadata = {
  title: "Laporan Peminjaman - Admin Sarpras",
  description: "Laporan peminjaman sarana & prasarana bulanan",
};

export default async function LaporanPage() {
  try {
    // Get current month data as initial data
    const currentDate = new Date();
    const initialData = await getLaporanPeminjamanBulanan(currentDate);

    return <LaporanClient initialData={initialData} />;
  } catch (error) {
    console.error("Error loading laporan page:", error);
    // Return empty data if error
    return <LaporanClient initialData={[]} />;
  }
} 