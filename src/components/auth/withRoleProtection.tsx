import { useRBAC } from "@/hooks/useRBAC";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ComponentType, useEffect } from "react";

interface WithRoleProtectionProps {
  requiredRole: UserRole;
}

export function withRoleProtection<P extends object>(
  WrappedComponent: ComponentType<P>,
  { requiredRole }: WithRoleProtectionProps
) {
  return function ProtectedComponent(props: P) {
    const { hasRole, isAuthenticated } = useRBAC();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push("/auth/signin");
        return;
      }

      if (!hasRole(requiredRole)) {
        router.push("/unauthorized");
      }
    }, [isAuthenticated, router, hasRole, requiredRole]);

    if (!isAuthenticated) return null;
    if (!hasRole(requiredRole)) return null;

    return <WrappedComponent {...props} />;
  };
} 