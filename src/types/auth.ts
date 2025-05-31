import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      email: string;
      name?: string | null;
      image?: string | null;
    }
  }
}

export type { UserRole };

export const ROLES = {
  ADMIN: "ADMIN",
  PEMINJAM: "PEMINJAM",
} as const; 