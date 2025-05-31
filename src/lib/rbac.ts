import { prisma } from "./prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export async function getUserRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role || UserRole.PEMINJAM;
}

export async function hasRole(userId: string, roleName: UserRole) {
  const role = await getUserRole(userId);
  return role === roleName;
}

export async function getCurrentUserRole() {
  const session = await auth();
  if (!session?.user?.id) return UserRole.PEMINJAM;
  return getUserRole(session.user.id);
}

// Middleware function for role-based route protection
export async function checkRole(roleName: UserRole) {
  const session = await auth();
  if (!session?.user?.id) return false;
  return hasRole(session.user.id, roleName);
} 