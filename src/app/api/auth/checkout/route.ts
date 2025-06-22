import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Log the checkout activity
    // await prisma.logAplikasi.create({
    //   data: {
    //     userId: session.user.id,
    //     log: "User melakukan checkout dari sistem"
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: "Checkout successful"
    });

  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 