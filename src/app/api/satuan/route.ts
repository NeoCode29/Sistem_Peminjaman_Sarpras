import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const satuan = await prisma.satuan.findMany({
      orderBy: {
        nama: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data satuan",
      data: satuan,
    });
  } catch (error) {
    console.error("[GET /api/satuan]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data satuan",
        data: null,
      },
      { status: 500 }
    );
  }
} 