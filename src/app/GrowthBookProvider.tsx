"use client";

import React, { useEffect, useState } from "react";
import { GrowthBook, GrowthBookProvider } from "@growthbook/growthbook-react";

const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io", // Or your self-hosted endpoint
  clientKey:
    process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY ||
    "YOUR_GROWTHBOOK_CLIENT_KEY",
  enableDevMode: true,
});

export default function GBProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    growthbook.loadFeatures().then(() => setReady(true));
  }, []);

  if (!ready) return null; // Or a loading spinner

  return (
    <GrowthBookProvider growthbook={growthbook}>{children}</GrowthBookProvider>
  );
}
