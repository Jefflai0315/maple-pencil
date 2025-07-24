import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// TODO: Create e database for this
const allowedEmails = [
  "jefflai0315@gmail.com",
  "playingwithpencil@gmail.com",
  "joycenyx@gmail.com",
];
const allowedDomain = "playingwithpencil.art";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // Allow only specific emails
      if (allowedEmails.includes(user.email!)) {
        return true;
      }
      // Allow only specific domain
      if (user.email?.endsWith(`@${allowedDomain}`)) {
        return true;
      }
      // Otherwise, deny access
      return false;
    },
  },
});

export { handler as GET, handler as POST };
