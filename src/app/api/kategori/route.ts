import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const kategori = await prisma.kategoriSarana.findMany({
      orderBy: {
        nama: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil data kategori",
      data: kategori,
    });
  } catch (error) {
    console.error("[GET /api/kategori]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data kategori",
        data: null,
      },
      { status: 500 }
    );
  }
} 