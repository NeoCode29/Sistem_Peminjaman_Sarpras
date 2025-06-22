import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jurusan = await prisma.jurusan.findMany({
      orderBy: {
        nama: 'asc'
      }
    });

    return NextResponse.json(jurusan);
  } catch (error) {
    console.error('Error fetching jurusan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurusan' },
      { status: 500 }
    );
  }
} 