import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth(async (req) => {
    const { pathname } = req.nextUrl;
    const userId = req.auth?.user?.id;

    // Izinkan akses ke rute autentikasi dan API
    if (
        pathname.startsWith("/api/auth") || 
        pathname === "/auth/signin" ||
        pathname.startsWith("/api/profile/check") ||
        pathname.startsWith( "/icons/" )
    ) {
        return NextResponse.next();
    }

    // Periksa autentikasi untuk rute yang dilindungi
    const isAuthenticated = req.auth;
    const protectedPaths = ["/dashboard", "/profile", "/peminjaman", "/pengembalian", "/auth/create-profile"];
    
    if (!isAuthenticated && protectedPaths.some(path => pathname.startsWith(path))) {
        return Response.redirect(new URL("/auth/signin", req.url));
    }

    // Check profile status using the API route
    if (userId && !pathname.startsWith("/auth/create-profile")) {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
            const response = await fetch(`${baseUrl}/api/profile/check?userId=${userId}`);
            const data = await response.json();

            if (!data.hasMahasiswaOrPegawai && pathname !== "/auth/create-profile") {
                return Response.redirect(new URL("/auth/create-profile", req.url));
            }
            
            if (data.hasMahasiswaOrPegawai && pathname === "/") {
                return Response.redirect(new URL("/dashboard", req.url));
            }
        } catch (error) {
            console.error("Error checking profile status:", error);
        }
    } else if (userId && pathname === "/auth/create-profile") {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
            const response = await fetch(`${baseUrl}/api/profile/check?userId=${userId}`);
            const data = await response.json();

            if (data.hasMahasiswaOrPegawai) {
                return Response.redirect(new URL("/dashboard", req.url));
            }
        } catch (error) {
            console.error("Error checking profile status:", error);
        }
    }
    return NextResponse.next();
});

// Export the config
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};