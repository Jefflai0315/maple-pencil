import GoogleProvider from "next-auth/providers/google";
import { getServerSession, type NextAuthOptions } from "next-auth";
import { NextResponse } from "next/server";

// Shared NextAuth config. It lives here (not in the [...nextauth] route file)
// because Next.js route files may only export route handlers, and the API
// routes need it to read the signed-in user on the server.
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
};

/** The signed-in user's email (lower-cased), or null when signed out. */
export async function getSessionEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  return email ? email.trim().toLowerCase() : null;
}

/** For API routes: the signed-in email, or a 401 response to return as-is. */
export async function requireSessionEmail(): Promise<string | NextResponse> {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }
  return email;
}
