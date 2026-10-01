import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "ubk-umrah-secret-production-auth-key-2026",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text", placeholder: "john@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;
        const { identifier, password } = credentials;

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ username: identifier }, { email: identifier }],
            },
          });
          if (!user) return null;

          const isValid = await comparePassword(password, user.passwordHash);
          if (!isValid) return null;

          // Check if marketer account is approved by admin
          if (user.role === "MARKETER" && !user.isApproved) {
            throw new Error("حسابك بانتظار موافقة الإدارة. يرجى التواصل مع المسؤول لتفعيل الحساب.");
          }

          return {
            id: String(user.id),
            name: user.username,
            email: user.email,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
          };
        } catch (err: any) {
          console.error("NextAuth authorize error:", err);
          if (err.message && (err.message.includes("موافقة") || err.message.includes("persetujuan"))) {
            throw err;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.mustChangePassword = (user as any).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
};

