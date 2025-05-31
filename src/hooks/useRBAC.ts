import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export function useRBAC() {
  const { data: session } = useSession();
  
  const hasRole = (roleName: UserRole) => {
    return session?.user?.role === roleName;
  };

  return {
    role: session?.user?.role || "PEMINJAM",
    hasRole,
    isAdmin: session?.user?.role === "ADMIN",
    isPeminjam: session?.user?.role === "PEMINJAM",
    isAuthenticated: !!session?.user,
  };
} 