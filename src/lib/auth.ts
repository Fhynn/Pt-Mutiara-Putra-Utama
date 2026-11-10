import argon2 from "argon2";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";

const credentialsSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(200)
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Email dan password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const limit = await enforceRateLimit({
          action: "admin-login",
          identifier: parsed.data.email,
          limit: 8,
          windowSeconds: 15 * 60
        });
        if (!limit.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        const fallbackHash = await argon2.hash("invalid-account-password", {
          type: argon2.argon2id,
          memoryCost: 19456,
          timeCost: 3,
          parallelism: 1
        });
        const passwordValid = await argon2.verify(
          user?.passwordHash ?? fallbackHash,
          parsed.data.password
        );
        const locked = user?.lockedUntil && user.lockedUntil > new Date();

        if (!user || !passwordValid || !user.isActive || locked) {
          if (user) {
            const failedLoginCount = user.failedLoginCount + 1;
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginCount,
                lockedUntil:
                  failedLoginCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : user.lockedUntil
              }
            });
          }
          await writeAudit({
            actorId: user?.id,
            action: "LOGIN_FAILED",
            entityType: "User",
            entityId: user?.id,
            summary: "Percobaan login admin gagal"
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() }
        });
        await writeAudit({
          actorId: user.id,
          action: "LOGIN_SUCCESS",
          entityType: "User",
          entityId: user.id,
          summary: "Login admin berhasil"
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          mustChangePassword: user.mustChangePassword
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role;
        session.user.permissions = token.permissions ?? [];
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    }
  },
  events: {
    async signOut({ token }) {
      if (token?.id)
        await writeAudit({
          actorId: String(token.id),
          action: "LOGOUT",
          entityType: "User",
          entityId: String(token.id),
          summary: "Logout admin"
        }).catch(() => undefined);
    }
  }
};
