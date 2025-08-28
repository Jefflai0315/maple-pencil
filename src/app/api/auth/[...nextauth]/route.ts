import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase, closeConnection } from "../../../utils/mongodb";
import type { MongoClient } from "mongodb";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    async signIn({ user }: { user: { email?: string } }) {
      let clientConnected = false;
      let client: MongoClient | null = null;

      try {
        // Connect to MongoDB
        const { db, client: mongoClient } = await connectToDatabase();
        clientConnected = true;
        client = mongoClient;

        // Check if user email exists in the "user" collection
        const existingUser = await db.collection("user").findOne({
          email: user.email,
        });

        if (existingUser) {
          console.log(`User ${user.email} authenticated successfully`);
          return true;
        }

        // Fallback: Allow specific domain if needed
        const allowedDomain = "playingwithpencil.art";
        if (user.email?.endsWith(`@${allowedDomain}`)) {
          console.log(`User ${user.email} authenticated via domain`);
          return true;
        }

        console.log(
          `User ${user.email} not in database - allowing sign in to create account`
        );
        return true; // Allow sign in so user can be created
      } catch (error) {
        console.error("Database connection error during sign in:", error);
        // Fallback: deny access if database connection fails
        return false;
      } finally {
        if (clientConnected && client) {
          await closeConnection(client);
        }
      }
    },
  },
};

// Use dynamic import to avoid the callable signature issue
const handler = (
  NextAuth as unknown as (
    config: Record<string, unknown>
  ) => (req: Request) => Response
)(authOptions);

// Export the handler for NextAuth
export { handler as GET, handler as POST };
