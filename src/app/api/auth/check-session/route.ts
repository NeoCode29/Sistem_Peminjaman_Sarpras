import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || !token.sub) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        sessionExpired: true
      });
    }

    // Get user data directly from database
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mahasiswa: {
          select: {
            nim: true,
            jurusanId: true,
            prodiId: true,
          }
        },
        pegawai: {
          select: {
            nomer_induk: true,
            unit_pegawai: true,
          }
        },
        due_blocked: true
      }
    });

    if (!user) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        sessionExpired: true
      });
    }

    // Check if user is blocked
    if (user.due_blocked && new Date() < user.due_blocked) {
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          ...user,
          isBlocked: true,
          blockedUntil: user.due_blocked
        }
      });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        ...user,
        isBlocked: false
      }
    });

  } catch (error) {
    console.error("[CHECK_SESSION_ERROR]", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        isAuthenticated: false,
        user: null
      }, 
      { status: 500 }
    );
  }
} 