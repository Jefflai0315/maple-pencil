"use client";

import React, { useEffect } from "react";
import { GrowthBook, GrowthBookProvider } from "@growthbook/growthbook-react";

// Must be a GrowthBook SDK *client* key ("sdk-..."). Anything else (e.g. a
// secret admin key) must never be shipped to browsers, so it is ignored.
const rawKey = process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY;
const clientKey = rawKey && rawKey.startsWith("sdk-") ? rawKey : undefined;

const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: clientKey || "",
  enableDevMode: process.env.NODE_ENV === "development",
});

// The page renders straight away with default flag values; flags update in
// place once GrowthBook answers. (Waiting for GrowthBook before rendering
// anything left phones on a blank white page, and for good if the request
// failed or was blocked.)
export default function GBProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!clientKey) return;
    growthbook.loadFeatures({ timeout: 3000 }).catch((error) => {
      console.warn("GrowthBook flags unavailable, using defaults", error);
    });
  }, []);

  return <GrowthBookProvider growthbook={growthbook}>{children}</GrowthBookProvider>;
}
