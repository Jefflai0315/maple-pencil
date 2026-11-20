"use client";

import Script from "next/script";
import { useState } from "react";

// A-Frame + AR.js (~2.3 MB) are only needed here, so they load on this page
// instead of on every page of the site. AR.js needs A-Frame first.
export default function ArTrackingLayout({ children }: { children: React.ReactNode }) {
  const [aframeReady, setAframeReady] = useState(false);
  return (
    <>
      <Script
        src="https://aframe.io/releases/1.2.0/aframe.min.js"
        strategy="afterInteractive"
        onLoad={() => setAframeReady(true)}
      />
      {aframeReady && (
        <Script
          src="https://cdn.jsdelivr.net/gh/jeromeetienne/AR.js@2.1.7/aframe/build/aframe-ar.js"
          strategy="afterInteractive"
        />
      )}
      {children}
    </>
  );
}
