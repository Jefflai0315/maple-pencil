declare module "next-auth" {
  interface Session {
    needsSignup?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    needsSignup?: boolean;
  }
}
