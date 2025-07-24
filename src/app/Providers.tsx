"use client";
import { SessionProvider } from "next-auth/react";
import GBProvider from "./GrowthBookProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GBProvider>{children}</GBProvider>
    </SessionProvider>
  );
}
