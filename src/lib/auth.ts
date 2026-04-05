import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "counselor@aman.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL || "counselor@aman.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "password123";

        if (credentials?.email === adminEmail && credentials?.password === adminPassword) {
          return { id: "counselor", name: "Counselor", email: adminEmail };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // We will build this next
  }
};
