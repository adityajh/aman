import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "counselor@deepen.health" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const [user] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            passwordHash: users.passwordHash,
            tenantId: users.tenantId,
            tenantSlug: tenants.slug,
            planTier: tenants.planTier,
            isExempt: tenants.isExempt,
          })
          .from(users)
          .innerJoin(tenants, eq(users.tenantId, tenants.id))
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          tenantId: user.tenantId,
          tenantSlug: user.tenantSlug,
          planTier: user.planTier,
          isExempt: user.isExempt,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
        token.planTier = user.planTier;
        token.isExempt = user.isExempt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.tenantId = token.tenantId as string;
        session.user.tenantSlug = token.tenantSlug as string;
        session.user.planTier = token.planTier as string;
        session.user.isExempt = token.isExempt as boolean;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  }
};
