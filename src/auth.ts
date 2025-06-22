import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import { prisma } from "./lib/prisma"
import { UserRole } from "@prisma/client"
import type { Account, Profile, User } from "next-auth"
import type { AdapterUser } from "@auth/core/adapters"
import type { JWT } from "next-auth/jwt"
import { logAuthActivity } from "./service/logService"

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

export const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn(params: { 
      user: User | AdapterUser; 
      account?: Account | null; 
      profile?: Profile; 
      email?: { verificationRequest?: boolean }; 
      credentials?: Record<string, unknown>; 
    }) {
      const { user, account } = params;
      if (!account || !user.email) return false;

      try {
        // Check if user exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          include: { accounts: true }
          });

          if (existingUser) {
          // If this is a Google sign in
          if (account.provider === "google") {
            // Check if they already have a Google account linked
            const existingGoogleAccount = existingUser.accounts.find(
              (acc) => acc.provider === "google"
            );

            if (!existingGoogleAccount) {
              // If no Google account is linked, link this one
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string | null
                },
              });
            }
          }
          
          // Update user info
          await prisma.user.update({
            where: { id: existingUser.id },
              data: {
              name: user.name,
                image: user.image,
              },
            });

          return true;
        }

        // If no user exists, create a new one
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: "PEMINJAM",
            accounts: {
              create: {
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state as string | null
          }
        }
          },
        });

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "signIn" && user) {
        token.role = user.role;
        
        // Log login activity
        if (token.sub) {
          try {
            await logAuthActivity(
              token.sub,
              'LOGIN',
              `Login melalui ${user.email}`
            );
          } catch (error) {
            // Silently fail logging to not affect login flow
          }
        }
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

    async session({ session, token }: { session: DefaultSession, token: JWT }) {
      if (token && token.sub && token.email) {
        session.user = {
          id: token.sub,
          role: token.role || "PEMINJAM",
          email: token.email,
          name: session.user?.name,
          image: session.user?.image
        };
      }
      return session;
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)