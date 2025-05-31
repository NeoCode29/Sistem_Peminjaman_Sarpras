import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import { prisma } from "./lib/prisma"
import { UserRole } from "@prisma/client"

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

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    email: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  pages: {
    signIn: "/auth/signin"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" && user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true }
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "",
                image: user.image,
                role: "PEMINJAM"
              },
            });
            user.role = newUser.role;
          } else {
            user.role = existingUser.role;
          }
        }
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "signIn" && user) {
        token.role = user.role;
      } else if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
      }
      
      if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true }
        });
        token.role = dbUser?.role || "PEMINJAM";
      }

      return token;
    },
    async session({ session, token }) {
      if (token && token.sub && token.email) {
        session.user.id = token.sub;
        session.user.role = token.role || "PEMINJAM";
        session.user.email = token.email;
      }
      return session;
    }
  }
})