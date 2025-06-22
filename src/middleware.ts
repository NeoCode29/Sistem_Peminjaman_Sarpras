import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { protectPeminjamanDetail } from "@/middleware/peminjaman-protection";

// Paths that require authentication
const PROTECTED_PATHS = ["/profile", "/peminjaman", "/pengembalian"];

// Role-based path configurations
const ROLE_PATHS = {
  ADMIN: {
    paths: ["/admin"],
    redirect: "/unauthorized"
  },
  PEMINJAM: {
    paths: ["/peminjam"],
    redirect: "/unauthorized"
  }
};

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/auth/signin", 
  "/api/auth",
  "/api/profile/check",
  "/api/auth/check-role",
  "/api/auth/check-session",
  "/api/auth/checkout",
  "/api/peminjaman/check-ownership"
];

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

  // Get base URL for API calls
  const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;

  // Handle dashboard access based on role
  if (pathname === "/dashboard") {
    const userRole = session.user?.role || "PEMINJAM";
    if (userRole === "ADMIN") {
      return Response.redirect(new URL("/admin", req.url));
    } else {
      return Response.redirect(new URL("/peminjam", req.url));
    }
  }

  // Check role-based access
  const userRole = session.user?.role;
  
  // Check admin paths
  if (ROLE_PATHS.ADMIN.paths.some(path => pathname.startsWith(path)) && userRole !== "ADMIN") {
    return Response.redirect(new URL(ROLE_PATHS.ADMIN.redirect, req.url));
  }

  // Check peminjam paths
  if (ROLE_PATHS.PEMINJAM.paths.some(path => pathname.startsWith(path)) && userRole !== "PEMINJAM") {
    return Response.redirect(new URL(ROLE_PATHS.PEMINJAM.redirect, req.url));
  }

  // Protect peminjaman detail pages
  if (pathname.includes('/peminjaman/') && pathname.split('/').length > 3) {
    const protectionResponse = await protectPeminjamanDetail(req);
    if (protectionResponse.status !== 200) {
      return protectionResponse;
    }
  }

  // Profile completion check - only for specific paths
  if (session.user?.id && 
      !pathname.startsWith("/auth/create-profile") && 
      (pathname.startsWith("/admin") || pathname.startsWith("/peminjam"))) {
    try {
      const profileResponse = await fetch(`${baseUrl}/api/profile/check?userId=${session.user.id}`, {
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      });
      const profileData = await profileResponse.json();

      if (!profileData.hasMahasiswaOrPegawai && pathname !== "/auth/create-profile") {
        return Response.redirect(new URL("/auth/create-profile", req.url));
      }
    } catch (error) {
      console.error("Error checking profile status:", error);
    }
  }

  return NextResponse.next();
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};