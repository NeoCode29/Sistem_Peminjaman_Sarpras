import { NextRequest, NextResponse } from "next/server";
import { getLaporanPeminjamanBulanan } from "@/service/laporanService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    
    if (!dateParam) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const currentDate = new Date(dateParam);
    const data = await getLaporanPeminjamanBulanan(currentDate);

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("Error in laporan API:", error);
    return NextResponse.json({
      success: false,
      message: "Gagal mengambil laporan",
      data: [],
    }, { status: 500 });
  }
} 