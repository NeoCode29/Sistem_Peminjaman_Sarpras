import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ hasUser: false, hasMahasiswaOrPegawai: false });
        }

        let hasMahasiswaOrPegawai = false;

        if (user.position === "mahasiswa") {
            const mahasiswa = await prisma.mahasiswa.findUnique({
                where: { userId: user.id },
            });
            hasMahasiswaOrPegawai = mahasiswa !== null;
        } else if (user.position === "pegawai") {
            const pegawai = await prisma.pegawai.findUnique({
                where: { userId: user.id },
            });
            hasMahasiswaOrPegawai = pegawai !== null;
        }

        return NextResponse.json({ hasUser: true, hasMahasiswaOrPegawai });
    } catch (error) {
        console.error("Error checking profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
} 