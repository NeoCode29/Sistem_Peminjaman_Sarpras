import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jurusanId = searchParams.get('jurusanId');

    if (!jurusanId) {
      return NextResponse.json(
        { error: 'JurusanId is required' },
        { status: 400 }
      );
    }

    const prodi = await prisma.prodi.findMany({
      where: {
        jurusanId: jurusanId
      },
      orderBy: {
        nama: 'asc'
      }
    });

    return NextResponse.json(prodi);
  } catch (error) {
    console.error('Error fetching prodi:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prodi' },
      { status: 500 }
    );
  }
} 