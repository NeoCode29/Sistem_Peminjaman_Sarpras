import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          error: "Unauthorized", 
          isAuthenticated: false,
          role: null 
        }, 
        { status: 401 }
      );
    }

    return NextResponse.json({
      isAuthenticated: true,
      role: session.user.role,
      userId: session.user.id,
      email: session.user.email
    });

  } catch (error) {
    console.error("[CHECK_ROLE]", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        isAuthenticated: false,
        role: null 
      }, 
      { status: 500 }
    );
  }
} 