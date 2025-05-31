import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Paths that require authentication
const PROTECTED_PATHS = [ "/profile", "/peminjaman", "/pengembalian"];

// Paths that require admin role
const ADMIN_PATHS = ["/admin"];

// Paths that require peminjam role
const PEMINJAM_PATHS = ["/peminjam"];

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/auth/signin", "/api/auth"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  
  // Allow access to public paths and assets
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path)) || pathname.startsWith("/icons/")) {
    return NextResponse.next();
  }

  const session = req.auth;

  // Redirect to login if no session and trying to access protected path
  if (!session) {
    if (pathname === "/dashboard" || PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
      return Response.redirect(new URL("/auth/signin", req.url));
    }
    return NextResponse.next();
  }

  // Handle dashboard access based on role
  if (pathname === "/dashboard") {
    const userRole = session.user?.role || "PEMINJAM";
    if (userRole === "ADMIN") {
      return Response.redirect(new URL("/admin", req.url));
    } else {
      return Response.redirect(new URL("/peminjam", req.url));
    }
  }

  // Check admin access
  if (ADMIN_PATHS.some(path => pathname.startsWith(path)) && session.user?.role !== "ADMIN") {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  // Check peminjam access
  if (PEMINJAM_PATHS.some(path => pathname.startsWith(path)) && session.user?.role !== "PEMINJAM") {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  // Profile completion check
  if (session.user?.id && !pathname.startsWith("/auth/create-profile")) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
      const response = await fetch(`${baseUrl}/api/profile/check?userId=${session.user.id}`);
      const data = await response.json();

      if (!data.hasMahasiswaOrPegawai && pathname !== "/auth/create-profile") {
        return Response.redirect(new URL("/auth/create-profile", req.url));
      }
    } catch (error) {
      console.error("Error checking profile status:", error);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};