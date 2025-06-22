import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export async function checkRole(requiredRoles?: UserRole[]) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return {
        isAuthenticated: false,
        hasRequiredRole: false,
        role: null,
        userId: null
      };
    }

    // If no specific roles are required, just check authentication
    if (!requiredRoles || requiredRoles.length === 0) {
      return {
        isAuthenticated: true,
        hasRequiredRole: true,
        role: session.user.role,
        userId: session.user.id
      };
    }

    // Check if user has one of the required roles
    const hasRequiredRole = requiredRoles.includes(session.user.role as UserRole);

    return {
      isAuthenticated: true,
      hasRequiredRole,
      role: session.user.role,
      userId: session.user.id
    };

  } catch (error) {
    console.error("[CHECK_ROLE]", error);
    return {
      isAuthenticated: false,
      hasRequiredRole: false,
      role: null,
      userId: null,
      error: "Failed to check role"
    };
  }
} 